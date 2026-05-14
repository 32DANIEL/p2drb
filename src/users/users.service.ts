/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
  ) {}

  async findAll() {
    try {
      const users = await this.usersRepo.find();
      return users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        roles: u.roles,
      }));
    } catch {
      throw new InternalServerErrorException('Error al listar usuarios');
    }
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const roles = await this.rolesRepo.find({ where: { role_name: In(dto.roles) } });
    if (roles.length !== dto.roles.length) throw new BadRequestException('roles inválidos');

    user.roles = roles;
    await this.usersRepo.save(user);
    return { message: 'Roles asignados' };
  }
}
