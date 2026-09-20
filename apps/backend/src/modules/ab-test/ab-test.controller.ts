import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AbTestService, AnalyticsSettingsDTO } from './ab-test.service';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('ab-test')
export class AbTestController {
  constructor(private readonly abTestService: AbTestService) {}

  @Public()
  @Get('status/:pageId')
  getStatus(@Param('pageId') pageId: string) {
    return this.abTestService.getAbTestStatus(pageId);
  }

  @Public()
  @Post('toggle')
  toggle(
    @Body() body: { pageId: string; enabled: boolean; splitRatio?: number }
  ) {
    return this.abTestService.toggleAbTest(
      body.pageId,
      body.enabled,
      body.splitRatio ?? 50
    );
  }

  @Public()
  @Post('track')
  track(
    @Body()
    body: {
      pageId: string;
      variant: 'A' | 'B';
      eventType: 'impression' | 'conversion';
    }
  ) {
    return this.abTestService.trackEvent(
      body.pageId,
      body.variant,
      body.eventType
    );
  }

  @Public()
  @Get('analytics/:siteId')
  getAnalytics(@Param('siteId') siteId: string) {
    return this.abTestService.getAnalyticsSettings(siteId);
  }

  @Public()
  @Post('analytics/:siteId')
  saveAnalytics(
    @Param('siteId') siteId: string,
    @Body() body: AnalyticsSettingsDTO
  ) {
    return this.abTestService.saveAnalyticsSettings(siteId, body);
  }
}
