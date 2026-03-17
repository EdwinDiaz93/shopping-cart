import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DBErrors } from '../interfaces';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow('DATABASE_URL'),
    });
    super({ adapter });
  }
  handleDbError(error: DBErrors) {
    console.log(JSON.stringify(error));
    switch (error.code) {
      case 'P2002':
        throw new BadRequestException(
          error.meta.driverAdapterError.cause.originalMessage,
        );
    }
  }
}
