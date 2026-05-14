/* eslint-disable prettier/prettier */
import { IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  id_doctor: string;

  @IsDateString()
  datetime: string;

  @IsString()
  reason: string;
}
