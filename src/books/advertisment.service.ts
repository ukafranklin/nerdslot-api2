import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { handleErrorCatch } from "../utils/helper";
import { EntityManager, Repository } from "typeorm";

import { Advertisment } from "./models/advertisment.model";


@Injectable()
export class AdvertismentService {
    private advertisementRepo: Repository<Advertisment>;
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        this.advertisementRepo = this.entityManager.getRepository(Advertisment);
    }

    async create(data) {
        try {
            const advert = await this.advertisementRepo.save(data);

            return {
                advert,
                message: 'Advert created successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async update(data) {
        try {
            
            const advert = await this.advertisementRepo.findOne({
                where: {
                    id: data.id
                }
            });

            if (!advert) {
                throw new HttpException(
                    {
                      status: HttpStatus.NOT_FOUND,
                      error: `Advert with the id ${data.id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.advertisementRepo.save({
                ...advert,
                ...data,
                id: advert.id
            });

            return {
                advert,
                message: 'Advert updated successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async findOne(data) {
        try {
            const advert = await this.advertisementRepo.findOne({
                where: {
                    id: data.id
                }
            });

            if (!advert) {
                throw new HttpException(
                    {
                      status: HttpStatus.NOT_FOUND,
                      error: `Advert with the id ${data.id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                advert,
                message: 'Fetched advert successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async deleteAdvert(data) {
        try {
            await this.advertisementRepo.delete({
                id: data.id
            });

            return {
                message: 'Advert deleted successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }

    async find() {
        try {
            const adverts = await this.advertisementRepo.find({});

            return {
                adverts,
                message: 'Fetched all adverts successfully'
            }
        } catch(err) {
            handleErrorCatch(err);
        }
    }
}