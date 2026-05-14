/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private rolesRepo: Repository<Role>) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.rolesRepo.findOne({ where: { role_name: dto.role_name } });
    if (exists) throw new ConflictException('role_name ya existe');

    const role = this.rolesRepo.create(dto);
    const saved = await this.rolesRepo.save(role);
    return { message: 'Rol creado con éxito', roleId: saved.id };
  }

  async findAll() {
    try {
      return await this.rolesRepo.find({
        select: ['id', 'role_name', 'description'],
      });
    } catch {
      throw new InternalServerErrorException('Error al obtener roles');
    }
  }
}
