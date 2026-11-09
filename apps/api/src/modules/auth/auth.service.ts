import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@evolve/shared';
import { compare, hash } from 'bcryptjs';
import { toUser } from '../../common/utils/to-user';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

const BCRYPT_ROUNDS = 10;
/** Cùng một thông báo cho sai email và sai mật khẩu, để không lộ email nào đã đăng ký. */
const INVALID_CREDENTIALS = 'Sai email hoặc mật khẩu';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new ConflictException('Email đã được dùng');

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, BCRYPT_ROUNDS),
      },
    });
    return this.issueToken(toUser(user));
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issueToken(toUser(user));
  }

  async me(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Phiên đăng nhập không còn hợp lệ');
    return toUser(user);
  }

  private async issueToken(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { accessToken: await this.jwt.signAsync(payload), user };
  }
}
