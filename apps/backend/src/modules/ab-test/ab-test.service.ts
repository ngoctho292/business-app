import { Injectable, Logger } from '@nestjs/common';
import { BlockNode } from '@t-business/shared-types';

export interface VariantStats {
  id: string;
  name: string;
  label: string;
  trafficWeight: number; // e.g. 50 (%)
  impressions: number;
  conversions: number;
  conversionRate: number; // %
  blocks?: BlockNode[];
}

export interface AbTestConfig {
  pageId: string;
  enabled: boolean;
  status: 'running' | 'paused' | 'concluded';
  winningVariantId: string | null;
  variants: {
    A: VariantStats;
    B: VariantStats;
  };
  startedAt: string;
  lastUpdatedAt: string;
}

export interface AnalyticsSettingsDTO {
  ga4Id?: string; // e.g. G-XXXXXXXXXX
  fbPixelId?: string; // e.g. 123456789012345
  gtmId?: string; // e.g. GTM-XXXXXXX
  customHeaderScript?: string;
  enableEcommerceTracking?: boolean;
}

@Injectable()
export class AbTestService {
  private readonly logger = new Logger(AbTestService.name);

  // In-memory / Mock DB store for A/B testing and site analytics (persisted across sessions)
  private abTests: Map<string, AbTestConfig> = new Map();
  private analyticsStore: Map<string, AnalyticsSettingsDTO> = new Map();

  constructor() {
    // Seed default analytics for testing
    this.analyticsStore.set('site-1', {
      ga4Id: 'G-VNPT888888',
      fbPixelId: '987654321012345',
      gtmId: 'GTM-TBN999',
      enableEcommerceTracking: true,
    });

    // Seed default A/B test for home page
    this.abTests.set('home', {
      pageId: 'home',
      enabled: true,
      status: 'running',
      winningVariantId: 'B',
      variants: {
        A: {
          id: 'var-A',
          name: 'Phiên bản A (Gốc)',
          label: 'Giao diện Chuẩn Xanh Lá (Hero Tĩnh)',
          trafficWeight: 50,
          impressions: 480,
          conversions: 36,
          conversionRate: 7.5,
        },
        B: {
          id: 'var-B',
          name: 'Phiên bản B (Biến thể)',
          label: 'Giao diện Tối Ưu Tím AI (Nút CTA Nổi Bật)',
          trafficWeight: 50,
          impressions: 512,
          conversions: 82,
          conversionRate: 16.02,
        },
      },
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  /**
   * Lấy trạng thái và báo cáo số liệu A/B Testing
   */
  getAbTestStatus(pageId: string): AbTestConfig {
    let test = this.abTests.get(pageId);
    if (!test) {
      test = {
        pageId,
        enabled: false,
        status: 'paused',
        winningVariantId: null,
        variants: {
          A: {
            id: 'var-A',
            name: 'Phiên bản A (Gốc)',
            label: 'Thiết kế hiện tại',
            trafficWeight: 50,
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
          },
          B: {
            id: 'var-B',
            name: 'Phiên bản B (Biến thể)',
            label: 'Thiết kế thử nghiệm',
            trafficWeight: 50,
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
          },
        },
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      this.abTests.set(pageId, test);
    }

    // Tính lại CVR và xác định phiên bản dẫn đầu
    const vA = test.variants.A;
    const vB = test.variants.B;
    vA.conversionRate = vA.impressions > 0 ? Number(((vA.conversions / vA.impressions) * 100).toFixed(2)) : 0;
    vB.conversionRate = vB.impressions > 0 ? Number(((vB.conversions / vB.impressions) * 100).toFixed(2)) : 0;

    if (vB.conversionRate > vA.conversionRate && vB.conversions >= 5) {
      test.winningVariantId = 'B';
    } else if (vA.conversionRate > vB.conversionRate && vA.conversions >= 5) {
      test.winningVariantId = 'A';
    } else {
      test.winningVariantId = null;
    }

    return test;
  }

  /**
   * Bật/Tắt hoặc cập nhật cấu hình A/B Test
   */
  toggleAbTest(pageId: string, enabled: boolean, splitRatio = 50): AbTestConfig {
    const test = this.getAbTestStatus(pageId);
    test.enabled = enabled;
    test.status = enabled ? 'running' : 'paused';
    test.variants.A.trafficWeight = splitRatio;
    test.variants.B.trafficWeight = 100 - splitRatio;
    test.lastUpdatedAt = new Date().toISOString();

    this.logger.log(`[A/B Test] Trang [${pageId}] trạng thái: ${test.status} (Tỷ lệ: ${splitRatio}/${100 - splitRatio})`);
    return test;
  }

  /**
   * Ghi nhận sự kiện xem trang (Impression) hoặc chuyển đổi (Conversion)
   */
  trackEvent(pageId: string, variant: 'A' | 'B', eventType: 'impression' | 'conversion'): AbTestConfig {
    const test = this.getAbTestStatus(pageId);
    if (variant !== 'A' && variant !== 'B') return test;

    if (eventType === 'impression') {
      test.variants[variant].impressions += 1;
    } else if (eventType === 'conversion') {
      test.variants[variant].conversions += 1;
    }

    test.lastUpdatedAt = new Date().toISOString();
    return this.getAbTestStatus(pageId);
  }

  /**
   * Lưu cài đặt Analytics (GA4, FB Pixel, GTM)
   */
  saveAnalyticsSettings(siteId: string, dto: AnalyticsSettingsDTO): AnalyticsSettingsDTO {
    this.analyticsStore.set(siteId, dto);
    this.logger.log(`[Analytics] Đã lưu cấu hình theo dõi cho site [${siteId}]: GA4=${dto.ga4Id}, Pixel=${dto.fbPixelId}`);
    return dto;
  }

  /**
   * Lấy cài đặt Analytics
   */
  getAnalyticsSettings(siteId: string): AnalyticsSettingsDTO {
    return (
      this.analyticsStore.get(siteId) || {
        ga4Id: '',
        fbPixelId: '',
        gtmId: '',
        enableEcommerceTracking: true,
      }
    );
  }
}
