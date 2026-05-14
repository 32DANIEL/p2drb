/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'role_name es requerido' })
  @IsString()
  role_name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
