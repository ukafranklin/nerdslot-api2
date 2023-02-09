import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EntityManager } from 'typeorm';

@Module({
    controllers:[UserController],
    providers: [UserService]
})
export class UsersModule {}
