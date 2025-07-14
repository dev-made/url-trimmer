import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle/schema';
import { DrizzleAsyncProvider } from './drizzle/drizzle.provider';

@Injectable()
export class AppService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAnalyticsInfo(shortUrl: string) {
    const linkEntity = await this.db.query.links.findFirst({
      where: (links, { eq, or }) => or(eq(links.shortUrl, shortUrl), eq(links.alias, shortUrl)),
    });

    if (!linkEntity) return undefined; // @TODO throw Error

    const analytics = await this.db.query.analytics.findFirst({
      extras: {
        clickCount:
          sql`(select count(analytics.ip) from analytics where link_id = ${linkEntity.id})`.as(
            'clickCount',
          ),
      },
    });

    return {
      originalUrl: linkEntity.originalUrl,
      createdAt: linkEntity.createdAt,
      clickCount: analytics?.clickCount,
    };
  }

  async getLastFiveStats(shortUrl: string, limit?: number) {
    const linkEntity = await this.db.query.links.findFirst({
      where: (links, { eq, or }) => or(eq(links.shortUrl, shortUrl), eq(links.alias, shortUrl)),
    });

    if (!linkEntity) return undefined; // @TODO throw Error

    const prepared = this.db.query.analytics
      .findMany({
        extras: {
          clickCount:
            sql`(select count(analytics.ip) from analytics where link_id = ${linkEntity.id})`.as(
              'clickCount',
            ),
        },
        where: (analytics, { eq }) => eq(analytics.linkId, sql.placeholder('link_id')),
        orderBy: (analytics, { desc }) => [desc(analytics.createdAt)],
        limit,
      })
      .prepare('last_five_visits');

    const analyticsInfo = await prepared.execute({ link_id: linkEntity.id });

    return {
      clickCount: analyticsInfo.find((l) => l.clickCount)?.clickCount,
      lastFiveIPs: analyticsInfo.map((l) => ({
        ip: l.ip,
        createdAt: l.createdAt,
      })),
    };
  }
}
