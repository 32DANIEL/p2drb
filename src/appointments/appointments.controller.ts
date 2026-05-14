/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../users/user.entity';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('patient')
  async create(
    @Request() req: { user: User },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(req.user.id, dto);
  }

  @Get()
  async list(@Request() req: { user: User }) {
    const userRole = req.user.roles?.[0]?.role_name || 'patient';
    return this.appointmentsService.listAppointments(req.user.id, userRole);
  }

  @Patch(':id/estado')
  @UseGuards(RolesGuard)
  @Roles('doctor')
  async updateStatus(
    @Param('id') id: string,
    @Request() req: { user: User },
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('patient')
  async delete(@Param('id') id: string, @Request() req: { user: User }) {
    return this.appointmentsService.deleteAppointment(id, req.user.id);
  }
}
