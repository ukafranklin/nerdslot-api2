import { Controller, Inject, Get, Req, Post, Put, Delete } from '@nestjs/common';
import { BookService } from './books.service';
import { AdvertismentService } from './advertisment.service';

@Controller('/v1/books')
export class BookController {
    constructor(
        @Inject(BookService)
        @Inject(AdvertismentService)
        private readonly userService: BookService,
        private readonly advertismentService: AdvertismentService,
    ) { }

    @Post('/')
    async createBook(@Req() data: any): Promise<any> {
        return this.userService.createBook(data.body)
    }

    @Put('/')
    async updateBook(@Req() data: any): Promise<any> {
        return this.userService.updateBook(data.body)
    }

    @Delete('/:id')
    async deleteBook(@Req() data: any): Promise<any> {
        return this.userService.deleteBook(data.params)
    }

    @Get('/')
    async fetchBooks(@Req() data: any): Promise<any> {
        return this.userService.getBook(data.query)
    }

    @Get('/:id')
    async getBook(@Req() data: any): Promise<any> {
        return this.userService.getBook(data.params)
    }

    @Post('/category')
    async createCategory(@Req() data: any): Promise<any> {
        return this.userService.createBook(data.body)
    }

    @Put('/category/:id')
    async updateCategory(@Req() data: any): Promise<any> {
        return this.userService.updateCategory(data.body)
    }

    @Delete('/category/:id')
    async deleteCategory(@Req() data: any): Promise<any> {
        return this.userService.deleteCategory(data.params)
    }

    @Post('/advertisment')
    async createAdvertisment(@Req() data: any): Promise<any> {
        return this.advertismentService.create(data.body)
    }

    @Post('/advertisments')
    async updateAdvertisment(@Req() data: any): Promise<any> {
        return this.advertismentService.update(data.body)
    }

    @Get('/advertisments/all')
    async getAdvertisments(@Req() data: any): Promise<any> {
        return this.advertismentService.find()
    }

    @Get('/advertisments/:id')
    async getAdvertisment(@Req() data: any): Promise<any> {
        return this.advertismentService.update(data.params)
    }

    @Delete('/advertisment/:id')
    async deleteAdvertisment(@Req() data: any): Promise<any> {
        return this.advertismentService.update(data.params)
    }
}