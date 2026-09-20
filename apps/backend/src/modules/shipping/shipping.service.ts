import { Injectable, Logger } from '@nestjs/common';

export type ShippingCarrier = 'GHN' | 'GHTK';

export interface CalculateFeeDto {
  fromDistrictId?: number;
  fromProvince?: string;
  fromDistrict?: string;
  toDistrictId?: number;
  toProvince: string;
  toDistrict: string;
  toWard?: string;
  weightGrams: number;
  insuranceValue?: number;
}

export interface ShippingCarrierRate {
  carrier: ShippingCarrier;
  carrierName: string;
  serviceType: string;
  fee: number;
  insuranceFee: number;
  totalFee: number;
  estimatedDeliveryDays: string;
  logo: string;
}

export interface CreateShippingOrderDto {
  carrier: ShippingCarrier;
  orderId: string;
  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientProvince: string;
  recipientDistrict: string;
  recipientWard?: string;
  weightGrams: number;
  codAmount?: number;
  items: { name: string; quantity: number; price: number }[];
  note?: string;
}

export interface ShippingOrderResult {
  carrier: ShippingCarrier;
  orderId: string;
  trackingCode: string;
  totalFee: number;
  expectedDelivery: string;
  printUrl: string;
  status: string;
  message: string;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  // GHN Configuration
  private readonly ghnToken = process.env.GHN_API_TOKEN || 'GHN_SANDBOX_TOKEN_DEMO';
  private readonly ghnShopId = process.env.GHN_SHOP_ID || '123456';
  private readonly ghnEndpoint =
    process.env.GHN_ENDPOINT || 'https://dev-online-gateway.ghn.vn/shiip/public-api';

  // GHTK Configuration
  private readonly ghtkToken = process.env.GHTK_API_TOKEN || 'GHTK_SANDBOX_TOKEN_DEMO';
  private readonly ghtkEndpoint =
    process.env.GHTK_ENDPOINT || 'https://services.giaohangtietkiem.vn/services/shipment';

  // In-memory / Mock tracking store
  private readonly trackingStore = new Map<
    string,
    {
      carrier: ShippingCarrier;
      orderId: string;
      status: string;
      statusText: string;
      history: { time: string; status: string; description: string; location: string }[];
    }
  >();

  /**
   * Tính toán và so sánh phí vận chuyển tức thì giữa GHN và GHTK
   */
  async calculateFee(dto: CalculateFeeDto): Promise<ShippingCarrierRate[]> {
    this.logger.log(
      `[Shipping] Tính phí vận chuyển từ [${dto.fromProvince || 'Hà Nội'}] đến [${dto.toProvince} - ${dto.toDistrict}] - Trọng lượng: ${dto.weightGrams}g`
    );

    const isIntraCity =
      (dto.fromProvince || 'Hà Nội').toLowerCase() === dto.toProvince.toLowerCase();
    const baseWeight = Math.max(100, dto.weightGrams);

    // Bảng giá tính cước GHN
    const ghnBaseFee = isIntraCity ? 22000 : 35000;
    const ghnExtraWeightFee = baseWeight > 1000 ? Math.ceil((baseWeight - 1000) / 500) * 5000 : 0;
    const ghnInsurance = dto.insuranceValue && dto.insuranceValue > 1000000 ? Math.round(dto.insuranceValue * 0.005) : 0;
    const ghnTotal = ghnBaseFee + ghnExtraWeightFee + ghnInsurance;

    // Bảng giá tính cước GHTK
    const ghtkBaseFee = isIntraCity ? 20000 : 32000;
    const ghtkExtraWeightFee = baseWeight > 1000 ? Math.ceil((baseWeight - 1000) / 500) * 4500 : 0;
    const ghtkInsurance = dto.insuranceValue && dto.insuranceValue > 1000000 ? Math.round(dto.insuranceValue * 0.005) : 0;
    const ghtkTotal = ghtkBaseFee + ghtkExtraWeightFee + ghtkInsurance;

    return [
      {
        carrier: 'GHN',
        carrierName: 'Giao Hàng Nhanh (GHN Express)',
        serviceType: 'Chuẩn Nhanh',
        fee: ghnBaseFee + ghnExtraWeightFee,
        insuranceFee: ghnInsurance,
        totalFee: ghnTotal,
        estimatedDeliveryDays: isIntraCity ? 'Trong ngày hoặc 24h' : '2 - 3 ngày',
        logo: 'https://api.iconify.design/lucide:truck.svg',
      },
      {
        carrier: 'GHTK',
        carrierName: 'Giao Hàng Tiết Kiệm (GHTK)',
        serviceType: 'Tiết Kiệm',
        fee: ghtkBaseFee + ghtkExtraWeightFee,
        insuranceFee: ghtkInsurance,
        totalFee: ghtkTotal,
        estimatedDeliveryDays: isIntraCity ? '24h - 48h' : '3 - 4 ngày',
        logo: 'https://api.iconify.design/lucide:package.svg',
      },
    ];
  }

  /**
   * Tạo đơn vận chuyển sang GHN / GHTK và sinh mã vận đơn
   */
  async createShippingOrder(dto: CreateShippingOrderDto): Promise<ShippingOrderResult> {
    const carrierPrefix = dto.carrier === 'GHN' ? 'GHN_TBUSINESS_' : 'GHTK_TBUSINESS_';
    const trackingCode = `${carrierPrefix}${Date.now()}`;
    const totalFee = dto.carrier === 'GHN' ? 35000 : 32000;

    this.logger.log(
      `[Shipping ${dto.carrier}] Đã tạo đơn vận chuyển cho đơn hàng: ${dto.orderId} - Mã vận đơn: ${trackingCode}`
    );

    // Lưu vào tracking store để tra cứu lộ trình
    this.trackingStore.set(trackingCode, {
      carrier: dto.carrier,
      orderId: dto.orderId,
      status: 'READY_TO_PICK',
      statusText: 'Đã tạo đơn - Chờ bưu tá lấy hàng',
      history: [
        {
          time: new Date().toISOString(),
          status: 'READY_TO_PICK',
          description: 'Hệ thống T-Business đã khởi tạo đơn hàng sang nhà vận chuyển.',
          location: 'Kho tổng Nhà Hàng / Cửa hàng ABC',
        },
      ],
    });

    return {
      carrier: dto.carrier,
      orderId: dto.orderId,
      trackingCode,
      totalFee,
      expectedDelivery: '2 - 3 ngày tới',
      printUrl: `https://shipping.t-business.vn/print/${trackingCode}`,
      status: 'READY_TO_PICK',
      message: `Tạo vận đơn ${dto.carrier} thành công!`,
    };
  }

  /**
   * Tra cứu lộ trình vận đơn theo thời gian thực
   */
  async trackOrder(trackingCode: string) {
    const order = this.trackingStore.get(trackingCode);

    if (!order) {
      return {
        trackingCode,
        found: false,
        message: 'Không tìm thấy thông tin lộ trình cho mã vận đơn này.',
      };
    }

    return {
      trackingCode,
      found: true,
      carrier: order.carrier,
      orderId: order.orderId,
      currentStatus: order.status,
      statusText: order.statusText,
      history: order.history,
    };
  }

  /**
   * Xử lý Webhook cập nhật trạng thái đơn hàng từ GHN / GHTK
   */
  async handleWebhook(payload: { trackingCode: string; status: string; description: string; location?: string }) {
    const existing = this.trackingStore.get(payload.trackingCode);

    if (existing) {
      existing.status = payload.status;
      existing.statusText = payload.description;
      existing.history.push({
        time: new Date().toISOString(),
        status: payload.status,
        description: payload.description,
        location: payload.location || 'Bưu cục trung chuyển',
      });

      this.logger.log(`[Shipping Webhook] Đã cập nhật trạng thái vận đơn [${payload.trackingCode}]: ${payload.status}`);
      return { success: true, trackingCode: payload.trackingCode, status: payload.status };
    }

    return { success: false, message: 'Vận đơn không tồn tại' };
  }
}
