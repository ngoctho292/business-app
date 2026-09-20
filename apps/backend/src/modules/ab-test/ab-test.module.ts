import { Module } from '@nestjs/common';
import { AbTestController } from './ab-test.controller';
import { AbTestService } from './ab-test.service';

@Module({
  controllers: [AbTestController],
  providers: [AbTestService],
  exports: [AbTestService],
})
export class AbTestModule {}
