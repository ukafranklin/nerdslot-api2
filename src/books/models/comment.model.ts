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
  
  @Entity({ name: 'comments' })
  export class Comment {
    @PrimaryColumn()
    id?: string;
    
    @Column({nullable: false})
    comment: string;

    @Column({nullable: true})
    rating: number;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  