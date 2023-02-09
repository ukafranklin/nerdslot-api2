import { Book } from 'src/books/models/book.model';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity({ name: 'users' })
  export class User {
    @PrimaryColumn()
    id?: string;
    
    @Column({nullable: false})
    name: string;

    @Column({nullable: true})
    password: string;

    @Column({nullable: false})
    email: string;

    @Column({nullable: true})
    username: string;

    @Column({nullable: true})
    imageUrl: string;

    @Column({nullable: false, default: false})
    isSuspended: boolean;

    @Column({nullable: true})
    country: string;

    @Column({nullable: true})
    token: string;

    @Column({nullable: true})
    tokenCreatedAt: string;

    @OneToMany(type => Book, book => book.user)
    books: Book[];

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
  