import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { BooksModule } from './books/books.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

// console.log(config, 'config.....');

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    BooksModule
 ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/v1/users', method: RequestMethod.POST },
        { path: '/v1/users/login', method: RequestMethod.POST },
        { path: '/v1/users/change-password', method: RequestMethod.POST },
        { path: '/v1/users/reset-password/validate-link', method: RequestMethod.POST },
      )
      .forRoutes('v1');
  }
}

