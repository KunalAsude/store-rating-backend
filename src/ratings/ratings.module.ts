import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [PrismaModule],
  exports: [RatingsService],
})
export class RatingsModule {}
