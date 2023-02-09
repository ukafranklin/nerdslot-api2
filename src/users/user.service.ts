import { EntityManager, In, Repository } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as shortid from 'shortid';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { User } from "./user.model";
import { UserRole } from './models/userRole.model';
import { Role } from './models/role.model';
import { createHash, generateAuthToken, getDiffBetweenTwoDatesInMinutes, handleErrorCatch, sendEmail } from '../utils/helper';
import { config } from '../config';

@Injectable()
export class UserService {
    private userRepo: Repository<User>;
    private roleRepo: Repository<Role>;

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        this.userRepo = this.entityManager.getRepository(User);
        this.roleRepo = this.entityManager.getRepository(Role);
    }

    async createUser(data: any) {
        try {
            if (!data.email) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Email is required'
                }, HttpStatus.BAD_REQUEST);
            }

            if (!data.password) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Password is required'
                }, HttpStatus.BAD_REQUEST);
            }
            if (!data.name) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Name is required'
                }, HttpStatus.BAD_REQUEST);
            }

            const email = await this.userRepo.findOne({
                where: {
                    email: data.email
                },
            });

            if (email) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Email already used'
                }, HttpStatus.BAD_REQUEST);
            }

            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(data.password, salt);
            const user = await this.userRepo.save({
                ...data,
                password: hash,
                id: shortid(),
            });

            delete user.password;

            const token = generateAuthToken(user)

            return {
                user: {
                    id:  user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    status: user.isSuspended ? 'pending' : 'approved'
                },
                message: 'Account Created Successfully',
                token
            }


        } catch (err) {
            handleErrorCatch(err)
        }
    }

    async login(data: any): Promise<any> {
        try {
            const user = await this.userRepo.findOne({
                where: {
                    email: data.email.toLowerCase(),
                }
            });

            if (!user) {
                throw new HttpException(
                    {
                        status: HttpStatus.UNAUTHORIZED,
                        error: `Invalid email or password`,
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const isValid = await bcrypt.compare(data.password, user.password);
            if (isValid) {
                const { password, ...result } = user;
                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    },
                    config.secret,
                );


                return {
                    ...result,
                    message: 
                    token,
                };
            }
            else {
                throw new HttpException(
                    {
                        status: HttpStatus.UNAUTHORIZED,
                        error: `Invalid email or password`,
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }
        } catch (err) {
            handleErrorCatch(err);
        }
    }

    async fetchUsersById(data) {
      try {
        const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndMapMany("user.user_role", UserRole, 'user_roles', 'user.id = user_roles.userId')
        .leftJoinAndMapMany("user.role", Role, 'roles', 'user_roles.roleId = roles.id')
        .select(['user'])
        .addSelect([
            'roles',
        ])
        .getOne();

        return {
            user
        };
      } catch (err) {
        handleErrorCatch(err);
      }
    }


    async updateUser(data) {
        try {
            const user = await this.userRepo.findOne({
                where: {
                    id: data.userId
                }
            });

            if (!user) {
                throw new HttpException({
                    status: HttpStatus.NOT_FOUND,
                    error: `User not found`,
                }, HttpStatus.NOT_FOUND); 
            }

            const editableField = {
                name: data.name,
                phone: data.phone
            }
            if (data.name) {
                editableField.name = data.name
            }


            await this.userRepo.save({
                ...user,
                id: user.id,
                ...editableField
            });

            return {
                success: true
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }


    async toggleUserSuspension(data) {
        try {
            const user = await this.userRepo.findOne({
                where: {
                    id: data.userId,
                }
            });

            if (user) {
                await this.userRepo.save({
                    id: data.userId,
                    isSuspended: !user.isSuspended
                });

                return {
                    success: true
                }
            }

            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `User not found`,
            }, HttpStatus.NOT_FOUND);

        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async validateLink(token: string): Promise<{
        id: string;
        name: string;
      }> {
        try {
          const TWO_HOURS_IN_MINUTES = 120;
          const user = await this.userRepo.findOne({
            where: {
              token,
            },
          });
    
          if (!user) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: `Invalid token`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
    
          const minutesAway = getDiffBetweenTwoDatesInMinutes(
            user.tokenCreatedAt,
            new Date().toISOString(),
          );
          if (minutesAway > TWO_HOURS_IN_MINUTES) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: `Link has expired`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
    
          return {
            id: user.id,
            name: user.name,
          };
        } catch (err) {
          if (
            err.status === HttpStatus.UNAUTHORIZED ||
            err.status === HttpStatus.BAD_REQUEST
          ) {
            throw new HttpException(
              {
                status: err.status,
                error: err.response.error,
              },
              err.status,
            );
          }
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `An error occured with the message: ${err.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    

    async resetPassword(token: string, password: string) {
        try {
          const user = await this.validateLink(token);
          const saltRounds = 10;
          const salt = bcrypt.genSaltSync(saltRounds);
          const hash = bcrypt.hashSync(password, salt);
          await this.userRepo.save({
            ...user,
            password: hash,
            token: null,
            tokenCreatedAt: null,
          });
          return {
            success: true,
            message: 'User password updated successfully',
          };
        } catch (err) {
          if (
            err.status === HttpStatus.UNAUTHORIZED ||
            err.status === HttpStatus.BAD_REQUEST
          ) {
            throw new HttpException(
              {
                status: err.status,
                error: err.response.error,
              },
              err.status,
            );
          }
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `An error occured with the message: ${err.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      async changePassword(data: any) {
        try {
          const user = await this.userRepo.findOne({
            where: {
              email: data.tokenData.email,
            },
          });
    
          if (user) {
            const isValid = await bcrypt.compare(data.oldPassword, user.password);
            if (isValid) {
              const saltRounds = 10;
              const salt = bcrypt.genSaltSync(saltRounds);
              const hash = bcrypt.hashSync(data.password, salt);
              await this.userRepo.save({
                ...user,
                password: hash,
              });
              return {
                success: true,
                message: 'User password updated successfully',
              };
            }
          }
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              error: `Invalid old password`,
            },
            HttpStatus.UNAUTHORIZED,
          );
        } catch (err) {
          if (
            err.status === HttpStatus.UNAUTHORIZED ||
            err.status === HttpStatus.BAD_REQUEST
          ) {
            throw new HttpException(
              {
                status: err.status,
                error: err.response.error,
              },
              err.status,
            );
          }
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `An error occured with the message: ${err.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      async findUser(email: string) {
        try {
          const user = await this.userRepo.findOne({
            where: { email },
          });
    
          if (!user) {
            throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: `User not found`,
              },
              HttpStatus.NOT_FOUND,
            );
          }
    
          return user;
        } catch (err) {
          if (
            err.status === HttpStatus.NOT_FOUND ||
            err.status === HttpStatus.BAD_REQUEST
          ) {
            throw new HttpException(
              {
                status: err.status,
                error: err.response.error,
              },
              err.status,
            );
          }
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `An error occured with the message: ${err.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

    async sendResetPasswordToken(email: string) {
        try {
          const user = await this.findUser(email);
          const code = Math.floor(100000 + Math.random() * 900000); // random 6 digit number
          await sendEmail(email, user.name, code);
    
          await this.userRepo.save({
            ...user,
            tokenCreatedAt: new Date().toISOString(),
            token: code.toString()
          });
    
          return {
            success: true,
            message: 'An email with your One TIme Password has been sent, Kindly copy the code to reset your password.',
          };
        } catch (err) {
          if (
            err.status === HttpStatus.UNAUTHORIZED ||
            err.status === HttpStatus.BAD_REQUEST
          ) {
            throw new HttpException(
              {
                status: err.status,
                error: err.response.error,
              },
              err.status,
            );
          }
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `An error occured with the message: ${err.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    }

    async createRole(data) {
        try {
            const role = await this.roleRepo.save({
                ...data
            });

            return {
                message: 'Role created successfully',
                role
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async updateRole(data) {
        try {
            const role = await this.roleRepo.find({
                where: {
                    id: data.id
                }
            });

            if (!role) {
                throw new HttpException(
                    {
                      status: HttpStatus.NOT_FOUND,
                      error: `role with id ${data.id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                  );
            }

            await this.roleRepo.save({
                ...data,
                id: data.id
            });

            return {
                message: 'Role updated successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async deleteRole(data) {
        try {
            await this.roleRepo.delete({
                id: data.id
            });

            return {
                message: 'Role deleted successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async fetchRole(data) {
        try {
            const role = await this.roleRepo.find({
                where: {
                    id: data.id
                }
            });

            if (!role) {
                throw new HttpException(
                    {
                      status: HttpStatus.NOT_FOUND,
                      error: `role with id ${data.id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                  );
            }

            return {
                role
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async fetchRoles() {
        try {
            const roles = await this.roleRepo.find();

            return {
                roles
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }
}