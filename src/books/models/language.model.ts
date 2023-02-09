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
  
  @Entity({ name: 'languages' })
  export class Language {
    @PrimaryGeneratedColumn('increment')
    id?: number;
    
    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    isoCode: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  