// auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, tenantName: string) {
    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: { name: tenantName },
    });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        tenantId: tenant.id,
      },
    });

    // Sign JWT
    const payload = { sub: user.id, tenantId: tenant.id };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const payload = { sub: user.id, tenantId: user.tenantId };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
