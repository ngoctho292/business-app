import { Module } from '@nestjs/common';
import { CustomBlocksController } from './custom-blocks.controller';
import { CustomBlocksService } from './custom-blocks.service';

@Module({
  controllers: [CustomBlocksController],
  providers: [CustomBlocksService],
  exports: [CustomBlocksService],
})
export class CustomBlocksModule {}
