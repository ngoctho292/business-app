import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db, pages, pageVersions, blocks, sites } from '../../db';
import { eq, and, or, desc, isNull, asc } from 'drizzle-orm';
import * as crypto from 'crypto';

import {
  PageDTO,
  PageVersionDTO,
  BlockNode,
  PagedResponse,
  PageStatus,
  VersionStatus,
} from '@t-business/shared-types';

@Injectable()
export class PagesService {
  /**
   * Lấy danh sách trang của một site
   */
  async getPages(
    siteId: string,
    limit = 20,
    cursor?: string,
    status?: PageStatus
  ): Promise<PagedResponse<PageDTO>> {
    const conditions = [eq(pages.site_id, siteId), isNull(pages.deleted_at)];
    if (status) {
      conditions.push(eq(pages.status, status));
    }

    const rows = await db.query.pages.findMany({
      where: and(...conditions),
      limit: limit + 1,
      orderBy: [desc(pages.created_at)],
    });

    const hasMore = rows.length > limit;
    const data = (hasMore ? rows.slice(0, limit) : rows).map((p) => this.mapToPageDTO(p));
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, next_cursor: nextCursor, has_more: hasMore };
  }

  /**
   * Lấy chi tiết trang và cây blocks hiện hành
   */
  async getPageById(siteId: string, pageId: string) {
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.site_id, siteId),
        isNull(pages.deleted_at)
      ),
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    let blockTree: BlockNode[] = [];
    if (page.current_version_id) {
      blockTree = await this.getBlockTreeByVersion(page.current_version_id);
    }

    return {
      ...this.mapToPageDTO(page),
      blocks: blockTree,
    };
  }

  /**
   * Public Render: Truy vấn trang đã publish theo Domain và Slug cho Renderer
   */
  async getPublicPageRender(domain: string, slug = 'home') {
    // 1. Tìm site theo internal domain hoặc custom domain
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });


    if (!site) {
      throw new NotFoundException(`Site with domain '${domain}' not found`);
    }

    const cleanSlug = slug === '' || slug === '/' ? 'home' : slug;

    // 2. Tìm trang theo slug
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.site_id, site.id),
        eq(pages.slug, cleanSlug),
        isNull(pages.deleted_at)
      ),
    });

    if (!page || !page.current_version_id) {
      throw new NotFoundException(
        `Page '${cleanSlug}' on site '${domain}' has not been published yet`
      );
    }

    // 3. Lấy cây blocks của current_version_id
    const blockList = await db.query.blocks.findMany({
      where: eq(blocks.page_version_id, page.current_version_id),
      orderBy: [asc(blocks.order_index)],
    });

    return {
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        theme: site.theme || {},
      },
      page: {
        id: page.id,
        slug: page.slug,
        status: page.status,
        seo_meta: page.seo_meta,
        current_version_id: page.current_version_id,
      },
      blocks: blockList.map((b) => ({
        id: b.id,
        page_version_id: b.page_version_id,
        parent_id: b.parent_id,
        type: b.type as any,
        props: b.props as any,
        styles: (b.styles as any) || { base: {} },
        custom_classes: (b.custom_classes as any) || [],
        custom_css: b.custom_css || '',
        order_index: b.order_index,
      })),
    };
  }


  /**
   * Đồng bộ cây blocks từ Editor lên Database (hỗ trợ draft, in_review, approved, published)
   */
  async syncCanvasBlocks(
    domain: string,
    slug: string,
    canvasBlocks: any[],
    targetStatus: 'draft' | 'in_review' | 'approved' | 'published' = 'published',
    userId?: string,
    seoMeta?: Record<string, any>
  ) {
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });

    if (!site) {
      throw new NotFoundException(`Site with domain '${domain}' not found`);
    }

    const cleanSlug = slug === '' || slug === '/' ? 'home' : slug;

    let page = await db.query.pages.findFirst({
      where: and(
        eq(pages.site_id, site.id),
        eq(pages.slug, cleanSlug),
        isNull(pages.deleted_at)
      ),
    });

    if (!page) {
      const [newPage] = await db
        .insert(pages)
        .values({
          site_id: site.id,
          slug: cleanSlug,
          status: targetStatus === 'published' ? 'published' : 'draft',
          seo_meta: seoMeta || {},
          created_by: userId,
        })
        .returning();
      page = newPage;
    }

    // Lấy version_number tiếp theo
    const lastVersion = await db.query.pageVersions.findFirst({
      where: eq(pageVersions.page_id, page.id),
      orderBy: [desc(pageVersions.version_number)],
    });
    const nextNumber = (lastVersion?.version_number || 0) + 1;

    // Tạo version mới
    const [newVersion] = await db
      .insert(pageVersions)
      .values({
        page_id: page.id,
        version_number: nextNumber,
        status: targetStatus,
        created_by: userId,
        submitted_by: targetStatus === 'in_review' ? userId : undefined,
        approved_by: targetStatus === 'approved' ? userId : undefined,
      })
      .returning();

    // Map client IDs to valid UUIDs
    const idMap = new Map<string, string>();
    if (canvasBlocks && Array.isArray(canvasBlocks)) {
      for (const b of canvasBlocks) {
        if (b.id) {
          idMap.set(b.id, crypto.randomUUID());
        }
      }

      for (let i = 0; i < canvasBlocks.length; i++) {
        const b = canvasBlocks[i];
        const newBlockId = (b.id ? idMap.get(b.id) : null) || crypto.randomUUID();
        const parentId = b.parent_id ? (idMap.get(b.parent_id) || null) : null;

        await db.insert(blocks).values({
          id: newBlockId,
          page_version_id: newVersion.id,
          parent_id: parentId,
          type: b.type,
          props: b.props || {},
          styles: b.styles || { base: {} },
          custom_classes: b.custom_classes || [],
          custom_css: b.custom_css || null,
          order_index: b.order_index ?? i,
        });
      }
    }

    const isPublished = targetStatus === 'published';

    // Cập nhật page
    const pageUpdatePayload: Record<string, any> = {
      updated_at: new Date(),
    };
    if (seoMeta && typeof seoMeta === 'object' && Object.keys(seoMeta).length > 0) {
      pageUpdatePayload.seo_meta = {
        ...((page.seo_meta as Record<string, any>) || {}),
        ...seoMeta,
      };
    }
    if (isPublished) {
      pageUpdatePayload.current_version_id = newVersion.id;
      pageUpdatePayload.status = 'published';
    } else if (targetStatus === 'in_review') {
      pageUpdatePayload.status = 'in_review';
    } else if (targetStatus === 'approved') {
      pageUpdatePayload.status = 'approved';
    }

    await db
      .update(pages)
      .set(pageUpdatePayload)
      .where(eq(pages.id, page.id));

    // Kích hoạt revalidate sang Next.js Renderer nếu xuất bản
    if (isPublished) {
      await this.triggerRendererRevalidate(site.id, page.slug);
    }

    const hostPrefix = site.domain;
    const publishedUrl = `http://localhost:3000/?site=${hostPrefix}${cleanSlug === 'home' ? '' : '/' + cleanSlug}`;

    return {
      success: true,
      message: isPublished
        ? 'Xuất bản website thành công!'
        : targetStatus === 'in_review'
        ? 'Đã gửi duyệt bản vẽ thiết kế!'
        : targetStatus === 'approved'
        ? 'Đã phê duyệt bản vẽ thiết kế!'
        : 'Đã lưu bản nháp thành công!',
      site_id: site.id,
      page_id: page.id,
      version_id: newVersion.id,
      status: targetStatus,
      published_url: publishedUrl,
    };
  }

  async syncCanvasBlocksAndPublish(domain: string, slug: string, canvasBlocks: any[]) {
    return this.syncCanvasBlocks(domain, slug, canvasBlocks, 'published');
  }

  /**
   * Cập nhật theme của site theo domain (dành cho ThemeModal)
   */
  async updateSiteThemeByDomain(domain: string, theme: Record<string, any>) {
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });

    if (!site) {
      throw new NotFoundException(`Site with domain '${domain}' not found`);
    }

    const mergedTheme = {
      ...((site.theme as Record<string, any>) || {}),
      ...theme,
    };

    const [updated] = await db
      .update(sites)
      .set({
        theme: mergedTheme,
        updated_at: new Date(),
      })
      .where(eq(sites.id, site.id))
      .returning();

    return updated.theme;
  }

  /**
   * Lấy dữ liệu mới nhất phục vụ Editor Canvas (bao gồm cả bản draft chưa publish)
   */
  async getEditorPageData(domain: string, slug: string) {
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });

    if (!site) {
      throw new NotFoundException(`Site with domain '${domain}' not found`);
    }

    const cleanSlug = slug === '' || slug === '/' ? 'home' : slug;

    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.site_id, site.id),
        eq(pages.slug, cleanSlug),
        isNull(pages.deleted_at)
      ),
    });

    if (!page) {
      return {
        site: {
          id: site.id,
          name: site.name,
          domain: site.domain,
          custom_domain: site.custom_domain,
          theme: site.theme || {},
        },
        page: null,
        version: null,
        blocks: [],
      };
    }

    // Ưu tiên lấy version mới nhất (draft, in_review, approved hoặc published)
    const latestVersion = await db.query.pageVersions.findFirst({
      where: eq(pageVersions.page_id, page.id),
      orderBy: [desc(pageVersions.version_number)],
    });

    const activeVersionId = latestVersion?.id || page.current_version_id;

    let blockList: any[] = [];
    if (activeVersionId) {
      blockList = await db.query.blocks.findMany({
        where: eq(blocks.page_version_id, activeVersionId),
        orderBy: [asc(blocks.order_index)],
      });
    }

    return {
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        custom_domain: site.custom_domain,
        theme: site.theme || {},
      },
      page: {
        id: page.id,
        slug: page.slug,
        status: page.status,
        seo_meta: page.seo_meta,
        current_version_id: page.current_version_id,
      },
      version: latestVersion
        ? {
            id: latestVersion.id,
            version_number: latestVersion.version_number,
            status: latestVersion.status,
          }
        : null,
      blocks: blockList.map((b) => ({
        id: b.id,
        page_version_id: b.page_version_id,
        parent_id: b.parent_id,
        type: b.type as any,
        props: b.props as any,
        styles: (b.styles as any) || { base: {} },
        custom_classes: (b.custom_classes as any) || [],
        custom_css: b.custom_css || '',
        order_index: b.order_index,
      })),
    };
  }

  /**
   * Tạo trang mới
   */
  async createPage(
    siteId: string,
    slug: string,
    seoMeta?: Record<string, unknown>,
    userId?: string
  ): Promise<PageDTO> {
    const existing = await db.query.pages.findFirst({
      where: and(
        eq(pages.site_id, siteId),
        eq(pages.slug, slug),
        isNull(pages.deleted_at)
      ),
    });

    if (existing) {
      throw new BadRequestException(`Slug '${slug}' already exists in this site`);
    }

    const [newPage] = await db
      .insert(pages)
      .values({
        site_id: siteId,
        slug: slug,
        status: 'draft',
        seo_meta: seoMeta || {},
        created_by: userId,
      })
      .returning();

    return this.mapToPageDTO(newPage);
  }

  /**
   * Cập nhật thông tin trang
   */
  async updatePage(
    siteId: string,
    pageId: string,
    slug?: string,
    seoMeta?: Record<string, unknown>,
    userId?: string
  ): Promise<PageDTO> {
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.site_id, siteId),
        isNull(pages.deleted_at)
      ),
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const mergedSeo = seoMeta
      ? { ...(page.seo_meta as Record<string, unknown>), ...seoMeta }
      : page.seo_meta;

    const [updated] = await db
      .update(pages)
      .set({
        slug: slug || page.slug,
        seo_meta: mergedSeo,
        updated_by: userId,
        updated_at: new Date(),
      })
      .where(eq(pages.id, pageId))
      .returning();

    return this.mapToPageDTO(updated);
  }

  /**
   * Xóa trang (Bảo vệ không cho xóa trang chủ Home)
   */
  async deletePage(siteId: string, pageId: string, userId?: string): Promise<void> {
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.site_id, siteId)
      ),
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.slug === 'home') {
      throw new BadRequestException('Không thể xóa trang chủ (Home)');
    }

    // Cascade delete sẽ tự động dọn sạch pageVersions và blocks
    await db.delete(pages).where(eq(pages.id, pageId));
  }

  /**
   * Lấy danh sách versions của trang
   */
  async getVersions(
    siteId: string,
    pageId: string,
    limit = 20,
    cursor?: string
  ): Promise<PagedResponse<PageVersionDTO>> {
    const rows = await db.query.pageVersions.findMany({
      where: eq(pageVersions.page_id, pageId),
      limit: limit + 1,
      orderBy: [desc(pageVersions.version_number)],
    });

    const hasMore = rows.length > limit;
    const data = (hasMore ? rows.slice(0, limit) : rows).map((v) => this.mapToVersionDTO(v));
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, next_cursor: nextCursor, has_more: hasMore };
  }

  /**
   * Tạo phiên bản mới của trang (Page Version)
   */
  async createVersion(
    siteId: string,
    pageId: string,
    status: VersionStatus = 'draft',
    initialBlocks: any[] = [],
    userId?: string
  ): Promise<PageVersionDTO> {
    const lastVersion = await db.query.pageVersions.findFirst({
      where: eq(pageVersions.page_id, pageId),
      orderBy: [desc(pageVersions.version_number)],
    });

    const nextNumber = (lastVersion?.version_number || 0) + 1;

    const [newVersion] = await db
      .insert(pageVersions)
      .values({
        page_id: pageId,
        version_number: nextNumber,
        status: status,
        created_by: userId,
        submitted_by: userId,
      })
      .returning();

    // Thêm initial blocks nếu có
    if (initialBlocks.length > 0) {
      await db.insert(blocks).values(
        initialBlocks.map((b, idx) => ({
          page_version_id: newVersion.id,
          parent_id: b.parent_id || null,
          type: b.type,
          props: b.props || {},
          order_index: idx,
          created_by: userId,
        }))
      );
    }

    return this.mapToVersionDTO(newVersion);
  }

  /**
   * Duyệt phiên bản (Check-and-Balance: approved_by != submitted_by)
   */
  async approveVersion(
    siteId: string,
    pageId: string,
    versionId: string,
    reviewNotes?: Record<string, unknown>,
    currentUserId?: string,
    isPlatformAdmin = false
  ): Promise<PageVersionDTO> {
    const version = await db.query.pageVersions.findFirst({
      where: and(
        eq(pageVersions.id, versionId),
        eq(pageVersions.page_id, pageId)
      ),
    });

    if (!version) {
      throw new NotFoundException('Page version not found');
    }

    if (!isPlatformAdmin && version.submitted_by === currentUserId) {
      throw new ForbiddenException(
        'Check-and-Balance violation: The submitter cannot approve their own version. Another reviewer or Platform Admin is required.'
      );
    }

    const [updated] = await db
      .update(pageVersions)
      .set({
        status: 'approved',
        approved_by: currentUserId || null,
        review_notes: reviewNotes || null,
      })
      .where(eq(pageVersions.id, versionId))
      .returning();

    return this.mapToVersionDTO(updated);
  }

  /**
   * Xuất bản phiên bản lên trang chính và kích hoạt On-demand ISR Revalidation
   */
  async publishVersion(
    siteId: string,
    pageId: string,
    versionId: string,
    userId?: string
  ): Promise<{ published_url: string; page: PageDTO }> {
    const version = await db.query.pageVersions.findFirst({
      where: and(
        eq(pageVersions.id, versionId),
        eq(pageVersions.page_id, pageId)
      ),
    });

    if (!version) {
      throw new NotFoundException('Page version not found');
    }

    // Cập nhật version status sang published
    await db
      .update(pageVersions)
      .set({ status: 'published' })
      .where(eq(pageVersions.id, versionId));

    // Cập nhật page.current_version_id và page.status
    const [updatedPage] = await db
      .update(pages)
      .set({
        current_version_id: versionId,
        status: 'published',
        updated_by: userId,
        updated_at: new Date(),
      })
      .where(eq(pages.id, pageId))
      .returning();

    // Kích hoạt On-demand ISR Revalidation sang Next.js Renderer
    this.triggerRendererRevalidate(siteId, updatedPage.slug);

    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    const domain = site?.domain || 'localhost:3000';
    const publishedUrl = `http://${domain}/${updatedPage.slug === 'home' ? '' : updatedPage.slug}`;

    return {
      published_url: publishedUrl,
      page: this.mapToPageDTO(updatedPage),
    };
  }

  /**
   * Gửi HTTP webhook sang Next.js Renderer để xóa cache ISR tức thì
   */
  private async triggerRendererRevalidate(siteId: string, slug: string) {
    try {
      const site = await db.query.sites.findFirst({
        where: eq(sites.id, siteId),
      });

      if (!site) return;

      const rendererUrl = process.env.RENDERER_URL || 'http://localhost:3000';
      const secret =
        process.env.RENDERER_REVALIDATE_SECRET ||
        'secret_revalidate_token_between_backend_and_renderer_123';

      console.log(`[ISR] Kích hoạt Revalidate: ${rendererUrl}/api/revalidate cho ${site.domain}/${slug}`);

      await fetch(`${rendererUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({
          domain: site.domain,
          slug: slug === 'home' ? '' : slug,
        }),
      });
    } catch (err: any) {
      console.warn(`[ISR WARNING] Không thể kết nối tới Renderer ISR webhook:`, err.message);
    }
  }

  private async getBlockTreeByVersion(versionId: string): Promise<BlockNode[]> {
    const rows = await db.query.blocks.findMany({
      where: eq(blocks.page_version_id, versionId),
      orderBy: [asc(blocks.order_index)],
    });

    return rows.map((b) => ({
      id: b.id,
      page_version_id: b.page_version_id,
      parent_id: b.parent_id,
      type: b.type as any,
      props: b.props as any,
      styles: (b.styles as any) || { base: {} },
      custom_classes: (b.custom_classes as any) || [],
      custom_css: b.custom_css || '',
      order_index: b.order_index,
    }));
  }


  private mapToPageDTO(row: any): PageDTO {
    return {
      id: row.id,
      site_id: row.site_id,
      current_version_id: row.current_version_id,
      slug: row.slug,
      status: row.status,
      seo_meta: row.seo_meta,
      created_at: row.created_at?.toISOString() || new Date().toISOString(),
      updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  private mapToVersionDTO(row: any): PageVersionDTO {
    return {
      id: row.id,
      page_id: row.page_id,
      version_number: row.version_number,
      status: row.status,
      submitted_by: row.submitted_by,
      approved_by: row.approved_by,
      review_notes: row.review_notes,
      created_at: row.created_at?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Trả về danh sách slug và updated_at của các trang đã publish của một domain.
   * Dùng cho sitemap.xml và robots.txt generation.
   */
  async getPublishedPageSlugs(
    domain: string
  ): Promise<{ slug: string; updated_at: string }[]> {
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });


    if (!site) return [];

    const rows = await db.query.pages.findMany({
      where: and(
        eq(pages.site_id, site.id),
        eq(pages.status, 'published'),
        isNull(pages.deleted_at)
      ),
      orderBy: [desc(pages.updated_at)],
    });

    return rows.map((p) => ({
      slug: p.slug,
      updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    }));
  }
}
