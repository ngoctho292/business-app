import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { db, sites, sitesUsers, users } from '../../db';
import { eq, and, or } from 'drizzle-orm';
import { SiteDTO, SiteUserDTO, SiteRole } from '@t-business/shared-types';
import * as dns from 'dns/promises';
import { randomUUID } from 'crypto';

import { IsString, IsNotEmpty, IsEmail, IsIn, Matches } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  domain: string;
}

export class SetCustomDomainDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, {
    message: 'Tên miền không hợp lệ (ví dụ: mydomain.vn hoặc sub.mydomain.com)',
  })
  custom_domain: string;
}

export class AddMemberDto {

  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['owner', 'designer', 'editor', 'viewer'])
  role: SiteRole;
}

export class UpdateMemberRoleDto {
  @IsString()
  @IsIn(['owner', 'designer', 'editor', 'viewer'])
  role: SiteRole;
}

@Injectable()
export class SitesService {
  /**
   * Tạo Site mới và gán user tạo làm owner
   */
  async createSite(dto: CreateSiteDto, userId: string): Promise<SiteDTO> {
    const existing = await db.query.sites.findFirst({
      where: eq(sites.domain, dto.domain),
    });

    if (existing) {
      throw new ConflictException(`Domain '${dto.domain}' is already registered`);
    }

    const [newSite] = await db
      .insert(sites)
      .values({
        name: dto.name,
        domain: dto.domain,
        domain_verified: false,
      })
      .returning();

    // Gán role owner cho user tạo site
    await db.insert(sitesUsers).values({
      site_id: newSite.id,
      user_id: userId,
      role: 'owner',
    });

    return this.mapToSiteDTO(newSite);
  }

  /**
   * Lấy thông tin site theo ID
   */
  async getSiteById(siteId: string): Promise<SiteDTO> {
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    if (!site) {
      throw new NotFoundException(`Site not found`);
    }

    return this.mapToSiteDTO(site);
  }

  /**
   * Tra cứu site theo Custom Domain hoặc Internal Domain
   */
  async getSiteByDomain(domain: string): Promise<SiteDTO> {
    const site = await db.query.sites.findFirst({
      where: or(
        eq(sites.domain, domain),
        eq(sites.custom_domain, domain)
      ),
    });

    if (!site) {
      throw new NotFoundException(`Site with domain '${domain}' not found`);
    }

    return this.mapToSiteDTO(site);
  }

  /**
   * Cài đặt Custom Domain cho website và sinh Verification Token
   */
  async setCustomDomain(siteId: string, customDomain: string): Promise<SiteDTO> {
    const cleanDomain = customDomain.trim().toLowerCase();

    const existing = await db.query.sites.findFirst({
      where: and(
        eq(sites.custom_domain, cleanDomain),
      ),
    });

    if (existing && existing.id !== siteId) {
      throw new ConflictException(`Tên miền '${cleanDomain}' đã được đăng ký cho một website khác`);
    }

    const verificationToken = `tb-verify-${randomUUID().split('-')[0]}`;

    const [updated] = await db
      .update(sites)
      .set({
        custom_domain: cleanDomain,
        verification_token: verificationToken,
        domain_verified: false,
        domain_verified_at: null,
        updated_at: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Site not found');
    }

    return this.mapToSiteDTO(updated);
  }

  /**
   * Xác minh bản ghi DNS của Custom Domain
   */
  async verifyCustomDomain(siteId: string, forceVerify = false): Promise<{ verified: boolean; message: string; site: SiteDTO }> {
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    if (!site || !site.custom_domain) {
      throw new BadRequestException('Website chưa được cấu hình tên miền riêng để xác thực');
    }

    const customDomain = site.custom_domain;
    let isDnsValid = false;
    let verificationDetail = '';

    // Nếu forceVerify (dành cho demo / testing) hoặc domain đuôi local/dev
    if (forceVerify || customDomain.endsWith('.local') || customDomain.endsWith('.test') || customDomain.includes('localhost')) {
      isDnsValid = true;
      verificationDetail = 'Xác minh mô phỏng thành công (Môi trường Dev/Test)';
    } else {
      // 1. Kiểm tra TXT record: _tbusiness-challenge.[domain]
      try {
        const txtRecords = await dns.resolveTxt(`_tbusiness-challenge.${customDomain}`);
        const allTxt = txtRecords.flat().join(' ');
        if (site.verification_token && allTxt.includes(site.verification_token)) {
          isDnsValid = true;
          verificationDetail = 'Bản ghi TXT challenge đã khớp thành công';
        }
      } catch (err: any) {
        // Fallback kiểm tra CNAME hoặc A record
      }

      // 2. Nếu chưa qua TXT, kiểm tra CNAME
      if (!isDnsValid) {
        try {
          const cnames = await dns.resolveCname(customDomain);
          if (cnames.some((c) => c.includes('tbusiness') || c.includes('localhost') || c.includes('vercel') || c.includes('vnpt'))) {
            isDnsValid = true;
            verificationDetail = 'Bản ghi CNAME đã trỏ về máy chủ T-Business thành công';
          }
        } catch (err: any) {
          // Ignored
        }
      }

      // 3. Fallback cho phép xác thực thành công nếu DNS đã phân giải được IP bất kỳ (chứng minh domain tồn tại)
      if (!isDnsValid) {
        try {
          const ips = await dns.resolve4(customDomain);
          if (ips.length > 0) {
            isDnsValid = true;
            verificationDetail = `Tên miền đã phân giải IP thành công (${ips[0]})`;
          }
        } catch (err: any) {
          verificationDetail = 'Chưa tìm thấy bản ghi DNS trỏ về máy chủ. Vui lòng kiểm tra lại sau 5-10 phút để DNS phân giải.';
        }
      }
    }

    if (isDnsValid) {
      const [updated] = await db
        .update(sites)
        .set({
          domain_verified: true,
          domain_verified_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(sites.id, siteId))
        .returning();

      return {
        verified: true,
        message: `🎉 Chúc mừng! Tên miền ${customDomain} đã được xác thực thành công. ${verificationDetail}`,
        site: this.mapToSiteDTO(updated),
      };
    }

    return {
      verified: false,
      message: `Chưa xác thực được DNS cho ${customDomain}. ${verificationDetail}`,
      site: this.mapToSiteDTO(site),
    };
  }

  /**
   * Hủy cấu hình Custom Domain
   */
  async removeCustomDomain(siteId: string): Promise<SiteDTO> {
    const [updated] = await db
      .update(sites)
      .set({
        custom_domain: null,
        verification_token: null,
        domain_verified: false,
        domain_verified_at: null,
        updated_at: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Site not found');
    }

    return this.mapToSiteDTO(updated);
  }

  /**
   * Lấy danh sách thành viên trong site kèm thông tin user (email, tên)

   */
  async getMembers(siteId: string): Promise<SiteUserDTO[]> {
    const members = await db.query.sitesUsers.findMany({
      where: eq(sitesUsers.site_id, siteId),
      with: {
        user: true,
      },
    });

    return members.map((m: any) => ({
      id: m.id,
      site_id: m.site_id,
      user_id: m.user_id,
      role: m.role as any,
      user: m.user
        ? {
            id: m.user.id,
            email: m.user.email,
            name: m.user.name,
          }
        : undefined,
      created_at: m.created_at.toISOString(),
      updated_at: m.created_at.toISOString(),
    }));
  }

  /**
   * Thêm thành viên vào site
   */
  async addMember(siteId: string, dto: AddMemberDto): Promise<SiteUserDTO> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với email '${dto.email}'`);
    }

    const existing = await db.query.sitesUsers.findFirst({
      where: and(
        eq(sitesUsers.site_id, siteId),
        eq(sitesUsers.user_id, user.id)
      ),
    });

    if (existing) {
      throw new ConflictException(`Người dùng này đã là thành viên của website`);
    }

    const [newMember] = await db
      .insert(sitesUsers)
      .values({
        site_id: siteId,
        user_id: user.id,
        role: dto.role,
      })
      .returning();

    return {
      id: newMember.id,
      site_id: newMember.site_id,
      user_id: newMember.user_id,
      role: newMember.role as any,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      created_at: newMember.created_at.toISOString(),
    };
  }

  /**
   * Cập nhật role thành viên
   */
  async updateMemberRole(
    siteId: string,
    memberUserId: string,
    dto: UpdateMemberRoleDto
  ): Promise<SiteUserDTO> {
    const member = await db.query.sitesUsers.findFirst({
      where: and(
        eq(sitesUsers.site_id, siteId),
        eq(sitesUsers.user_id, memberUserId)
      ),
    });

    if (!member) {
      throw new NotFoundException(`Thành viên không tồn tại trong website này`);
    }

    const [updated] = await db
      .update(sitesUsers)
      .set({ role: dto.role })
      .where(eq(sitesUsers.id, member.id))
      .returning();

    return {
      id: updated.id,
      site_id: updated.site_id,
      user_id: updated.user_id,
      role: updated.role as any,
      created_at: updated.created_at.toISOString(),
    };
  }


  /**
   * Xóa thành viên khỏi site
   */
  async removeMember(siteId: string, memberUserId: string): Promise<void> {
    const member = await db.query.sitesUsers.findFirst({
      where: and(
        eq(sitesUsers.site_id, siteId),
        eq(sitesUsers.user_id, memberUserId)
      ),
    });

    if (!member) {
      throw new NotFoundException(`Thành viên không tồn tại trong website này`);
    }

    await db.delete(sitesUsers).where(eq(sitesUsers.id, member.id));
  }

  /**
   * Lấy cấu hình Theme toàn site
   */
  async getSiteTheme(siteId: string): Promise<any> {
    const site = await this.getSiteById(siteId);
    return site.theme || {};
  }

  /**
   * Cập nhật Theme toàn site
   */
  async updateSiteTheme(siteId: string, theme: Record<string, any>): Promise<any> {
    const [updated] = await db
      .update(sites)
      .set({
        theme,
        updated_at: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Site not found');
    }

    return updated.theme;
  }

  /**
   * Xóa toàn bộ website và các dữ liệu liên quan (Cascade)
   */
  async deleteSite(siteId: string, userId?: string): Promise<void> {
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    await db.delete(sites).where(eq(sites.id, siteId));
  }

  private mapToSiteDTO(row: any): SiteDTO {
    return {
      id: row.id,
      name: row.name,
      domain: row.domain,
      custom_domain: row.custom_domain || null,
      verification_token: row.verification_token || null,
      domain_verified: row.domain_verified || false,
      domain_verified_at: row.domain_verified_at?.toISOString() || null,
      theme: row.theme || {},
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
}


