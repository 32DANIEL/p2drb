/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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

@Controller('')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post('crearcita')
  @UseGuards(RolesGuard)
  @Roles('patient', 'doctor')
  async create(
    @Request() req: { user: User },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(req.user.id, dto);
  }

  @Get('citas')
  async list(@Request() req: { user: User }) {
    const userRole = req.user.roles?.[0]?.role_name || 'patient';
    return this.appointmentsService.listAppointments(req.user.id, userRole);
  }

  @Put('citas/actualizarcitas/:idcita')
  @UseGuards(RolesGuard)
  @Roles('doctor')
  async updateStatus(
    @Param('idcita') id: string,
    @Request() req: { user: User },
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, req.user.id, dto);
  }

  @Delete('citas/borrarcita/:idcita')
  @UseGuards(RolesGuard)
  @Roles('patient')
  @HttpCode(204)
  async delete(@Param('idcita') id: string, @Request() req: { user: User }) {
    return this.appointmentsService.deleteAppointment(id, req.user.id);
  }
}
