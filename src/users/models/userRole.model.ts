import {
    Entity,
    PrimaryColumn,
  } from 'typeorm';
  
  @Entity({ name: 'userRoles' })
  export class UserRole {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    roleId: number;

    isPrimary: boolean;
  }
  