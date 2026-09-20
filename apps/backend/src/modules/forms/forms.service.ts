import { Injectable, NotFoundException } from '@nestjs/common';
import { db, formSubmissions, sites } from '../../db';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';
import { FormSubmissionDTO, PagedResponse } from '@t-business/shared-types';

export interface SubmitFormDto {
  site_id?: string;
  domain?: string;
  page_slug?: string;
  form_title?: string;
  payload: Record<string, any>;
}

@Injectable()
export class FormsService {
  /**
   * Nhận form submission công khai từ website renderer
   */
  async submitForm(dto: SubmitFormDto): Promise<{ success: boolean; submission_id: string; message: string }> {
    let siteId: string = dto.site_id || '';

    if (!siteId && dto.domain) {
      const site = await db.query.sites.findFirst({
        where: eq(sites.domain, dto.domain),
      });
      if (site) siteId = String(site.id);
    }

    if (!siteId) {
      // Fallback tìm site đầu tiên nếu local dev
      const firstSite = await db.query.sites.findFirst();
      if (!firstSite) {
        throw new NotFoundException('Không tìm thấy website để lưu trữ form');
      }
      siteId = String(firstSite.id);
    }

    const [newRecord] = await db
      .insert(formSubmissions)
      .values({
        site_id: siteId,


        page_slug: dto.page_slug || 'home',
        form_title: dto.form_title || 'Form Liên Hệ',
        payload: dto.payload || {},
        is_read: false,
      })
      .returning();

    return {
      success: true,
      submission_id: newRecord.id,
      message: 'Cảm ơn bạn! Thông tin đã được gửi thành công đến quản trị viên.',
    };
  }

  /**
   * Lấy danh sách form submissions của một site
   */
  async getSubmissions(
    siteId: string,
    limit = 20,
    cursor?: string,
    pageSlug?: string
  ): Promise<PagedResponse<FormSubmissionDTO>> {
    const take = Math.min(Math.max(1, limit), 100);
    const conditions = [eq(formSubmissions.site_id, siteId)];

    if (pageSlug) {
      conditions.push(eq(formSubmissions.page_slug, pageSlug));
    }

    if (cursor) {
      const cursorDate = new Date(cursor);
      conditions.push(lt(formSubmissions.created_at, cursorDate));
    }

    const rows = await db.query.formSubmissions.findMany({
      where: and(...conditions),
      orderBy: [desc(formSubmissions.created_at)],
      limit: take + 1,
    });

    const hasMore = rows.length > take;
    const data = (hasMore ? rows.slice(0, take) : rows).map((r) => this.mapToDto(r));
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].created_at
        : null;

    return {
      data,
      next_cursor: nextCursor,
      has_more: hasMore,
    };
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(siteId: string, submissionId: string): Promise<FormSubmissionDTO> {
    const [updated] = await db
      .update(formSubmissions)
      .set({ is_read: true })
      .where(
        and(
          eq(formSubmissions.id, submissionId),
          eq(formSubmissions.site_id, siteId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Không tìm thấy thông tin gửi form');
    }

    return this.mapToDto(updated);
  }

  /**
   * Xóa form submission
   */
  async deleteSubmission(siteId: string, submissionId: string): Promise<void> {
    const record = await db.query.formSubmissions.findFirst({
      where: and(
        eq(formSubmissions.id, submissionId),
        eq(formSubmissions.site_id, siteId)
      ),
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy thông tin gửi form');
    }

    await db
      .delete(formSubmissions)
      .where(
        and(
          eq(formSubmissions.id, submissionId),
          eq(formSubmissions.site_id, siteId)
        )
      );
  }

  private mapToDto(row: any): FormSubmissionDTO {
    return {
      id: row.id,
      site_id: row.site_id,
      page_slug: row.page_slug,
      form_title: row.form_title,
      payload: row.payload || {},
      is_read: row.is_read || false,
      created_at: row.created_at.toISOString(),
    };
  }
}
