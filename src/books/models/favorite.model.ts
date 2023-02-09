import { User } from '../../users/user.model';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
  } from 'typeorm';
import { Book } from './book.model';
  
  @Entity({ name: 'favorites' })
  export class Favorite {
    @PrimaryColumn()
    id?: string;
    
    @ManyToOne(type => User)
    user: User;

    @ManyToOne(type => Book)
    book: Book;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  