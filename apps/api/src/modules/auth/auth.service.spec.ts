import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User as UserRow } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

function setup() {
  const rows = new Map<string, UserRow>();
  const prisma = {
    user: {
      findUnique: jest.fn(({ where }: { where: { email?: string; id?: string } }) =>
        Promise.resolve(
          [...rows.values()].find((u) => u.email === where.email || u.id === where.id) ?? null,
        ),
      ),
      create: jest.fn(({ data }: { data: Pick<UserRow, 'name' | 'email' | 'passwordHash'> }) => {
        const row: UserRow = {
          id: `u${rows.size + 1}`,
          avatarUrl: null,
          createdAt: new Date('2026-11-09T00:00:00Z'),
          updatedAt: new Date('2026-11-09T00:00:00Z'),
          ...data,
        };
        rows.set(row.id, row);
        return Promise.resolve(row);
      }),
    },
  } as unknown as PrismaService;
  const jwt = new JwtService({ secret: 'test-secret' });
  return { service: new AuthService(prisma, jwt), jwt, rows };
}

describe('AuthService', () => {
  it('register băm mật khẩu, trả token và user không có passwordHash', async () => {
    const { service, jwt, rows } = setup();
    const res = await service.register({ name: 'An', email: 'an@x.dev', password: 'password123' });

    expect(res.user).toEqual({
      id: 'u1',
      name: 'An',
      email: 'an@x.dev',
      avatarUrl: null,
      createdAt: '2026-11-09T00:00:00.000Z',
    });
    expect(res.user).not.toHaveProperty('passwordHash');
    expect(rows.get('u1')?.passwordHash).not.toBe('password123');
    expect(jwt.verify<{ sub: string }>(res.accessToken).sub).toBe('u1');
  });

  it('register email đã có → 409', async () => {
    const { service } = setup();
    await service.register({ name: 'An', email: 'an@x.dev', password: 'password123' });
    await expect(
      service.register({ name: 'B', email: 'an@x.dev', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login đúng mật khẩu trả token; sai mật khẩu hoặc sai email → 401 cùng thông báo', async () => {
    const { service, rows } = setup();
    rows.set('u9', {
      id: 'u9',
      name: 'Chi',
      email: 'chi@x.dev',
      avatarUrl: null,
      passwordHash: await hash('password123', 4),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({ email: 'chi@x.dev', password: 'password123' }),
    ).resolves.toHaveProperty('accessToken');
    await expect(service.login({ email: 'chi@x.dev', password: 'sai' })).rejects.toThrow(
      new UnauthorizedException('Sai email hoặc mật khẩu'),
    );
    await expect(service.login({ email: 'none@x.dev', password: 'password123' })).rejects.toThrow(
      new UnauthorizedException('Sai email hoặc mật khẩu'),
    );
  });
});
