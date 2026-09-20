import { Injectable, Logger } from '@nestjs/common';
import {
  AISuggestSeoMetaRequest,
  AISuggestSeoMetaResponse,
  AISuggestExcerptRequest,
  AISuggestExcerptResponse,
  BlockNode,
} from '@t-business/shared-types';

export interface AIGenerateLayoutRequest {
  prompt?: string;
  image_base64?: string;
  image_url?: string;
  category?: string;
  page_id?: string;
}

export interface AIGenerateLayoutResponse {
  blocks: BlockNode[];
  summary: string;
  prompt_used: string;
}

export interface AIGenerateSectionRequest {
  section_type?: string;
  prompt?: string;
  image_url?: string;
  image_base64?: string;
  page_id?: string;
}

export interface AIGenerateSectionResponse {
  summary: string;
  section_type: string;
  blocks: BlockNode[];
}

export interface AICopywriteRequest {
  field_type: 'heading' | 'text' | 'button' | 'about_story' | 'slogan';
  industry?: string;
  tone?: 'luxury' | 'friendly' | 'professional' | 'urgent_sale' | string;
  keywords?: string;
  existing_text?: string;
  site_name?: string;
}

export interface AICopywriteSuggestion {
  id: string;
  label: string;
  content: string;
  description?: string;
}

export interface AICopywriteResponse {
  field_type: string;
  suggestions: AICopywriteSuggestion[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private getApiKey(): string {
    const userKey = process.env.SPRING_AI_OPENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (userKey && userKey !== 'AIzaSyDOD7fYg6S6FjKZmMY7mF_SNF0lStUVXTE' && userKey.startsWith('AIzaSy')) {
      return userKey;
    }
    return 'AIzaSyC3jCWv8YtP0wkKX7zZSN_5yaDRDbdCw7w';
  }

  private readonly baseUrl =
    process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
  private readonly completionsPath =
    process.env.GEMINI_COMPLETIONS_PATH || '/v1beta/openai/chat/completions';
  private readonly defaultModel =
    process.env.GEMINI_MODEL_DEFAULT || 'gemini-2.5-flash';

  /**
   * Helper gọi Google Gemini qua OpenAI-compatible API (Hỗ trợ cả Text & Multimodal Image)
   */
  private async callGeminiChat(
    messages: { role: 'system' | 'user'; content: string | any[] }[],
    responseFormatJson = true
  ): Promise<string> {
    const key = this.getApiKey();
    const url = `${this.baseUrl}${this.completionsPath}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages,
        temperature: 0.7,
        ...(responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Sprint 9 & P3: Sinh Layout Khối Web Tự Động Từ Prompt & Ảnh Chụp Màn Hình (Multimodal Gemini Vision)
   */
  async generateLayout(dto: AIGenerateLayoutRequest): Promise<AIGenerateLayoutResponse> {
    const userPrompt = (dto.prompt || '').trim();
    const hasImage = !!dto.image_base64;
    this.logger.log(`[Gemini 2.5 Flash] Đang sinh layout (Prompt: "${userPrompt}", Có ảnh đính kèm: ${hasImage})`);

    const systemPrompt = `Bạn là Giám đốc Sáng tạo và Kỹ sư Thiết kế Website hàng đầu của hệ thống T-Business CMS (Việt Nam).
Nhiệm vụ của bạn là phân tích yêu cầu của người dùng (văn bản mô tả và/hoặc hình ảnh chụp màn hình mẫu) và sinh ra toàn bộ cây cấu trúc các khối giao diện (JSON Block Tree) hoàn chỉnh cho một trang web doanh nghiệp / cửa hàng.

CẤU TRÚC BLOCK: Mỗi block gồm "props" (chứa nội dung) và "styles" (chứa kiểu dáng base, hover, responsive).

CÁC LOẠI KHỐI HỖ TRỢ (Block Types):
1. "section": props: { "layout": "stack" | "grid-2" | "grid-3" | "grid-4" | "split-left" }. Dùng "split-left" (chữ trái 60%, ảnh phải 40%) cho Hero, dùng "grid-3" cho 3 Lợi thế hoặc 3 Bảng giá, dùng "grid-2" cho so sánh/dịch vụ song song.
2. "container": props: { "tag": "div" }, styles: { base: { "backgroundColor": "#FFFFFF", "padding": "20px", "borderRadius": "12px", "border": "1px solid #E2E8F0", "boxShadow": "0 2px 6px rgba(0,0,0,0.03)" } }. Dùng làm Hộp Thẻ (Card) bên trong section chia cột!
3. "heading": props: { "text": "Tiêu đề hấp dẫn", "level": "h2" }, styles: { base: { textAlign: "center", color: "#1E1B4B" } }
4. "text": props: { "richtext": "Đoạn văn tự nhiên, trau chuốt, thuyết phục bằng tiếng Việt" }, styles: { base: { textAlign: "center", color: "#4B5563" } }
5. "image": props: { "src": "https://images.unsplash.com/photo-...", "alt": "Mô tả ảnh" }, styles: { base: { borderRadius: "12px", width: "100%" } }
6. "button": props: { "label": "Kêu gọi hành động (VD: Đặt Ngay / Liên Hệ)", "href": "#contact" }, styles: { base: { backgroundColor: "var(--color-primary)", color: "#FFFFFF", padding: "14px 28px", borderRadius: "8px" }, hover: { backgroundColor: "var(--color-accent)" } }
7. "divider": props: {}, styles: { base: { margin: "32px 0" } }
8. "icon": props: { "icon": "solar:star-bold", "size": 36, "color": "var(--color-primary)", "align": "center", "bg_shape": "circle" } (Dùng các icon Solar như: solar:shield-check-bold, solar:phone-calling-bold, solar:star-bold, solar:shop-2-bold, solar:map-point-bold, solar:heart-bold...)
9. "collection_list": props: { "content_type_id": "4a847c69-cfd4-4030-b0f2-5beb88fe51f7", "limit": 3, "layout": "grid" }
10. "form": props: { "fields": [{ "key": "name", "label": "Họ và tên", "input_type": "text", "required": true }, { "key": "phone", "label": "Số điện thoại", "input_type": "phone", "required": true }], "submit_label": "Gửi yêu cầu" }
11. "embed": props: { "provider": "google_maps", "embed_id": "Địa chỉ cửa hàng/nhà hàng" }

QUY TẮC BẮT BUỘC:
- Tận dụng triệt để "section" chia cột (grid-2, grid-3, split-left) và "container" (Card) để tạo giao diện hiện đại, chuyên nghiệp, không chỉ xếp chồng 1 cột đơn điệu.
- Nếu có ảnh đính kèm: Phân tích kỹ bố cục các phần, màu sắc chủ đạo, thứ tự các khối, hình ảnh, icon, nút bấm từ ảnh chụp và dựng lại tương đương nhất có thể.
- Sinh từ 6 đến 12 khối logic theo thứ tự hoàn chỉnh của 1 trang web:
  1. Hero Banner (Section split-left gồm: Cột chữ + Nút CTA, Cột ảnh)
  2. Divider
  3. Lợi thế / Tính năng (Section grid-3 gồm 3 thẻ container, mỗi thẻ có Icon + Heading + Text)
  4. Divider
  5. Giới thiệu / Câu chuyện thương hiệu (Heading + Text)
  6. Divider
  7. Form Đặt hàng / Đăng ký tư vấn (Heading + Form)
- Ngôn ngữ: Tiếng Việt 100%, chuẩn xác, trau chuốt, mang tính thương mại cao.
- Chỉ trả về duy nhất 1 JSON object có cấu trúc:
{
  "summary": "Tóm tắt ngắn gọn ý tưởng thiết kế và cấu trúc các phần",
  "blocks": [
    {
      "id": "block-1",
      "type": "heading",
      "props": { ... },
      "styles": { "base": { ... }, "hover": { ... } },
      "order_index": 0
    },
    ...
  ]
}`;

    let finalImageUrl = '';
    if (dto.image_base64) {
      finalImageUrl = dto.image_base64.trim();
      if (!finalImageUrl.startsWith('data:image')) {
        finalImageUrl = `data:image/jpeg;base64,${finalImageUrl}`;
      }
    } else if (dto.image_url) {
      const rawUrl = dto.image_url.trim();
      if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1') || rawUrl.startsWith('/')) {
        try {
          const fetchUrl = rawUrl.startsWith('/') ? `http://localhost:4000${rawUrl}` : rawUrl;
          const imgRes = await fetch(fetchUrl);
          if (imgRes.ok) {
            const arrBuf = await imgRes.arrayBuffer();
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            finalImageUrl = `data:${mimeType};base64,${Buffer.from(arrBuf).toString('base64')}`;
          }
        } catch (fetchErr: any) {
          this.logger.warn(`Không thể tải ảnh nội bộ từ URL ${rawUrl}: ${fetchErr.message}`);
        }
      } else {
        finalImageUrl = rawUrl;
      }
    }

    let userContent: any;
    if (finalImageUrl) {
      userContent = [
        {
          type: 'text',
          text: `Dưới đây là hình ảnh chụp màn hình / bản vẽ thiết kế mẫu giao diện web. Hãy phân tích cấu trúc, màu sắc và dựng lại các khối blocks tương đương theo schema T-Business. ${userPrompt ? `Ghi chú bổ sung từ người dùng: "${userPrompt}".` : ''}`
        },
        {
          type: 'image_url',
          image_url: { url: finalImageUrl }
        }
      ];
    } else {
      userContent = `Hãy thiết kế trang web hoàn chỉnh cho: "${userPrompt || 'doanh nghiệp dịch vụ uy tín'}"`;
    }

    try {
      const rawContent = await this.callGeminiChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ]);

      const parsed = JSON.parse(rawContent);
      const rawBlocks = parsed.blocks || [];

      const idMap = new Map<string, string>();
      const timestamp = Date.now();
      rawBlocks.forEach((b: any, idx: number) => {
        const oldId = String(b.id || `temp-${idx}`);
        const newId = `ai-b-${timestamp}-${idx}`;
        idMap.set(oldId, newId);
      });

      const normalizedBlocks: BlockNode[] = rawBlocks.map((b: any, idx: number) => {
        const oldId = String(b.id || `temp-${idx}`);
        const newId = idMap.get(oldId) || `ai-b-${timestamp}-${idx}`;
        const newParentId = b.parent_id ? (idMap.get(String(b.parent_id)) || b.parent_id) : null;
        return {
          id: newId,
          page_version_id: 'ver-ai',
          parent_id: newParentId,
          type: b.type || 'text',
          props: b.props || {},
          styles: b.styles || { base: {} },
          order_index: idx,
        };
      });

      return {
        blocks: normalizedBlocks,
        summary: parsed.summary || 'Trang web được thiết kế tự động bởi Gemini 2.5 Flash',
        prompt_used: userPrompt || 'Thiết kế từ ảnh chụp màn hình',
      };
    } catch (err: any) {
      this.logger.error(`Lỗi khi gọi Gemini 2.5 Flash để sinh layout: ${err.message}`);
      return this.fallbackGeneratedLayout(userPrompt || 'Giao diện mẫu');
    }
  }

  /**
   * P3 Section Clone: Sinh 1 Section / Block từ Ảnh Chụp & Mô Tả
   */
  async generateSection(dto: AIGenerateSectionRequest): Promise<AIGenerateSectionResponse> {
    const userPrompt = (dto.prompt || '').trim();
    const sectionType = dto.section_type || 'custom';
    const hasImage = !!dto.image_base64 || !!dto.image_url;
    this.logger.log(`[Gemini 2.5 Flash] Đang sinh section (Loại: ${sectionType}, Prompt: "${userPrompt}", Có ảnh: ${hasImage})`);

    const systemPrompt = `Bạn là Kỹ sư Thiết kế Giao diện cấp cao của T-Business CMS (Việt Nam).
Nhiệm vụ của bạn là phân tích ảnh chụp màn hình MỘT SECTION DUY NHẤT (hoặc mô tả yêu cầu) và sinh ra một nhóm khối (JSON Block Tree) thuộc duy nhất 1 Section đó.
LƯU Ý QUAN TRỌNG: CHỈ sinh nội dung cho đúng 1 section này, TUYỆT ĐỐI KHÔNG sinh toàn bộ trang web.

CÁC LOẠI KHỐI HỖ TRỢ:
1. "section": props: { "layout": "stack" | "grid-2" | "grid-3" | "grid-4" | "split-left" }. Dùng "split-left" cho Hero (Chữ trái, Ảnh phải), "grid-3" cho 3 thẻ Bảng giá hoặc 3 Lợi thế!
2. "container": props: { "tag": "div" }, styles: { base: { "backgroundColor": "#FFFFFF", "padding": "20px", "borderRadius": "12px", "border": "1px solid #E2E8F0", "boxShadow": "0 2px 6px rgba(0,0,0,0.03)" } }. Dùng làm Hộp Thẻ (Card)!
3. "heading": props: { "text": "Tiêu đề section", "level": "h2" }, styles: { base: { textAlign: "center", color: "#1E1B4B" } }
4. "text": props: { "richtext": "Đoạn văn mô tả ngắn gọn hoặc nội dung chi tiết" }, styles: { base: { textAlign: "center", color: "#4B5563" } }
5. "image": props: { "src": "https://images.unsplash.com/...", "alt": "Mô tả ảnh" }, styles: { base: { borderRadius: "12px", width: "100%" } }
6. "button": props: { "label": "Nút bấm hành động", "href": "#" }, styles: { base: { backgroundColor: "var(--color-primary)", color: "#FFFFFF", padding: "12px 24px", borderRadius: "8px" } }
7. "icon": props: { "icon": "solar:star-bold", "size": 36, "color": "var(--color-primary)", "align": "center", "bg_shape": "circle" }
8. "divider": props: {}, styles: { base: { margin: "24px 0" } }
9. "form": props: { "fields": [{ "key": "name", "label": "Họ và tên", "input_type": "text", "required": true }], "submit_label": "Gửi ngay" }

QUY TẮC BẮT BUỘC:
- Tận dụng triệt để "section" chia cột (split-left, grid-2, grid-3, grid-4) và "container" (Card) để tạo bố cục đa cột chuyên nghiệp thay vì chỉ xếp dọc 1 hàng.
- Sinh nhóm khối logic cấu thành 1 Section hoàn chỉnh:
  - Nếu là Hero: 1 Section (split-left) gồm 1 Container (Heading + Text + Button) và 1 Image
  - Nếu là Tính năng: 1 Section (grid-3) gồm 3 Container Card (mỗi card có Icon Solar + Heading + Text)
  - Nếu là Bảng giá: 1 Section (grid-3) gồm 3 Container Card (mỗi card có Heading gói + Giá + Quyền lợi + Button mua)
  - Nếu là Đánh giá: 1 Section (grid-3) gồm 3 Container Card (Icon sao + Text cảm nhận + Tên khách)
  - Nếu là Form liên hệ: 1 Section gồm Heading + Form
- Trả về đúng JSON format:
{
  "summary": "Tóm tắt section đã thiết kế",
  "section_type": "${sectionType}",
  "blocks": [
    {
      "id": "sec-b-1",
      "type": "heading",
      "props": { ... },
      "styles": { "base": { ... } },
      "order_index": 0
    }
  ]
}`;

    let finalImageUrl = '';
    if (dto.image_base64) {
      finalImageUrl = dto.image_base64.trim();
      if (!finalImageUrl.startsWith('data:image')) {
        finalImageUrl = `data:image/jpeg;base64,${finalImageUrl}`;
      }
    } else if (dto.image_url) {
      const rawUrl = dto.image_url.trim();
      if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1') || rawUrl.startsWith('/')) {
        try {
          const fetchUrl = rawUrl.startsWith('/') ? `http://localhost:4000${rawUrl}` : rawUrl;
          const imgRes = await fetch(fetchUrl);
          if (imgRes.ok) {
            const arrBuf = await imgRes.arrayBuffer();
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            finalImageUrl = `data:${mimeType};base64,${Buffer.from(arrBuf).toString('base64')}`;
          }
        } catch (fetchErr: any) {
          this.logger.warn(`Không thể tải ảnh section nội bộ từ URL ${rawUrl}: ${fetchErr.message}`);
        }
      } else {
        finalImageUrl = rawUrl;
      }
    }

    let userContent: any;
    if (finalImageUrl) {
      userContent = [
        {
          type: 'text',
          text: `Dưới đây là ảnh chụp màn hình một Section cụ thể trên website. Hãy phân tích cấu trúc, icon, chữ và dựng lại 1 Section tương đương. ${userPrompt ? `Ghi chú: "${userPrompt}".` : ''} Phân loại: ${sectionType}.`
        },
        {
          type: 'image_url',
          image_url: { url: finalImageUrl }
        }
      ];
    } else {
      userContent = `Hãy thiết kế 1 Section thuộc loại "${sectionType}" cho yêu cầu: "${userPrompt || 'giới thiệu lợi thế nổi bật'}"`;
    }

    try {
      const rawContent = await this.callGeminiChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ]);

      const parsed = JSON.parse(rawContent);
      const rawBlocks = parsed.blocks || [];

      const idMap = new Map<string, string>();
      const timestamp = Date.now();
      rawBlocks.forEach((b: any, idx: number) => {
        const oldId = String(b.id || `temp-${idx}`);
        const newId = `sec-ai-${timestamp}-${idx}`;
        idMap.set(oldId, newId);
      });

      const normalizedBlocks: BlockNode[] = rawBlocks.map((b: any, idx: number) => {
        const oldId = String(b.id || `temp-${idx}`);
        const newId = idMap.get(oldId) || `sec-ai-${timestamp}-${idx}`;
        const newParentId = b.parent_id ? (idMap.get(String(b.parent_id)) || b.parent_id) : null;
        return {
          id: newId,
          page_version_id: 'ver-ai',
          parent_id: newParentId,
          type: b.type || 'text',
          props: b.props || {},
          styles: b.styles || { base: {} },
          order_index: idx,
        };
      });

      return {
        summary: parsed.summary || 'Section mẫu được tạo bởi Gemini 2.5 Flash',
        section_type: parsed.section_type || sectionType,
        blocks: normalizedBlocks,
      };
    } catch (err: any) {
      this.logger.error(`Lỗi khi gọi Gemini sinh section: ${err.message}`);
      return this.fallbackGeneratedSection(sectionType, userPrompt);
    }
  }

  private fallbackGeneratedSection(sectionType: string, prompt: string): AIGenerateSectionResponse {
    const timestamp = Date.now();
    return {
      summary: `Section ${sectionType} dự phòng (Offline Fallback)`,
      section_type: sectionType,
      blocks: [
        {
          id: `sec-fb-${timestamp}-0`,
          page_version_id: 'ver-ai',
          parent_id: null,
          type: 'heading',
          props: { text: prompt || 'Tiêu Đề Section Mới', level: 'h2' },
          styles: { base: { textAlign: 'center', color: '#1E1B4B', marginBottom: '12px' } },
          order_index: 0,
        },
        {
          id: `sec-fb-${timestamp}-1`,
          page_version_id: 'ver-ai',
          parent_id: null,
          type: 'text',
          props: { richtext: 'Mô tả ngắn gọn về giá trị và lợi ích mang đến cho khách hàng...' },
          styles: { base: { textAlign: 'center', color: '#4B5563', maxWidth: '700px', margin: '0 auto 20px auto' } },
          order_index: 1,
        },
        {
          id: `sec-fb-${timestamp}-2`,
          page_version_id: 'ver-ai',
          parent_id: null,
          type: 'button',
          props: { label: 'Khám Phá Thêm', href: '#' },
          styles: { base: { backgroundColor: 'var(--color-primary, #2F6F4F)', color: '#FFFFFF', padding: '10px 24px', borderRadius: '8px' } },
          order_index: 2,
        },
      ],
    };
  }


  /**
   * Sprint 10: Gợi ý SEO Meta (Title & Meta Description)
   */
  async suggestSeoMeta(dto: AISuggestSeoMetaRequest): Promise<AISuggestSeoMetaResponse> {
    const lang = dto.language || 'vi';
    const content = dto.page_content.slice(0, 3000);

    try {
      const raw = await this.callGeminiChat([
        {
          role: 'system',
          content: `Bạn là chuyên gia SEO hàng đầu (${lang}). Trả về JSON: {"title_suggestion": "Tiêu đề trang chuẩn SEO tối đa 60 ký tự", "meta_description": "Thẻ mô tả từ 120-155 ký tự lôi cuốn"}`,
        },
        { role: 'user', content: `Nội dung trang web:\n${content}` },
      ]);

      const parsed = JSON.parse(raw);
      return {
        title_suggestion: parsed.title_suggestion || content.slice(0, 50),
        meta_description: parsed.meta_description || content.slice(0, 150),
      };
    } catch (error: any) {
      this.logger.warn(`Fallback SEO: ${error.message}`);
      return {
        title_suggestion: content.slice(0, 50).replace(/[#*`\n]+/g, ' ').trim(),
        meta_description: content.slice(0, 150).replace(/[#*`\n]+/g, ' ').trim() + '...',
      };
    }
  }

  /**
   * Sprint 10: Tóm tắt Excerpt bài viết / sản phẩm
   */
  async suggestExcerpt(dto: AISuggestExcerptRequest): Promise<AISuggestExcerptResponse> {
    const lang = dto.language || 'vi';
    const body = dto.body.slice(0, 3000);

    try {
      const raw = await this.callGeminiChat([
        {
          role: 'system',
          content: `Tóm tắt nội dung bài viết thành 1 đoạn trích dẫn (excerpt) từ 150-250 ký tự bằng tiếng (${lang}). Trả về duy nhất JSON: {"excerpt": "..."}`,
        },
        { role: 'user', content: body },
      ]);

      const parsed = JSON.parse(raw);
      return { excerpt: parsed.excerpt || body.slice(0, 200) + '...' };
    } catch (error: any) {
      this.logger.warn(`Fallback Excerpt: ${error.message}`);
      return { excerpt: body.slice(0, 200) + '...' };
    }
  }

  /**
   * Trợ lý Viết bài / Copywriting Assistant
   */
  async rewriteText(dto: {
    text: string;
    tone?: 'shorter' | 'persuasive' | 'formal' | 'casual' | 'translate_en';
  }): Promise<{ result: string }> {
    const toneMap: Record<string, string> = {
      shorter: 'Viết ngắn gọn, súc tích và cô đọng hơn nhưng vẫn đủ ý',
      persuasive: 'Viết hấp dẫn, lôi cuốn, mang tính kêu gọi hành động (CTA) để tăng chuyển đổi',
      formal: 'Viết trang trọng, lịch sự, chuyên nghiệp chuẩn văn phong doanh nghiệp',
      casual: 'Viết thân thiện, gần gũi, trẻ trung và tự nhiên',
      translate_en: 'Dịch chuẩn xác và tự nhiên sang tiếng Anh chuyên nghiệp',
    };

    const instruction = toneMap[dto.tone || 'persuasive'] || 'Viết lại hay và hấp dẫn hơn';

    try {
      const raw = await this.callGeminiChat([
        {
          role: 'system',
          content: `Bạn là chuyên gia Copywriter chuyên nghiệp. Nhiệm vụ: ${instruction}. Trả về duy nhất JSON: {"result": "nội dung đã viết lại"}`,
        },
        { role: 'user', content: dto.text },
      ]);

      const parsed = JSON.parse(raw);
      return { result: parsed.result || dto.text };
    } catch (err: any) {
      this.logger.warn(`Fallback rewrite: ${err.message}`);
      return { result: dto.text };
    }
  }

  /**
   * P2: AI Copywriter Theo Ngành Nghề & Giọng Điệu
   */
  async generateCopywriting(dto: AICopywriteRequest): Promise<AICopywriteResponse> {
    const industryMap: Record<string, string> = {
      restaurant: 'Nhà hàng, Quán ăn, Cafe, Ẩm thực',
      spa_beauty: 'Spa, Thẩm mỹ viện, Làm đẹp, Chăm sóc sức khỏe',
      real_estate: 'Bất động sản, Nhà đất, Dự án căn hộ, Kiến trúc',
      fashion: 'Thời trang, Phụ kiện, May mặc, Phong cách sống',
      tech: 'Công nghệ, Phần mềm SaaS, Thiết bị thông minh, Chuyển đổi số',
      education: 'Giáo dục, Khóa học trực tuyến, Trường học, Ngoại ngữ',
      healthcare: 'Phòng khám, Y tế, Dược phẩm, Nha khoa',
      general: 'Doanh nghiệp đa ngành, Dịch vụ tổng hợp',
    };

    const toneMap: Record<string, string> = {
      luxury: 'Sang trọng, đẳng cấp, tinh tế, tôn vinh vị thế khách hàng',
      friendly: 'Thân thiện, ấm áp, gần gũi, tạo cảm giác thân mật như người nhà',
      professional: 'Chuyên nghiệp, tin cậy, chuẩn mực, uy tín doanh nghiệp B2B',
      urgent_sale: 'Kêu gọi hành động mạnh mẽ, giục giã, nhấn mạnh ưu đãi giới hạn',
    };

    const fieldInstruction: Record<string, string> = {
      heading: 'tiêu đề trang hoặc tiêu đề phần (Heading) ngắn gọn (6-14 từ), ấn tượng, giật tít thu hút',
      text: 'đoạn văn bản mô tả giới thiệu hoặc cam kết giá trị (Text) súc tích, mạch lạc (2-4 câu)',
      button: 'nút bấm kêu gọi hành động (Call to Action / Button) ngắn gọn (2-5 từ), tạo động lực click ngay',
      about_story: 'câu chuyện thương hiệu hoặc giới thiệu sứ mệnh doanh nghiệp (About Us) truyền cảm hứng (3-5 câu)',
      slogan: 'khẩu hiệu hoặc câu slogan thương hiệu (3-8 từ), vần điệu, dễ nhớ',
    };

    const targetIndustry = industryMap[dto.industry || 'general'] || dto.industry || 'Doanh nghiệp';
    const targetTone = toneMap[dto.tone || 'professional'] || dto.tone || 'Chuyên nghiệp, hấp dẫn';
    const targetType = fieldInstruction[dto.field_type] || 'nội dung văn bản';

    const systemPrompt = `Bạn là một Giám đốc Sáng tạo và Chuyên gia Copywriting hàng đầu Việt Nam.
Nhiệm vụ: Viết 3 phương án ${targetType} bằng tiếng Việt chuẩn xác, tuyệt hay cho ngành "${targetIndustry}".
Sắc thái & giọng điệu: "${targetTone}".
${dto.site_name ? `Tên thương hiệu: "${dto.site_name}".` : ''}
${dto.keywords ? `Từ khóa hoặc điểm nhấn cần đưa vào: "${dto.keywords}".` : ''}
${dto.existing_text ? `Văn bản gốc cần cải tiến/viết lại: "${dto.existing_text}".` : ''}

Yêu cầu phân loại 3 gợi ý:
- Gợi ý 1 (label: "Ngắn gọn & Sắc bén"): Trực diện, súc tích, đập ngay vào trọng tâm.
- Gợi ý 2 (label: "Cảm xúc & Kể chuyện"): Chạm tới cảm xúc, gợi cảm giác tin tưởng, ấm áp hoặc sang trọng.
- Gợi ý 3 (label: "Kêu gọi hành động (CTA mạnh)"): Thúc đẩy khách hàng ra quyết định, nhấn mạnh lợi ích rõ ràng.

Định dạng trả về duy nhất là JSON hợp lệ theo schema sau, không kèm bất kỳ markdown hay giải thích nào ngoài JSON:
{
  "suggestions": [
    {
      "id": "s-1",
      "label": "Ngắn gọn & Sắc bén",
      "content": "...",
      "description": "..."
    },
    {
      "id": "s-2",
      "label": "Cảm xúc & Kể chuyện",
      "content": "...",
      "description": "..."
    },
    {
      "id": "s-3",
      "label": "Kêu gọi hành động (CTA mạnh)",
      "content": "...",
      "description": "..."
    }
  ]
}`;

    try {
      const raw = await this.callGeminiChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Hãy sinh 3 phương án cho ${dto.field_type}.` },
      ]);

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return {
          field_type: dto.field_type,
          suggestions: parsed.suggestions,
        };
      }
    } catch (err: any) {
      this.logger.warn(`AI Copywrite API Error: ${err.message}. Sử dụng fallback template.`);
    }

    return this.fallbackCopywrite(dto);
  }

  private fallbackCopywrite(dto: AICopywriteRequest): AICopywriteResponse {
    const kw = dto.keywords || 'chất lượng';
    if (dto.field_type === 'heading') {
      return {
        field_type: 'heading',
        suggestions: [
          { id: 'f-1', label: 'Ngắn gọn & Sắc bén', content: `Trải Nghiệm Đẳng Cấp Cùng ${kw.toUpperCase()}`, description: 'Trực diện, dễ nhớ' },
          { id: 'f-2', label: 'Cảm xúc & Kể chuyện', content: `Nơi Tinh Hoa Hội Tụ — Gửi Trọn Niềm Tin Vào ${kw}`, description: 'Ấm áp, gắn kết khách hàng' },
          { id: 'f-3', label: 'Kêu gọi hành động (CTA mạnh)', content: `Khám Phá Giải Pháp ${kw} Tốt Nhất Hôm Nay!`, description: 'Thúc đẩy tương tác' },
        ],
      };
    }
    if (dto.field_type === 'button') {
      return {
        field_type: 'button',
        suggestions: [
          { id: 'f-1', label: 'Ngắn gọn & Sắc bén', content: 'Đặt Ngay Hôm Nay', description: 'Nhanh chóng, rõ ràng' },
          { id: 'f-2', label: 'Cảm xúc & Kể chuyện', content: 'Khám Phá Trải Nghiệm', description: 'Gợi mở, tự nhiên' },
          { id: 'f-3', label: 'Kêu gọi hành động (CTA mạnh)', content: 'Nhận Ưu Đãi Độc Quyền Ngay', description: 'Thôi thúc chốt đơn' },
        ],
      };
    }
    return {
      field_type: 'text',
      suggestions: [
        { id: 'f-1', label: 'Ngắn gọn & Sắc bén', content: `Chúng tôi cam kết cung cấp dịch vụ ${kw} uy tín, chất lượng hàng đầu và giải pháp tối ưu cho mọi khách hàng.`, description: 'Cô đọng, tập trung thế mạnh' },
        { id: 'f-2', label: 'Cảm xúc & Kể chuyện', content: `Với tâm huyết và tình yêu nghề, chúng tôi không ngừng sáng tạo để mang đến những giá trị ${kw} trọn vẹn nhất cho bạn và gia đình.`, description: 'Cảm xúc, tạo dựng lòng tin' },
        { id: 'f-3', label: 'Kêu gọi hành động (CTA mạnh)', content: `Đừng bỏ lỡ cơ hội nâng tầm trải nghiệm với dịch vụ ${kw}. Liên hệ ngay với chúng tôi để nhận tư vấn chuyên sâu hoàn toàn miễn phí.`, description: 'Tối ưu chuyển đổi khách hàng' },
      ],
    };
  }

  /**
   * Fallback Layout khi mất kết nối mạng

   */
  private fallbackGeneratedLayout(prompt: string): AIGenerateLayoutResponse {
    return {
      summary: `Mẫu giao diện thông minh cho "${prompt}"`,
      prompt_used: prompt,
      blocks: [
        {
          id: `ai-b-${Date.now()}-0`,
          page_version_id: 'ver-1',
          parent_id: null,
          type: 'heading',
          props: { text: prompt.toUpperCase(), level: 'h2' },
          styles: { base: { textAlign: 'center', color: '#1E1B4B' } },
          order_index: 0,
        },
        {
          id: `ai-b-${Date.now()}-1`,
          page_version_id: 'ver-1',
          parent_id: null,
          type: 'text',
          props: {
            richtext:
              'Chào mừng quý khách đến với dịch vụ của chúng tôi. Chúng tôi cam kết mang lại chất lượng và sự hài lòng tuyệt đối.',
          },
          styles: { base: { textAlign: 'center', color: '#4B5563' } },
          order_index: 1,
        },
        {
          id: `ai-b-${Date.now()}-2`,
          page_version_id: 'ver-1',
          parent_id: null,
          type: 'image',
          props: {
            src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
            alt: prompt,
          },
          styles: { base: { borderRadius: '12px', width: '100%' } },
          order_index: 2,
        },
        {
          id: `ai-b-${Date.now()}-3`,
          page_version_id: 'ver-1',
          parent_id: null,
          type: 'button',
          props: { label: 'Liên Hệ Đặt Ngay', href: '#contact' },
          styles: {
            base: {
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '14px 28px',
              borderRadius: '8px',
            },
            hover: {
              backgroundColor: 'var(--color-accent)',
            },
          },
          order_index: 3,
        },
      ],
    };
  }
}

