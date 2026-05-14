/* eslint-disable prettier/prettier */
import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password: hashed,
      name: dto.name,
      phone: dto.phone,
    });
    const saved = await this.usersRepo.save(user);
    return { message: 'Usuario registrado con éxito', userId: saved.id };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .leftJoinAndSelect('u.roles', 'roles')
      .where('u.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    if (!user.is_active) throw new HttpException('Usuario desactivado', 423);

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.role_name) ?? [],
    });

    return { access_token: token };
  }
}
