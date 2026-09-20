import { Controller, Post, Body } from '@nestjs/common';
import { AiService, AIGenerateLayoutRequest } from './ai.service';
import { Public } from '../../common/decorators/roles.decorator';
import {
  AISuggestSeoMetaRequest,
  AISuggestSeoMetaResponse,
  AISuggestExcerptRequest,
  AISuggestExcerptResponse,
} from '@t-business/shared-types';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('generate-layout')
  async generateLayout(@Body() body: AIGenerateLayoutRequest) {
    return this.aiService.generateLayout(body);
  }

  @Public()
  @Post('generate-section')
  async generateSection(@Body() body: any) {
    return this.aiService.generateSection(body);
  }

  @Public()
  @Post('suggest/seo-meta')
  async suggestSeoMeta(
    @Body() body: AISuggestSeoMetaRequest
  ): Promise<AISuggestSeoMetaResponse> {
    return this.aiService.suggestSeoMeta(body);
  }

  @Public()
  @Post('suggest/excerpt')
  async suggestExcerpt(
    @Body() body: AISuggestExcerptRequest
  ): Promise<AISuggestExcerptResponse> {
    return this.aiService.suggestExcerpt(body);
  }

  @Public()
  @Post('rewrite')
  async rewriteText(
    @Body() body: { text: string; tone?: 'shorter' | 'persuasive' | 'formal' | 'casual' | 'translate_en' }
  ) {
    return this.aiService.rewriteText(body);
  }

  @Public()
  @Post('copywrite')
  async generateCopywriting(@Body() body: any) {
    return this.aiService.generateCopywriting(body);
  }
}

