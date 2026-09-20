import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, subscriptions, orders, users } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { PlanDTO, SubscriptionDTO, OrderDTO } from '@t-business/shared-types';
import { randomUUID } from 'crypto';

export const PLANS: PlanDTO[] = [
  {
    id: 'free',
    name: 'Gói Khởi Nghiệp (Starter)',
    priceMonthly: 0,
    priceYearly: 0,
    badge: 'Miễn Phí',
    description: 'Dành cho cá nhân và dự án thử nghiệm landing page đơn giản',
    features: [
      'Tạo 1 Website độc lập',
      'Tối đa 5 trang nội dung',
      'Dung lượng Media 100MB',
      'Domain chuẩn (.local / .tbusiness.vn)',
      '12 Block loại khối giao diện cơ bản',
    ],
    maxSites: 1,
    maxPages: 5,
    maxStorageMb: 100,
    customDomain: false,
    aiGenerations: 5,
  },
  {
    id: 'pro',
    name: 'Gói Chuyên Nghiệp (Pro)',
    priceMonthly: 199000,
    priceYearly: 1990000, // Tiết kiệm 20%
    badge: 'Phổ Biến Nhất',
    description: 'Dành cho doanh nghiệp vừa & nhỏ, cửa hàng, nhà hàng, dịch vụ',
    features: [
      'Tạo tối đa 5 Website riêng biệt',
      'Không giới hạn số trang',
      'Dung lượng Media 2GB lưu trữ MinIO/S3',
      'Kết nối Tên Miền Riêng (Custom Domain)',
      'Tạo Layout bằng AI (Gemini Flash)',
      'Tối ưu hóa SEO & Thẻ OpenGraph AI',
      'Mời 5 thành viên cộng tác vào team',
      'Thu thập & Xuất file CSV Leads khách hàng',
    ],
    maxSites: 5,
    maxPages: 999,
    maxStorageMb: 2048,
    customDomain: true,
    aiGenerations: 100,
  },
  {
    id: 'business',
    name: 'Gói Doanh Nghiệp (Enterprise)',
    priceMonthly: 499000,
    priceYearly: 4990000,
    badge: 'Toàn Diện',
    description: 'Dành cho chuỗi thương hiệu, agency và tập đoàn lớn',
    features: [
      'Không giới hạn số lượng Website',
      'Không giới hạn trang & dung lượng Media',
      'Không giới hạn Tên Miền Riêng & SSL',
      'Không giới hạn AI Gemini Tạo Trang & Viết Bài',
      'Không giới hạn thành viên trong nhóm',
      'Tùy chỉnh mã CSS & Webhook nâng cao',
      'Hỗ trợ kỹ thuật ưu tiên 24/7',
    ],
    maxSites: 999,
    maxPages: 9999,
    maxStorageMb: 20480,
    customDomain: true,
    aiGenerations: 9999,
  },
];

@Injectable()
export class BillingService {
  /**
   * Lấy danh sách các gói dịch vụ có sẵn
   */
  getPlans(): PlanDTO[] {
    return PLANS;
  }

  /**
   * Lấy thông tin gói cước hiện tại của User
   */
  async getUserSubscription(userId: string): Promise<SubscriptionDTO> {
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.user_id, userId),
      orderBy: [desc(subscriptions.created_at)],
    });

    if (!sub) {
      return {
        id: 'sub-default',
        user_id: userId,
        plan: 'free',
        status: 'active',
        billing_cycle: 'monthly',
        expires_at: null,
        created_at: new Date().toISOString(),
      };
    }

    return {
      id: sub.id,
      user_id: sub.user_id,
      plan: sub.plan as any,
      status: sub.status as any,
      billing_cycle: sub.billing_cycle as any,
      expires_at: sub.expires_at?.toISOString() || null,
      created_at: sub.created_at.toISOString(),
    };
  }

  /**
   * Tạo đơn hàng nâng cấp gói cước kèm mã QR VietQR / MoMo
   */
  async createSubscriptionOrder(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    paymentMethod: 'vietqr' | 'momo' | 'vnpay' = 'vietqr'
  ): Promise<{ order: OrderDTO; qr_url: string; bank_info: any }> {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.id === 'free') {
      throw new BadRequestException('Gói cước không hợp lệ hoặc là gói miễn phí');
    }

    const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const orderCode = `TB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const [newOrder] = await db
      .insert(orders)
      .values({
        user_id: userId,
        plan: plan.id,
        amount: amount,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        status: 'pending',
        order_code: orderCode,
      })
      .returning();

    // Sinh mã QR VietQR Napas 247 chuẩn ngân hàng MBBank
    const bankCode = 'MB';
    const accountNo = '0987654321';
    const accountName = 'CONG TY CONG NGHE TBUSINESS';
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=${encodeURIComponent(accountName)}`;

    return {
      order: {
        id: newOrder.id,
        user_id: newOrder.user_id,
        plan: newOrder.plan,
        amount: newOrder.amount,
        billing_cycle: newOrder.billing_cycle as any,
        payment_method: newOrder.payment_method as any,
        status: newOrder.status as any,
        order_code: newOrder.order_code,
        qr_url: qrUrl,
        created_at: newOrder.created_at.toISOString(),
      },
      qr_url: qrUrl,
      bank_info: {
        bank_name: 'Ngân hàng Quân Đội (MBBank)',
        account_number: accountNo,
        account_name: accountName,
        amount: amount,
        transfer_content: orderCode,
      },
    };
  }

  /**
   * Hoàn tất đơn hàng và kích hoạt gói cước cho User
   */
  async completeOrder(orderCode: string, transactionId?: string): Promise<{ success: boolean; message: string; subscription: SubscriptionDTO }> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.order_code, orderCode),
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã '${orderCode}'`);
    }

    if (order.status === 'completed') {
      const currentSub = await this.getUserSubscription(order.user_id);
      return {
        success: true,
        message: 'Đơn hàng này đã được thanh toán và kích hoạt trước đó.',
        subscription: currentSub,
      };
    }

    // 1. Cập nhật Order status completed
    await db
      .update(orders)
      .set({
        status: 'completed',
        transaction_id: transactionId || `TXN_${Date.now()}`,
        completed_at: new Date(),
      })
      .where(eq(orders.id, order.id));

    // 2. Tính ngày hết hạn (30 ngày cho monthly, 365 ngày cho yearly)
    const durationDays = order.billing_cycle === 'yearly' ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // 3. Cập nhật hoặc tạo Subscription
    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.user_id, order.user_id),
    });

    let activeSub: any;
    if (existingSub) {
      const [updated] = await db
        .update(subscriptions)
        .set({
          plan: order.plan,
          status: 'active',
          billing_cycle: order.billing_cycle,
          expires_at: expiresAt,
          updated_at: new Date(),
        })
        .where(eq(subscriptions.id, existingSub.id))
        .returning();
      activeSub = updated;
    } else {
      const [created] = await db
        .insert(subscriptions)
        .values({
          user_id: order.user_id,
          plan: order.plan,
          status: 'active',
          billing_cycle: order.billing_cycle,
          expires_at: expiresAt,
        })
        .returning();
      activeSub = created;
    }

    return {
      success: true,
      message: `🎉 Chúc mừng! Tài khoản của bạn đã được nâng cấp lên gói ${order.plan.toUpperCase()} thành công.`,
      subscription: {
        id: activeSub.id,
        user_id: activeSub.user_id,
        plan: activeSub.plan as any,
        status: activeSub.status as any,
        billing_cycle: activeSub.billing_cycle as any,
        expires_at: activeSub.expires_at?.toISOString() || null,
        created_at: activeSub.created_at.toISOString(),
      },
    };
  }
}
