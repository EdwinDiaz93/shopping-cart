import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { PrismaService } from 'src/shared/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });
      if (!user) throw new InternalServerErrorException(`Something Went Wrong`);
      return payload;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }
}
