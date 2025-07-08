// src/stores/stores.module.ts
import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService]
})
export class StoresModule {}