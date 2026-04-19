import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AnalyticsService,
  DeviceBreakdown,
  OverviewResult,
  TimeseriesPoint,
  TopPage,
} from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class TrackDto {
  profileId: string;
  path: string;
  sessionDurationMs?: number;
  device?: 'desktop' | 'mobile' | 'tablet';
  uniqueVisitorId?: string | null;
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async overview(
    @Req() req: any,
    @Query('profileId') profileId: string,
    @Query('range') range?: string,
  ): Promise<OverviewResult> {
    return this.analyticsService.getOverview(profileId, req.user['id'], range);
  }

  @Get('timeseries')
  async timeseries(
    @Req() req: any,
    @Query('profileId') profileId: string,
    @Query('range') range?: string,
    @Query('interval') _interval?: string,
  ): Promise<TimeseriesPoint[]> {
    return this.analyticsService.getTimeseries(
      profileId,
      req.user['id'],
      range,
    );
  }

  @Get('top-pages')
  async topPages(
    @Req() req: any,
    @Query('profileId') profileId: string,
    @Query('limit') limit = '10',
    @Query('range') range?: string,
  ): Promise<TopPage[]> {
    return this.analyticsService.getTopPages(
      profileId,
      req.user['id'],
      Number(limit),
      range,
    );
  }

  @Get('devices')
  async devices(
    @Req() req: any,
    @Query('profileId') profileId: string,
    @Query('range') range?: string,
  ): Promise<DeviceBreakdown[]> {
    return this.analyticsService.getDevices(profileId, req.user['id'], range);
  }
}

@Controller('track')
export class TrackController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async track(@Req() req: any, @Body() body: TrackDto) {
    const ua = req.headers['user-agent'];
    const device = body.device || this.analyticsService.detectDevice(ua);
    return this.analyticsService.recordVisit({
      profileId: body.profileId,
      path: body.path,
      sessionDurationMs: body.sessionDurationMs,
      uniqueVisitorId: body.uniqueVisitorId,
      device,
    });
  }
}
