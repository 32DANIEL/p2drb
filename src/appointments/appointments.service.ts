/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { User } from '../users/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepo: Repository<Appointment>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async createAppointment(userId: string, dto: CreateAppointmentDto) {
    try {
      const doctor = await this.usersRepo.findOne({ where: { id: dto.id_doctor } });
      if (!doctor) throw new NotFoundException('Doctor no encontrado');

      const appointment = this.appointmentsRepo.create({
        id_user: userId,
        id_doctor: dto.id_doctor,
        datetime: new Date(dto.datetime),
        reason: dto.reason,
        status: 'pending',
      });

      const saved = await this.appointmentsRepo.save(appointment);
      return {
        message: 'Cita creada con éxito',
        citaId: saved.id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al crear cita');
    }
  }

  async listAppointments(userId: string, userRole: string) {
    try {
      let query = this.appointmentsRepo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.user', 'paciente')
        .leftJoinAndSelect('a.doctor', 'medico');

      if (userRole === 'patient') {
        query = query.where('a.id_user = :userId', { userId });
      } else if (userRole === 'doctor') {
        query = query.where('a.id_doctor = :userId', { userId });
      }

      const appointments = await query.getMany();

      return appointments.map((a) => ({
        id: a.id,
        datetime: a.datetime,
        status: a.status,
        reason: a.reason,
        paciente: a.user?.name || a.user?.email,
        doctor: a.doctor?.name || a.doctor?.email,
      }));
    } catch {
      throw new InternalServerErrorException('Error al listar citas');
    }
  }

  async updateStatus(appointmentId: string, userId: string, dto: UpdateStatusDto) {
    try {
      const appointment = await this.appointmentsRepo.findOne({
        where: { id: appointmentId },
      });

      if (!appointment) throw new NotFoundException('Cita no encontrada');

      if (appointment.id_doctor !== userId) {
        throw new ForbiddenException('No autorizado');
      }

      if (appointment.status !== 'pending') {
        throw new BadRequestException('Transición de estado no permitida');
      }

      appointment.status = dto.status;
      await this.appointmentsRepo.save(appointment);

      return { message: 'Estado actualizado' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al actualizar estado');
    }
  }

  async deleteAppointment(appointmentId: string, userId: string) {
    try {
      const appointment = await this.appointmentsRepo.findOne({
        where: { id: appointmentId },
      });

      if (!appointment) throw new NotFoundException('Cita no encontrada');
      if (appointment.id_user !== userId) throw new ForbiddenException('No autorizado');

      await this.appointmentsRepo.delete(appointmentId);

      return { message: 'Cita eliminada' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al eliminar cita');
    }
  }
}
