/* eslint-disable prettier/prettier */
import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['done', 'cancelled'])
  status: 'done' | 'cancelled';
}
