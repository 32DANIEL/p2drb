/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
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
      if (!doctor) throw new BadRequestException('no se puede procesar solicitud');

      const appointment = this.appointmentsRepo.create({
        id_user: userId,
        id_doctor: dto.id_doctor,
        datetime: new Date(dto.datetime),
        reason: dto.reason,
        status: 'pending',
      });

      const saved = await this.appointmentsRepo.save(appointment);
      return {
        message: 'se crea cita',
        citaId: saved.id,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('no se puede procesar solicitud');
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

      const citas = appointments.map((a) => ({
        id: a.id,
        datetime: a.datetime,
        status: a.status,
        reason: a.reason,
        paciente: a.user?.name || a.user?.email,
        doctor: a.doctor?.name || a.doctor?.email,
      }));

      return { message: 'se muestran citas segun validación de acceso', citas };
    } catch {
      throw new BadRequestException('bad request');
    }
  }

  async updateStatus(appointmentId: string, userId: string, dto: UpdateStatusDto) {
    try {
      const appointment = await this.appointmentsRepo.findOne({
        where: { id: appointmentId },
      });

      if (!appointment) throw new NotFoundException('no encontrado');

      if (appointment.id_doctor !== userId || appointment.status !== 'pending') {
        throw new ConflictException('conflicto entre recursos');
      }

      appointment.status = dto.status;
      await this.appointmentsRepo.save(appointment);

      return { message: 'se actualiza cita seleccionada' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('conflicto entre recursos');
    }
  }

  async deleteAppointment(appointmentId: string, userId: string) {
    try {
      const appointment = await this.appointmentsRepo.findOne({
        where: { id: appointmentId },
      });

      if (!appointment) throw new NotFoundException('no encontrado');
      if (appointment.id_user !== userId) throw new ConflictException('conflicto entre recursos');

      await this.appointmentsRepo.delete(appointmentId);

      return { message: 'se borra cita seleccionada' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('conflicto entre recursos');
    }
  }
}
