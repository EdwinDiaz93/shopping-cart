import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [ConfigModule, SharedModule, AuthModule],
})
export class RolesModule {}
