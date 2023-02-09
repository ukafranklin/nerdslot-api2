import {
    HttpException,
    HttpStatus,
    Injectable,
    NestMiddleware,
  } from '@nestjs/common';
  import { Request, Response, NextFunction } from 'express';
  import jwtDecode from 'jwt-decode';
  
  interface MyToken {
    name: string;
    siteId: string;
    email: string;
    exp: number;
    // whatever else is in the JWT.
  }
  @Injectable()
  export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              error: `User not authorized`,
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
        const user = jwtDecode<MyToken>(token);
        const tokenData: any = {
          email: user.email,
          id: user.siteId,
          name: user.name,
        };
        req.query.tokenData = tokenData;
        req.body.tokenData = tokenData;
        req.params.tokenData = tokenData;
        next();
      } catch (err) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: `User not authorized`,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
  