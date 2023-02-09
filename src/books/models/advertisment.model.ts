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
  
  @Entity({ name: 'advertisments' })
  export class Advertisment {
    @PrimaryColumn()
    id?: string;
    
    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    link: string;

    @Column({nullable: false})
    adImage: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  