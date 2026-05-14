/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: { user: User }) {
    const u = await this.usersService.findById(req.user.id);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      roles: u.roles,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.usersService.assignRoles(id, dto);
  }
}
