import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MoMoService } from './momo.service';
import { BillingService } from './billing.service';

@Module({
  controllers: [PaymentsController],
  providers: [MoMoService, BillingService],
  exports: [MoMoService, BillingService],
})
export class PaymentsModule {}
