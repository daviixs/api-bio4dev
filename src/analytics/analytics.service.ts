import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface OverviewResult {
  totalVisits: number;
  uniqueVisitors: number | null;
  avgSessionDurationMs: number;
  bounceRatePct: number;
  growthPct: number | null;
}

export interface TimeseriesPoint {
  label: string;
  visits: number;
  unique: number;
}

export interface TopPage {
  path: string;
  visits: number;
  trendPct: number | null;
}

export interface DeviceBreakdown {
  device: string;
  value: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveRange(range?: string): number {
    switch (range) {
      case 'last90d':
        return 90;
      case 'last30d':
      default:
        return 30;
    }
  }

  private async ensureProfileOwnership(userId: string, profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new BadRequestException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException('Not allowed');
  }

  async recordVisit(params: {
    profileId: string;
    path: string;
    sessionDurationMs?: number;
    device: 'desktop' | 'mobile' | 'tablet';
    uniqueVisitorId?: string | null;
  }) {
    if (!params.profileId || !params.path) {
      throw new BadRequestException('profileId and path are required');
    }

    await this.prisma.visit.create({
      data: {
        profileId: params.profileId,
        path: params.path,
        device: params.device,
        sessionDurationMs: params.sessionDurationMs ?? 0,
        isBounce: (params.sessionDurationMs ?? 0) < 10000,
        uniqueVisitorId: params.uniqueVisitorId,
      },
    });

    return { message: 'Visit recorded' };
  }

  async getOverview(profileId: string, userId: string, range?: string): Promise<OverviewResult> {
    await this.ensureProfileOwnership(userId, profileId);

    const days = this.resolveRange(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStart = new Date(startDate);
    previousStart.setDate(previousStart.getDate() - days);

    const [current] = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int AS visits,
        AVG("sessionDurationMs")::float AS avg_session,
        AVG(CASE WHEN "isBounce" THEN 1 ELSE 0 END)::float AS bounce
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${startDate};
    `;

    const [previous] = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS visits
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${previousStart}
        AND "createdAt" < ${startDate};
    `;

    const currentVisits = Number(current?.visits ?? 0);
    const previousVisits = Number(previous?.visits ?? 0);

    const growthPct = previousVisits > 0
      ? ((currentVisits - previousVisits) / previousVisits) * 100
      : null;

    return {
      totalVisits: currentVisits,
      uniqueVisitors: currentVisits, // opção C: usar visitas como uniques
      avgSessionDurationMs: Number(current?.avg_session ?? 0),
      bounceRatePct: Number(current?.bounce ?? 0) * 100,
      growthPct,
    };
  }

  async getTimeseries(profileId: string, userId: string, range?: string): Promise<TimeseriesPoint[]> {
    await this.ensureProfileOwnership(userId, profileId);

    const days = this.resolveRange(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rows = await this.prisma.$queryRaw<{ label: Date; visits: number }[]>`
      SELECT date_trunc('day', "createdAt") AS label, COUNT(*)::int AS visits
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${startDate}
      GROUP BY label
      ORDER BY label ASC;
    `;

    return rows.map((row) => ({
      label: row.label.toISOString().slice(0, 10),
      visits: Number(row.visits ?? 0),
      unique: Number(row.visits ?? 0),
    }));
  }

  async getTopPages(profileId: string, userId: string, limit = 10, range?: string): Promise<TopPage[]> {
    await this.ensureProfileOwnership(userId, profileId);
    const days = this.resolveRange(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const previousStart = new Date(startDate);
    previousStart.setDate(previousStart.getDate() - days);

    const current = await this.prisma.$queryRaw<{ path: string; visits: number }[]>`
      SELECT path, COUNT(*)::int AS visits
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${startDate}
      GROUP BY path
      ORDER BY visits DESC
      LIMIT ${limit};
    `;

    const previous = await this.prisma.$queryRaw<{ path: string; visits: number }[]>`
      SELECT path, COUNT(*)::int AS visits
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${previousStart}
        AND "createdAt" < ${startDate}
      GROUP BY path;
    `;

    const previousMap = new Map(previous.map((p) => [p.path, Number(p.visits ?? 0)]));

    return current.map((row) => {
      const prev = previousMap.get(row.path) ?? 0;
      const trendPct = prev > 0 ? ((Number(row.visits ?? 0) - prev) / prev) * 100 : null;
      return {
        path: row.path,
        visits: Number(row.visits ?? 0),
        trendPct,
      };
    });
  }

  async getDevices(profileId: string, userId: string, range?: string): Promise<DeviceBreakdown[]> {
    await this.ensureProfileOwnership(userId, profileId);

    const days = this.resolveRange(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rows = await this.prisma.$queryRaw<{ device: string; value: number }[]>`
      SELECT device, COUNT(*)::int AS value
      FROM "Visit"
      WHERE "profileId" = ${profileId}
        AND "createdAt" >= ${startDate}
      GROUP BY device;
    `;

    return rows.map((row) => ({ device: row.device, value: Number(row.value ?? 0) }));
  }

  detectDevice(userAgent: string | undefined): 'desktop' | 'mobile' | 'tablet' {
    if (!userAgent) return 'desktop';
    const ua = userAgent.toLowerCase();
    if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return 'mobile';
    return 'desktop';
  }
}
