import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PublicRenderController } from './public-render.controller';

@Module({
  controllers: [PagesController, PublicRenderController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
