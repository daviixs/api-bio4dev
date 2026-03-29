import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../database/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      profile: { findUnique: jest.fn() },
      visit: { create: jest.fn() },
      $queryRaw: jest.fn(),
    } as any;

    service = new AnalyticsService(prisma);
  });

  it('calculates overview growth and bounce correctly', async () => {
    prisma.profile.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    (prisma.$queryRaw as any)
      .mockResolvedValueOnce([{ visits: 100, avg_session: 5000, bounce: 0.25 }])
      .mockResolvedValueOnce([{ visits: 50 }]);

    const result = await service.getOverview('p1', 'u1', 'last30d');

    expect(result.totalVisits).toBe(100);
    expect(result.uniqueVisitors).toBe(100);
    expect(result.avgSessionDurationMs).toBe(5000);
    expect(result.bounceRatePct).toBeCloseTo(25);
    expect(result.growthPct).toBeCloseTo(100);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });
});
