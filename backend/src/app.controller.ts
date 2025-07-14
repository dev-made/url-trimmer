import {
  Controller,
  Redirect,
  Get,
  Ip,
  Post,
  Req,
  Body,
  Delete,
  Param,
  Inject,
  HttpException,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';
import { customAlphabet, urlAlphabet } from 'nanoid';

import { eq, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle/schema';
import { DrizzleAsyncProvider } from './drizzle/drizzle.provider';

type NewLink = typeof schema.links.$inferInsert;

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private readonly logger: Logger,
  ) {}

  // Create
  @Post('shorten')
  async shorten(@Body() body: Omit<NewLink, 'shortUrl'>): Promise<string | void> {
    console.log(body);
    const { originalUrl, alias, expiresAt } = body;
    if (!originalUrl || !isValidUrl(originalUrl)) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    const shortUrl = customAlphabet(urlAlphabet, 8)();
    // console.log(shortUrl);
    // console.log(typeof expiresAt);

    const newLink: NewLink = {
      originalUrl,
      alias,
      expiresAt: typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt,
      shortUrl,
    };

    try {
      await this.db.insert(schema.links).values(newLink);
    } catch (e: unknown) {
      this.logger.error(e);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return shortUrl;
  }

  // Redirect
  @Get(':shortUrl')
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string, @Req() req: Request, @Ip() ip: string) {
    // console.log(shortUrl);
    if (!shortUrl || shortUrl.length > 20) {
      return {
        statusCode: 404,
      };
    }

    // Check alias
    const shortLinkEntity = await this.db.query.links.findFirst({
      where: (links, { eq, or }) => or(eq(links.shortUrl, shortUrl), eq(links.alias, shortUrl)),
    });

    if (!shortLinkEntity) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    // track link visit (analytics)
    await this.db.insert(schema.analytics).values({
      ip: ip,
      linkId: shortLinkEntity.id,
    });

    return {
      url: shortLinkEntity.originalUrl,
      statusCode: 301,
    };
  }

  // Info
  @Get('info/:shortUrl')
  async info(@Param('shortUrl') shortUrl: string) {
    if (!shortUrl) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    const lastFive = await this.appService.getAnalyticsInfo(shortUrl);
    return lastFive;
  }

  // Delete
  @Delete('delete/:shortUrl')
  @HttpCode(204)
  async delete(@Param('shortUrl') shortUrl: string) {
    if (!shortUrl) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.db
        .delete(schema.links)
        .where(or(eq(schema.links.shortUrl, shortUrl), eq(schema.links.alias, shortUrl)));
    } catch (e: unknown) {
      this.logger.error(e);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return;
  }

  // Last five ips
  @Get('analytics/:shortUrl')
  async analytics(@Param('shortUrl') shortUrl: string) {
    if (!shortUrl) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    const lastFive = await this.appService.getLastFiveStats(shortUrl, 5);
    return lastFive;
  }
}
