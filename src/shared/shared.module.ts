import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './services/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  providers: [PrismaService, MailService],
  exports: [PrismaService, MailService],
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow('SMTP_HOST'),
          auth: {
            user: configService.getOrThrow('SMTP_USER'),
            pass: configService.getOrThrow('SMTP_PASS'),
          },
        },
      }),
    }),
  ],
})
export class SharedModule {}
