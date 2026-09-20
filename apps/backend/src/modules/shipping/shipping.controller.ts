import { Body, Controller, Get, Param, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ShippingService, CalculateFeeDto, CreateShippingOrderDto } from './shipping.service';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @Post('calculate-fee')
  async calculateFee(@Body() body: CalculateFeeDto) {
    return await this.shippingService.calculateFee(body);
  }

  @Public()
  @Post('orders/create')
  async createOrder(@Body() body: CreateShippingOrderDto) {
    return await this.shippingService.createShippingOrder(body);
  }

  @Public()
  @Get('orders/track/:trackingCode')
  async trackOrder(@Param('trackingCode') trackingCode: string) {
    return await this.shippingService.trackOrder(trackingCode);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body()
    body: {
      trackingCode: string;
      status: string;
      description: string;
      location?: string;
    }
  ) {
    return await this.shippingService.handleWebhook(body);
  }
}
