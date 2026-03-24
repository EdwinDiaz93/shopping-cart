import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  imports: [SharedModule, AuthModule]
})
export class BrandsModule { }
