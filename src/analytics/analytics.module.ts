import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController, TrackController } from './analytics.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [AnalyticsService, PrismaService],
  controllers: [AnalyticsController, TrackController],
})
export class AnalyticsModule {}
