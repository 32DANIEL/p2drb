/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.rolesService.findAll();
  }
}
