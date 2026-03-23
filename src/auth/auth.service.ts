import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService, PrismaService } from 'src/shared/services';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginDto,
  RegisterhDto,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, ValidRoles } from './interfaces';
import { nanoid } from 'nanoid';
import { IncomingHttpHeaders } from 'http2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }
  async login(headers: IncomingHttpHeaders, loginDto: LoginDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: loginDto.email },
      });

      // validar existencia de usuario aqui
      if (!user) throw new UnauthorizedException(`Invalid Credentials`);

      if (!(await bcrypt.compare(loginDto.password, user.password)))
        throw new UnauthorizedException(`Invalid Credentials`);
      const { password, ...restUser } = user;

      return {
        ...restUser,
        access_token: await this.generateToken(
          {
            ...restUser
          },
          headers,
          false,
        ),
        refresh_token: await this.generateToken(
          {
            ...restUser,
          },
          headers,
          true,
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async register(headers: IncomingHttpHeaders, registerDto: RegisterhDto) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const defaultRol = await tx.rol.findUnique({
          where: { name: ValidRoles.User },
        });

        if (!defaultRol) {
          throw new BadRequestException('El rol por defecto no existe');
        }

        const user = await tx.user.create({
          data: {
            ...registerDto,
            password: await bcrypt.hash(registerDto.password, 10),
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        await tx.userRol.create({
          data: {
            rolId: defaultRol.id,
            userId: user.id,
          },
        });
        return {
          user,
        };
      });
      return {
        ...result.user,
        access_token: await this.generateToken(
          {
            ...result.user,

          },
          headers,
          false,
        ),
        refresh_token: await this.generateToken(
          {
            ...result.user,
          },
          headers,
          true,
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async changePassword(user: JwtPayload, changePasswordDto: ChangePasswordDto) {
    try {
      let userDb = await this.prismaService.user.findUnique({
        where: { id: user.id },
      });
      if (!userDb) throw new InternalServerErrorException('Invalid Session');

      if (
        !(await bcrypt.compare(changePasswordDto.oldPassword, userDb.password))
      )
        throw new BadRequestException(`The old password doesn't match`);

      await this.prismaService.user.update({
        where: {
          email: userDb.email,
        },
        data: {
          password: await bcrypt.hash(changePasswordDto.newPassword, 10),
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: forgotPasswordDto.email },
      });

      if (user) {
        const token = nanoid(64);
        const expiresAt = new Date();
        // expira en una hora
        expiresAt.setHours(expiresAt.getHours() + 1);

        await this.prismaService.resetToken.create({
          data: { userId: user.id, token, expiresAt },
        });
        await this.mailService.sendEmail(user.email, token);
      }
      return {
        message: 'If this is a valid account you will receive a email',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async resetPasswordDto(resetPasswordDto: ResetPasswordDto) {
    try {
      const resetToken = await this.prismaService.resetToken.findFirst({
        where: {
          token: resetPasswordDto.token,
          expiresAt: { gt: new Date() },
        },
      });
      if (!resetToken) throw new BadRequestException('Token expires');

      await this.prismaService.user.update({
        where: { id: resetToken.userId },
        data: {
          password: await bcrypt.hash(resetPasswordDto.newPassword, 10),
        },
      });
      await this.prismaService.resetToken.delete({
        where: { id: resetToken.id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async getProfile(user: JwtPayload) {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const userDb = await this.prismaService.user.findUnique({
          where: { email: user?.email },
          select: { email: true, name: true, createdAt: true, updatedAt: true },
        });
        const roles = await this.prismaService.userRol.findMany({ where: { userId: user.id }, include: { rol: true } })

        const permissionsDB = await this.prismaService.rolPermission.findMany({ where: { rolId: { in: roles.map(rol => rol.rolId) } }, include: { permission: true } })

        return { ...userDb, roles: roles.map(rol => rol.rol.name), permissions: permissionsDB.map(per => per.permission.name) }
      })

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async refreshToken(headers: IncomingHttpHeaders) {
    try {
      const refreshToken = headers['refresh_token']! as string;

      const { sessionId, iat, exp, ...payload } =
        await this.jwtService.verifyAsync(refreshToken);

      if (!sessionId) throw new UnauthorizedException('Invalid Session');

      const session = await this.prismaService.session.findFirst({
        where: { id: sessionId, expiresAt: { gt: new Date() } },
      });

      if (!session) throw new UnauthorizedException('Invalid Session');

      if (!(await bcrypt.compare(refreshToken, session.token)))
        throw new UnauthorizedException('Invalid Session');

      let expiresAt = new Date();

      expiresAt.setHours(expiresAt.getHours() + 24);

      const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refresh_token = this.jwtService.sign(
        { ...payload, sessionId },
        { expiresIn: '1d' },
      );

      await this.prismaService.session.update({
        where: { id: sessionId },
        data: {
          expiresAt,
          token: await bcrypt.hash(refresh_token, 10),
        },
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      if (error['name'] && error['name'] === 'JsonWebTokenError')
        throw new UnauthorizedException(error['message']);

      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  private async generateToken(
    payload: JwtPayload,
    headers: IncomingHttpHeaders,
    isRefreshToken: boolean = false,
  ) {
    if (!isRefreshToken)
      return this.jwtService.sign(payload, { expiresIn: '1h' });

    let expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const session = await this.prismaService.session.create({
      data: {
        token: '',
        expiresAt,
        userAgent: headers['user-agent'] || '',
        userId: payload.id,
      },
    });

    const token = await this.jwtService.signAsync(
      {
        ...payload,
        sessionId: session.id,
      },
      { expiresIn: '1d' },
    );

    await this.prismaService.session.update({
      where: { id: session.id },
      data: { token: await bcrypt.hash(token, 10) },
    });

    return token;
  }
}
