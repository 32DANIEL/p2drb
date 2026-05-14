/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  id_user: string;

  @Column()
  id_doctor: string;

  @Column()
  datetime: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'cancelled', 'done'],
    default: 'pending',
  })
  status: 'pending' | 'cancelled' | 'done';

  @Column()
  reason: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    eager: true,
  })
  doctor: User;
}
