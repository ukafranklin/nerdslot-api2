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
  
  @Entity({ name: 'roles' })
  export class Role {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    
    @Column({nullable: false})
    name: string;

    @Column({nullable: true})
    description: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  