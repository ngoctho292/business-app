import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MoMoService, CreateMoMoPaymentDto, MoMoIpnDto } from './momo.service';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// In-memory cache for order payment statuses
const orderStatusMap = new Map<string, { status: string; amount: number; updatedAt: string }>();

export class CreateOrderDto {
  planId: string;
  billingCycle?: 'monthly' | 'yearly';
  paymentMethod?: 'vietqr' | 'momo' | 'vnpay';
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly momoService: MoMoService,
    private readonly billingService: BillingService
  ) {}

  // --- SaaS Plans & Subscriptions ---

  @Public()
  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getUserSubscription(user.id);
  }

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createSubscriptionOrder(
    @Body() body: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.billingService.createSubscriptionOrder(
      user.id,
      body.planId,
      body.billingCycle || 'monthly',
      body.paymentMethod || 'vietqr'
    );
  }

  /**
   * Giả lập thanh toán thành công tức thì cho Demo / Thử nghiệm
   */
  @Public()
  @Post('simulate-success/:orderCode')
  async simulateSuccess(@Param('orderCode') orderCode: string) {
    return this.billingService.completeOrder(orderCode, `SIM_${Date.now()}`);
  }

  /**
   * Webhook IPN xử lý thanh toán tự động
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleGeneralWebhook(@Body() body: any) {
    const orderCode = body.orderCode || body.order_code || body.orderId;
    if (orderCode) {
      await this.billingService.completeOrder(orderCode, body.transactionId || body.transId);
      return { success: true, message: 'Đã cập nhật đơn hàng thành công' };
    }
    return { success: false, message: 'Không tìm thấy mã đơn hàng' };
  }

  // --- MoMo Legacy Endpoints ---

  @Public()
  @Post('momo/create')
  async createPayment(@Body() body: CreateMoMoPaymentDto) {
    const result = await this.momoService.createPayment({
      orderId: body.orderId || `ORDER_${Date.now()}`,
      amount: body.amount || 50000,
      orderInfo: body.orderInfo || 'Thanh toán cọc giữ bàn Nhà Hàng ABC',
      returnUrl: body.returnUrl,
      notifyUrl: body.notifyUrl,
      extraData: body.extraData,
    });

    orderStatusMap.set(result.orderId, {
      status: 'PENDING',
      amount: body.amount || 50000,
      updatedAt: new Date().toISOString(),
    });

    return result;
  }

  @Public()
  @Post('momo/ipn')
  @HttpCode(HttpStatus.OK)
  async handleIpn(@Body() body: MoMoIpnDto) {
    const verification = this.momoService.verifyIpn(body);

    if (verification.valid) {
      orderStatusMap.set(verification.orderId, {
        status: verification.status,
        amount: body.amount,
        updatedAt: new Date().toISOString(),
      });

      // Kích hoạt luôn order nếu là mã TBUSINESS
      if (body.orderId?.startsWith('TB')) {
        await this.billingService.completeOrder(body.orderId, String(body.transId));
      }

      return {
        partnerCode: body.partnerCode,
        orderId: body.orderId,
        requestId: body.requestId,
        resultCode: 0,
        message: 'Xác nhận thông báo IPN thành công',
      };
    }

    return {
      partnerCode: body.partnerCode,
      orderId: body.orderId,
      requestId: body.requestId,
      resultCode: 99,
      message: 'Chữ ký không hợp lệ',
    };
  }

  @Public()
  @Get('momo/status/:orderId')
  async getOrderStatus(@Param('orderId') orderId: string) {
    const order = orderStatusMap.get(orderId);
    if (!order) {
      return {
        orderId,
        status: 'PENDING',
        message: 'Đơn hàng đang chờ thanh toán',
      };
    }

    return {
      orderId,
      status: order.status,
      amount: order.amount,
      updatedAt: order.updatedAt,
    };
  }
}
