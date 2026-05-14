/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  role_name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
