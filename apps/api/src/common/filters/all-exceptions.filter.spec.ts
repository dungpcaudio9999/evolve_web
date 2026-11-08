import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter, type ApiErrorBody } from './all-exceptions.filter';

function run(exception: unknown) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const host = {
    switchToHttp: () => ({ getRequest: () => ({ url: '/x' }), getResponse: () => res }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  const [[status]] = res.status.mock.calls as [[number]];
  const [[body]] = res.json.mock.calls as [[ApiErrorBody]];
  return { status, body };
}

describe('AllExceptionsFilter', () => {
  it('giữ status và message của HttpException', () => {
    const { status, body } = run(new NotFoundException('Không có issue'));
    expect(status).toBe(404);
    expect(body).toMatchObject({ statusCode: 404, message: 'Không có issue', path: '/x' });
  });

  it('giữ errors theo từng trường nếu có', () => {
    const { body } = run(
      new BadRequestException({ message: 'Sai dữ liệu', errors: { title: ['Bắt buộc'] } }),
    );
    expect(body.errors).toEqual({ title: ['Bắt buộc'] });
  });

  it('chuyển lỗi Prisma P2002 thành 409', () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'x',
    });
    const { status, body } = run(err);
    expect(status).toBe(409);
    expect(body.message).toBe('Dữ liệu đã tồn tại');
  });

  it('lỗi không lường trước trả 500, không lộ chi tiết', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { status, body } = run(new Error('secret stack'));
    expect(status).toBe(500);
    expect(body.message).toBe('Lỗi máy chủ');
    spy.mockRestore();
  });
});
