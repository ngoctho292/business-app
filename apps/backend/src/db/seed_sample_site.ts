import { db, sites, users, sitesUsers, pages, pageVersions, blocks, customBlocks } from './index';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function seedSampleSite() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mẫu website hoàn chỉnh (CloudNext Technologies)...');

  // 1. Tìm các tài khoản quản trị
  const adminUser = await db.query.users.findFirst({
    where: eq(users.email, 'admin@tbusiness.local'),
  });
  const designerUser = await db.query.users.findFirst({
    where: eq(users.email, 'designer@agency.vn'),
  });
  const userTho = await db.query.users.findFirst({
    where: eq(users.email, 'nguyenngoctho393@gmail.com'),
  });

  const creatorId = adminUser?.id || designerUser?.id;

  // 2. Tạo hoặc làm mới Site "cloudnext.local"
  const domain = 'cloudnext.local';
  let site = await db.query.sites.findFirst({
    where: eq(sites.domain, domain),
  });

  if (site) {
    console.log(`  ℹ️ Site ${domain} đã tồn tại (ID: ${site.id}), tiến hành làm mới dữ liệu trang...`);
    // Xoá các page cũ của site này để nạp mới tinh
    await db.delete(pages).where(eq(pages.site_id, site.id));
    await db.delete(customBlocks).where(eq(customBlocks.site_id, site.id));
  } else {
    const [insertedSite] = await db
      .insert(sites)
      .values({
        name: 'CloudNext Technologies — Giải Pháp Chuyển Đổi Số',
        domain: domain,
        domain_verified: true,
        domain_verified_at: new Date(),
        theme: {
          primaryColor: '#2563EB',
          accentColor: '#7C3AED',
          backgroundColor: '#0F172A',
          textColor: '#1E293B',
          fontHeading: 'Inter',
          fontBody: 'Inter',
          borderRadius: '12px',
        },
      })
      .returning();
    site = insertedSite;
    console.log(`  ✅ Đã tạo Website mới: ${site.name} (${domain})`);

    // Gán thành viên quản trị
    const memberInserts: { site_id: string; user_id: string; role: string }[] = [];
    if (adminUser) memberInserts.push({ site_id: site.id, user_id: adminUser.id, role: 'owner' });
    if (designerUser) memberInserts.push({ site_id: site.id, user_id: designerUser.id, role: 'designer' });
    if (userTho) memberInserts.push({ site_id: site.id, user_id: userTho.id, role: 'owner' });

    if (memberInserts.length > 0) {
      await db.insert(sitesUsers).values(memberInserts);
      console.log(`  ✅ Đã phân quyền thành viên quản trị cho Site.`);
    }
  }

  // Đảm bảo tất cả user hiện có đều có quyền truy cập vào site này
  const allDbUsers = await db.query.users.findMany();
  const targetSiteId = String(site!.id);
  for (const u of allDbUsers) {
    const targetUserId = String(u.id);
    const existing = await db.query.sitesUsers.findFirst({
      where: (su, { and, eq }) => and(eq(su.site_id, targetSiteId), eq(su.user_id, targetUserId)),
    });
    if (!existing) {
      await db.insert(sitesUsers).values({
        site_id: targetSiteId,
        user_id: targetUserId,
        role: 'owner',
      });
    }
  }
  console.log(`  ✅ Đã đồng bộ quyền truy cập site cho tất cả ${allDbUsers.length} tài khoản trong DB.`);

  // 3. Tạo Trang chủ (Page: home) + Page Version v1 (published)
  const [homePage] = await db
    .insert(pages)
    .values({
      site_id: site.id,
      slug: 'home',
      status: 'published',
      seo_meta: {
        title: 'CloudNext Technologies — Nền Tảng Chuyển Đổi Số Toàn Diện',
        description: 'Giải pháp điện toán đám mây thế hệ mới tích hợp AI tự động hóa giúp doanh nghiệp bứt phá hiệu suất vận hành 300%.',
        og_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      },
      created_by: creatorId,
    })
    .returning();

  const [v1] = await db
    .insert(pageVersions)
    .values({
      page_id: homePage.id,
      version_number: 1,
      status: 'published',
      submitted_by: creatorId,
      approved_by: creatorId,
      created_by: creatorId,
    })
    .returning();

  await db
    .update(pages)
    .set({ current_version_id: v1.id })
    .where(eq(pages.id, homePage.id));

  console.log(`  ✅ Đã tạo Page: /home (Version ID: ${v1.id})`);

  // 4. Xây dựng Cây Khối (Blocks Hierarchy)
  const allBlocksToInsert: any[] = [];
  let rootOrder = 0;

  // --------------------------------------------------------------------------
  // BLOCK 1: HEADER (Sticky Navigation Bar)
  // --------------------------------------------------------------------------
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: null,
    type: 'header',
    order_index: rootOrder++,
    props: {
      site_title: 'CloudNext',
      tagline: 'Enterprise Cloud Platform',
      logo_src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
      sticky: true,
      nav_links: [
        { label: 'Trang chủ', href: '#' },
        {
          label: 'Giải pháp',
          href: '#features',
          children: [
            { label: '🚀 Điện Toán Đám Mây', href: '#features' },
            { label: '🛡️ Bảo Mật & Lưu Trữ', href: '#features' },
            { label: '🤖 Trợ Lý AI Doanh Nghiệp', href: '#features' },
          ],
        },
        { label: 'Bảng giá', href: '#pricing' },
        { label: 'Khách hàng', href: '#testimonials' },
        { label: 'Liên hệ', href: '#contact' },
      ],
      cta_button: {
        show: true,
        label: 'Dùng Thử Miễn Phí',
        href: '#contact',
      },
    },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 2: HERO SECTION (Layout: split-left 60:40)
  // --------------------------------------------------------------------------
  const heroSectionId = randomUUID();
  allBlocksToInsert.push({
    id: heroSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: {
      layout: 'split-left',
      gap: 'lg',
      tag: 'section',
    },
    styles: {
      base: {
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#F8FAFC',
      },
    },
  });

  // Hero Left Column: Container chứa Text, Badge, Heading, Button
  const heroLeftContainerId = randomUUID();
  allBlocksToInsert.push({
    id: heroLeftContainerId,
    page_version_id: v1.id,
    parent_id: heroSectionId,
    type: 'container',
    order_index: 0,
    props: { tag: 'div' },
    styles: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
    },
  });

  // Khối Icon Badge trên Hero
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: heroLeftContainerId,
    type: 'icon',
    order_index: 0,
    props: {
      icon: 'solar:bolt-bold',
      size: 20,
      color: '#2563EB',
      style_variant: 'bold',
      bg_shape: 'rounded',
      bg_color: '#EFF6FF',
      padding: 10,
      align: 'left',
    },
    styles: {
      base: {
        marginBottom: '16px',
      },
    },
  });

  // Heading H1
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: heroLeftContainerId,
    type: 'heading',
    order_index: 1,
    props: {
      text: 'Nền Tảng Điện Toán Đám Mây & AI Cho Doanh Nghiệp Hiện Đại',
      level: 'h1',
    },
    styles: {
      base: {
        fontSize: '44px',
        fontWeight: '800',
        lineHeight: '1.2',
        color: '#0F172A',
        marginBottom: '20px',
        textAlign: 'left',
      },
      responsive: {
        mobile: {
          fontSize: '28px',
        },
      },
    },
  });

  // Đoạn giới thiệu Hero
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: heroLeftContainerId,
    type: 'text',
    order_index: 2,
    props: {
      richtext: 'Tăng tốc hiệu suất vận hành 300% với hạ tầng CloudNext thế hệ mới. Tự động hóa quy trình kinh doanh, lưu trữ dữ liệu an toàn và khai phóng sức mạnh AI thông minh.',
    },
    styles: {
      base: {
        fontSize: '18px',
        lineHeight: '1.7',
        color: '#475569',
        marginBottom: '32px',
        textAlign: 'left',
      },
    },
  });

  // Nút CTA Hero
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: heroLeftContainerId,
    type: 'button',
    order_index: 3,
    props: {
      label: 'Bắt Đầu Trải Nghiệm Ngay →',
      href: '#pricing',
    },
    styles: {
      base: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '700',
        padding: '14px 32px',
        borderRadius: '10px',
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
        cursor: 'pointer',
      },
      hover: {
        backgroundColor: '#1D4ED8',
        transform: 'translateY(-2px)',
      },
    },
  });

  // Hero Right Column: Hình ảnh Dashboard sản phẩm
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: heroSectionId,
    type: 'image',
    order_index: 1,
    props: {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      alt: 'CloudNext Enterprise Dashboard',
      caption: 'Giao diện giám sát thời gian thực CloudNext Analytics',
    },
    styles: {
      base: {
        borderRadius: '16px',
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.15)',
        width: '100%',
        objectFit: 'cover',
      },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 3: FEATURES SECTION (Layout: grid-3 với 3 Card Container)
  // --------------------------------------------------------------------------
  // Section Tiêu đề Giới thiệu Lợi thế
  const featHeaderSectionId = randomUUID();
  allBlocksToInsert.push({
    id: featHeaderSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: {
      layout: 'stack',
      tag: 'section',
    },
    styles: {
      base: {
        paddingTop: '60px',
        paddingBottom: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: featHeaderSectionId,
    type: 'heading',
    order_index: 0,
    props: {
      text: 'Tại Sao Doanh Nghiệp Lựa Chọn CloudNext?',
      level: 'h2',
    },
    styles: {
      base: {
        fontSize: '34px',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '12px',
        textAlign: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: featHeaderSectionId,
    type: 'text',
    order_index: 1,
    props: {
      richtext: 'Giải pháp được tối ưu hóa toàn diện trên hạ tầng mạng băng thông rộng và trung tâm dữ liệu đạt chuẩn Tier III.',
    },
    styles: {
      base: {
        fontSize: '16px',
        color: '#64748B',
        maxWidth: '680px',
        margin: '0 auto',
        textAlign: 'center',
      },
    },
  });

  // Section Grid 3 Cột chứa 3 Container Cards
  const featGridSectionId = randomUUID();
  allBlocksToInsert.push({
    id: featGridSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: {
      layout: 'grid-3',
      gap: 'md',
      tag: 'section',
    },
    styles: {
      base: {
        paddingTop: '20px',
        paddingBottom: '60px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
      },
    },
  });

  // Feature Card 1: Tốc độ
  const card1Id = randomUUID();
  allBlocksToInsert.push({
    id: card1Id,
    page_version_id: v1.id,
    parent_id: featGridSectionId,
    type: 'container',
    order_index: 0,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#F8FAFC',
        padding: '32px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      hover: {
        borderColor: '#2563EB',
        boxShadow: '0 12px 24px -10px rgba(37, 99, 235, 0.15)',
        transform: 'translateY(-4px)',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card1Id,
    type: 'icon',
    order_index: 0,
    props: {
      icon: 'solar:bolt-bold',
      size: 28,
      color: '#2563EB',
      style_variant: 'bold',
      bg_shape: 'circle',
      bg_color: '#DBEAFE',
      padding: 12,
      align: 'left',
    },
    styles: { base: { marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card1Id,
    type: 'heading',
    order_index: 1,
    props: { text: 'Hiệu Năng Cực Đại', level: 'h3' },
    styles: {
      base: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card1Id,
    type: 'text',
    order_index: 2,
    props: {
      richtext: 'Phản hồi siêu tốc dưới 15ms. Khả năng mở rộng tức thì chịu tải hàng triệu người dùng đồng thời trong các đợt cao điểm.',
    },
    styles: {
      base: { fontSize: '15px', color: '#64748B', lineHeight: '1.6' },
    },
  });

  // Feature Card 2: Bảo mật
  const card2Id = randomUUID();
  allBlocksToInsert.push({
    id: card2Id,
    page_version_id: v1.id,
    parent_id: featGridSectionId,
    type: 'container',
    order_index: 1,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#F8FAFC',
        padding: '32px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      hover: {
        borderColor: '#10B981',
        boxShadow: '0 12px 24px -10px rgba(16, 185, 129, 0.15)',
        transform: 'translateY(-4px)',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card2Id,
    type: 'icon',
    order_index: 0,
    props: {
      icon: 'solar:shield-check-bold',
      size: 28,
      color: '#10B981',
      style_variant: 'bold',
      bg_shape: 'circle',
      bg_color: '#D1FAE5',
      padding: 12,
      align: 'left',
    },
    styles: { base: { marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card2Id,
    type: 'heading',
    order_index: 1,
    props: { text: 'Bảo Mật Cấp Doanh Nghiệp', level: 'h3' },
    styles: {
      base: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card2Id,
    type: 'text',
    order_index: 2,
    props: {
      richtext: 'Mã hóa AES-256 đầu cuối, tuân thủ chứng chỉ an toàn thông tin ISO 27001, SOC 2 Type II và tường lửa WAF chuyên dụng.',
    },
    styles: {
      base: { fontSize: '15px', color: '#64748B', lineHeight: '1.6' },
    },
  });

  // Feature Card 3: AI Tự động hóa
  const card3Id = randomUUID();
  allBlocksToInsert.push({
    id: card3Id,
    page_version_id: v1.id,
    parent_id: featGridSectionId,
    type: 'container',
    order_index: 2,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#F8FAFC',
        padding: '32px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      hover: {
        borderColor: '#7C3AED',
        boxShadow: '0 12px 24px -10px rgba(124, 58, 237, 0.15)',
        transform: 'translateY(-4px)',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card3Id,
    type: 'icon',
    order_index: 0,
    props: {
      icon: 'solar:cpu-bold',
      size: 28,
      color: '#7C3AED',
      style_variant: 'bold',
      bg_shape: 'circle',
      bg_color: '#EDE9FE',
      padding: 12,
      align: 'left',
    },
    styles: { base: { marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card3Id,
    type: 'heading',
    order_index: 1,
    props: { text: 'Trợ Lý AI Thông Minh', level: 'h3' },
    styles: {
      base: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: card3Id,
    type: 'text',
    order_index: 2,
    props: {
      richtext: 'Tích hợp các mô hình AI ngôn ngữ lớn, hỗ trợ phân tích dữ liệu kinh doanh tự động và trợ lý ảo chăm sóc khách hàng 24/7.',
    },
    styles: {
      base: { fontSize: '15px', color: '#64748B', lineHeight: '1.6' },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 4: STORY / SOLUTION SECTION (Layout: split-right 40:60)
  // --------------------------------------------------------------------------
  const storySectionId = randomUUID();
  allBlocksToInsert.push({
    id: storySectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: {
      layout: 'split-right',
      gap: 'lg',
      tag: 'section',
    },
    styles: {
      base: {
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#F1F5F9',
      },
    },
  });

  // Cột trái: Hình ảnh đội ngũ & giải pháp
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: storySectionId,
    type: 'image',
    order_index: 0,
    props: {
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      alt: 'Đội ngũ chuyên gia CloudNext & Khách hàng',
      caption: 'Đồng hành cùng 5,000+ doanh nghiệp trên lộ trình số hóa',
    },
    styles: {
      base: {
        borderRadius: '16px',
        boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.12)',
        width: '100%',
        objectFit: 'cover',
      },
    },
  });

  // Cột phải: Container nội dung thuyết phục
  const storyRightContainerId = randomUUID();
  allBlocksToInsert.push({
    id: storyRightContainerId,
    page_version_id: v1.id,
    parent_id: storySectionId,
    type: 'container',
    order_index: 1,
    props: { tag: 'div' },
    styles: {
      base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: storyRightContainerId,
    type: 'heading',
    order_index: 0,
    props: {
      text: 'Tiết Kiệm 45% Chi Phí Vận Hành Ngay Trong Quý Đầu Tiên',
      level: 'h2',
    },
    styles: {
      base: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: '1.3',
        marginBottom: '16px',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: storyRightContainerId,
    type: 'text',
    order_index: 1,
    props: {
      richtext: 'Với kiến trúc Cloud-Native tối giản, chúng tôi giúp các tổ chức loại bỏ hoàn toàn chi phí bảo trì phần cứng cồng kềnh. Mọi nguồn tài nguyên được điều phối linh hoạt theo nhu cầu thực tế.',
    },
    styles: {
      base: {
        fontSize: '16px',
        lineHeight: '1.7',
        color: '#475569',
        marginBottom: '24px',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: storyRightContainerId,
    type: 'button',
    order_index: 2,
    props: {
      label: 'Khám Phá Lộ Trình Triển Khai',
      href: '#contact',
    },
    styles: {
      base: {
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        fontSize: '15px',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
      },
      hover: {
        backgroundColor: '#334155',
      },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 5: PRICING SECTION (Layout: grid-3 với 3 Card Bảng Giá)
  // --------------------------------------------------------------------------
  const pricingHeaderSectionId = randomUUID();
  allBlocksToInsert.push({
    id: pricingHeaderSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: { layout: 'stack', tag: 'section' },
    styles: {
      base: {
        paddingTop: '64px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: pricingHeaderSectionId,
    type: 'heading',
    order_index: 0,
    props: {
      text: 'Gói Cước Linh Hoạt Theo Quy Mô',
      level: 'h2',
    },
    styles: {
      base: {
        fontSize: '34px',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '10px',
        textAlign: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: pricingHeaderSectionId,
    type: 'text',
    order_index: 1,
    props: {
      richtext: 'Minh bạch, không phí ẩn. Dễ dàng nâng cấp hoặc hủy bất kỳ lúc nào.',
    },
    styles: {
      base: {
        fontSize: '16px',
        color: '#64748B',
        textAlign: 'center',
      },
    },
  });

  // Grid 3 Bảng giá
  const pricingGridSectionId = randomUUID();
  allBlocksToInsert.push({
    id: pricingGridSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: { layout: 'grid-3', gap: 'md', tag: 'section' },
    styles: {
      base: {
        paddingTop: '20px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
      },
    },
  });

  // Gói 1: Starter
  const priceCard1Id = randomUUID();
  allBlocksToInsert.push({
    id: priceCard1Id,
    page_version_id: v1.id,
    parent_id: pricingGridSectionId,
    type: 'container',
    order_index: 0,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '36px 28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard1Id,
    type: 'heading',
    order_index: 0,
    props: { text: 'Khởi Nghiệp (Starter)', level: 'h3' },
    styles: { base: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard1Id,
    type: 'text',
    order_index: 1,
    props: { richtext: 'Dành cho doanh nghiệp nhỏ và nhóm khởi nghiệp.' },
    styles: { base: { fontSize: '14px', color: '#64748B', marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard1Id,
    type: 'heading',
    order_index: 2,
    props: { text: '990,000 đ / tháng', level: 'h2' },
    styles: { base: { fontSize: '28px', fontWeight: '800', color: '#2563EB', marginBottom: '20px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard1Id,
    type: 'text',
    order_index: 3,
    props: {
      richtext: '✓ Tối đa 10 nhân sự sử dụng\n✓ 50 GB lưu trữ Cloud NVMe\n✓ Báo cáo phân tích cơ bản\n✓ Hỗ trợ kỹ thuật 8/5',
    },
    styles: { base: { fontSize: '14px', color: '#334155', lineHeight: '2.0', marginBottom: '28px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard1Id,
    type: 'button',
    order_index: 4,
    props: { label: 'Chọn Gói Khởi Nghiệp', href: '#contact' },
    styles: {
      base: {
        backgroundColor: '#F1F5F9',
        color: '#0F172A',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
      },
      hover: { backgroundColor: '#E2E8F0' },
    },
  });

  // Gói 2: Professional (Nổi bật)
  const priceCard2Id = randomUUID();
  allBlocksToInsert.push({
    id: priceCard2Id,
    page_version_id: v1.id,
    parent_id: pricingGridSectionId,
    type: 'container',
    order_index: 1,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '36px 28px',
        borderRadius: '16px',
        border: '2px solid #2563EB',
        boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard2Id,
    type: 'heading',
    order_index: 0,
    props: { text: 'Doanh Nghiệp Pro (Khuyên Dùng)', level: 'h3' },
    styles: { base: { fontSize: '20px', fontWeight: '700', color: '#2563EB', marginBottom: '8px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard2Id,
    type: 'text',
    order_index: 1,
    props: { richtext: 'Dành cho các doanh nghiệp đang trên đà tăng trưởng nhanh.' },
    styles: { base: { fontSize: '14px', color: '#64748B', marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard2Id,
    type: 'heading',
    order_index: 2,
    props: { text: '2,490,000 đ / tháng', level: 'h2' },
    styles: { base: { fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard2Id,
    type: 'text',
    order_index: 3,
    props: {
      richtext: '✓ Không giới hạn thành viên\n✓ 500 GB lưu trữ Cloud NVMe\n✓ Trợ lý AI tự động hóa quy trình\n✓ Cam kết chất lượng SLA 99.9%\n✓ Hỗ trợ ưu tiên 24/7',
    },
    styles: { base: { fontSize: '14px', color: '#334155', lineHeight: '2.0', marginBottom: '28px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard2Id,
    type: 'button',
    order_index: 4,
    props: { label: 'Đăng Ký Gói Pro Ngay', href: '#contact' },
    styles: {
      base: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        fontWeight: '700',
        padding: '12px 24px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
      },
      hover: { backgroundColor: '#1D4ED8' },
    },
  });

  // Gói 3: Enterprise
  const priceCard3Id = randomUUID();
  allBlocksToInsert.push({
    id: priceCard3Id,
    page_version_id: v1.id,
    parent_id: pricingGridSectionId,
    type: 'container',
    order_index: 2,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '36px 28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard3Id,
    type: 'heading',
    order_index: 0,
    props: { text: 'Tập Đoàn (Enterprise)', level: 'h3' },
    styles: { base: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard3Id,
    type: 'text',
    order_index: 1,
    props: { richtext: 'Giải pháp thiết kế may đo riêng theo kiến trúc hạ tầng tập đoàn.' },
    styles: { base: { fontSize: '14px', color: '#64748B', marginBottom: '16px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard3Id,
    type: 'heading',
    order_index: 2,
    props: { text: 'Liên Hệ Báo Giá', level: 'h2' },
    styles: { base: { fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard3Id,
    type: 'text',
    order_index: 3,
    props: {
      richtext: '✓ Triển khai Private Cloud / On-premise\n✓ Dung lượng lưu trữ tùy chỉnh không giới hạn\n✓ Chuyên viên giải pháp tận nơi\n✓ Ký kết SLA chuyên biệt 99.99%',
    },
    styles: { base: { fontSize: '14px', color: '#334155', lineHeight: '2.0', marginBottom: '28px' } },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: priceCard3Id,
    type: 'button',
    order_index: 4,
    props: { label: 'Tư Vấn Kiến Trúc Riêng', href: '#contact' },
    styles: {
      base: {
        backgroundColor: '#F1F5F9',
        color: '#0F172A',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
      },
      hover: { backgroundColor: '#E2E8F0' },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 6: TESTIMONIALS SECTION (Layout: grid-3 với 3 Container Card)
  // --------------------------------------------------------------------------
  const testiHeaderSectionId = randomUUID();
  allBlocksToInsert.push({
    id: testiHeaderSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: { layout: 'stack', tag: 'section' },
    styles: {
      base: {
        paddingTop: '64px',
        paddingBottom: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#F8FAFC',
        textAlign: 'center',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: testiHeaderSectionId,
    type: 'heading',
    order_index: 0,
    props: {
      text: 'Khách Hàng Nói Gì Về Chúng Tôi',
      level: 'h2',
    },
    styles: {
      base: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '8px',
        textAlign: 'center',
      },
    },
  });

  const testiGridSectionId = randomUUID();
  allBlocksToInsert.push({
    id: testiGridSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: { layout: 'grid-3', gap: 'md', tag: 'section' },
    styles: {
      base: {
        paddingTop: '20px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#F8FAFC',
      },
    },
  });

  // Testimonial 1
  const tCard1Id = randomUUID();
  allBlocksToInsert.push({
    id: tCard1Id,
    page_version_id: v1.id,
    parent_id: testiGridSectionId,
    type: 'container',
    order_index: 0,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
      },
    },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard1Id,
    type: 'icon',
    order_index: 0,
    props: { icon: 'solar:star-bold', size: 24, color: '#F59E0B', style_variant: 'bold', align: 'left' },
    styles: { base: { marginBottom: '12px' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard1Id,
    type: 'text',
    order_index: 1,
    props: {
      richtext: '“CloudNext giúp toàn bộ hệ thống bán lẻ của chúng tôi duy trì uptime 100% trong dịp siêu sale cuối năm. Đội ngũ kỹ sư hỗ trợ cực kỳ tận tâm.”',
    },
    styles: { base: { fontSize: '15px', color: '#475569', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard1Id,
    type: 'heading',
    order_index: 2,
    props: { text: 'Nguyễn Đình Tuấn — Giám Đốc Công Nghệ (CTO)', level: 'h4' },
    styles: { base: { fontSize: '14px', fontWeight: '700', color: '#0F172A' } },
  });

  // Testimonial 2
  const tCard2Id = randomUUID();
  allBlocksToInsert.push({
    id: tCard2Id,
    page_version_id: v1.id,
    parent_id: testiGridSectionId,
    type: 'container',
    order_index: 1,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
      },
    },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard2Id,
    type: 'icon',
    order_index: 0,
    props: { icon: 'solar:star-bold', size: 24, color: '#F59E0B', style_variant: 'bold', align: 'left' },
    styles: { base: { marginBottom: '12px' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard2Id,
    type: 'text',
    order_index: 1,
    props: {
      richtext: '“Khả năng tự động hóa và tích hợp AI phân tích dữ liệu khách hàng giúp tỷ lệ chuyển đổi đơn hàng tăng hơn 35% sau 2 tháng vận hành.”',
    },
    styles: { base: { fontSize: '15px', color: '#475569', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard2Id,
    type: 'heading',
    order_index: 2,
    props: { text: 'Lê Thị Mai Hương — Giám Đốc Vận Hành (COO)', level: 'h4' },
    styles: { base: { fontSize: '14px', fontWeight: '700', color: '#0F172A' } },
  });

  // Testimonial 3
  const tCard3Id = randomUUID();
  allBlocksToInsert.push({
    id: tCard3Id,
    page_version_id: v1.id,
    parent_id: testiGridSectionId,
    type: 'container',
    order_index: 2,
    props: { tag: 'article' },
    styles: {
      base: {
        backgroundColor: '#FFFFFF',
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
      },
    },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard3Id,
    type: 'icon',
    order_index: 0,
    props: { icon: 'solar:star-bold', size: 24, color: '#F59E0B', style_variant: 'bold', align: 'left' },
    styles: { base: { marginBottom: '12px' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard3Id,
    type: 'text',
    order_index: 1,
    props: {
      richtext: '“Chuyển đổi từ hạ tầng truyền thống sang CloudNext diễn ra trơn tru mà không mất một phút gián đoạn nào. Dịch vụ số 1 hiện nay.”',
    },
    styles: { base: { fontSize: '15px', color: '#475569', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6' } },
  });
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: tCard3Id,
    type: 'heading',
    order_index: 2,
    props: { text: 'Phạm Hoàng Long — Founder FinTech Group', level: 'h4' },
    styles: { base: { fontSize: '14px', fontWeight: '700', color: '#0F172A' } },
  });

  // --------------------------------------------------------------------------
  // BLOCK 7: CONTACT / FORM SECTION (Semantic Form Block)
  // --------------------------------------------------------------------------
  const contactSectionId = randomUUID();
  allBlocksToInsert.push({
    id: contactSectionId,
    page_version_id: v1.id,
    parent_id: null,
    type: 'section',
    order_index: rootOrder++,
    props: { layout: 'stack', tag: 'section' },
    styles: {
      base: {
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: contactSectionId,
    type: 'heading',
    order_index: 0,
    props: {
      text: 'Sẵn Sàng Bứt Phá Doanh Thu Cùng CloudNext?',
      level: 'h2',
    },
    styles: {
      base: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: '10px',
      },
    },
  });

  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: contactSectionId,
    type: 'text',
    order_index: 1,
    props: {
      richtext: 'Để lại thông tin bên dưới, chuyên gia giải pháp của chúng tôi sẽ liên hệ tư vấn và thiết lập bản dùng thử miễn phí trong 15 phút.',
    },
    styles: {
      base: {
        fontSize: '16px',
        color: '#64748B',
        textAlign: 'center',
        maxWidth: '640px',
        margin: '0 auto 32px auto',
      },
    },
  });

  // Semantic Form Block
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: contactSectionId,
    type: 'form',
    order_index: 2,
    props: {
      fields: [
        { key: 'full_name', label: 'Họ và tên của bạn', input_type: 'text', required: true },
        { key: 'email', label: 'Email công việc', input_type: 'email', required: true },
        { key: 'phone', label: 'Số điện thoại', input_type: 'phone', required: true },
        { key: 'message', label: 'Nhu cầu hoặc quy mô hệ thống cần tư vấn', input_type: 'textarea', required: false },
      ],
      submit_label: 'Đăng Ký Tư Vấn Miễn Phí',
      success_message: 'Cảm ơn bạn! Chuyên gia CloudNext sẽ liên hệ lại với bạn ngay.',
    },
    styles: {
      base: {
        maxWidth: '560px',
        margin: '0 auto',
      },
    },
  });

  // --------------------------------------------------------------------------
  // BLOCK 8: FOOTER BLOCK (4 Cột Chuẩn Doanh Nghiệp)
  // --------------------------------------------------------------------------
  allBlocksToInsert.push({
    id: randomUUID(),
    page_version_id: v1.id,
    parent_id: null,
    type: 'footer',
    order_index: rootOrder++,
    props: {
      site_title: 'CloudNext Technologies',
      tagline: 'Nền tảng chuyển đổi số và điện toán đám mây thế hệ mới phục vụ doanh nghiệp Việt Nam vươn tầm thế giới.',
      logo_src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
      columns: [
        {
          title: 'Sản Phẩm & Dịch Vụ',
          links: [
            { label: 'Cloud Server NVMe', href: '#' },
            { label: 'Trợ Lý AI Tự Động Hóa', href: '#' },
            { label: 'Lưu Trữ Khối & Data Lake', href: '#' },
            { label: 'Bảo Mật WAF & Anti-DDoS', href: '#' },
          ],
        },
        {
          title: 'Giải Pháp Chuyên Sâu',
          links: [
            { label: 'Tài Chính & Ngân Hàng', href: '#' },
            { label: 'Bán Lẻ & Thương Mại Điện Tử', href: '#' },
            { label: 'Sản Xuất & Chuỗi Cung Ứng', href: '#' },
            { label: 'Giáo Dục & Y Tế Số', href: '#' },
          ],
        },
        {
          title: 'Về CloudNext',
          links: [
            { label: 'Giới thiệu công ty', href: '#' },
            { label: 'Đội ngũ chuyên gia', href: '#' },
            { label: 'Tin tức công nghệ', href: '#' },
            { label: 'Cơ hội nghề nghiệp', href: '#' },
          ],
        },
        {
          title: 'Hỗ Trợ & Pháp Lý',
          links: [
            { label: 'Trung tâm hỗ trợ 24/7', href: '#' },
            { label: 'Tài liệu API & SDK', href: '#' },
            { label: 'Chính sách bảo mật dữ liệu', href: '#' },
            { label: 'Cam kết chất lượng SLA', href: '#' },
          ],
        },
      ],
      social_links: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'youtube', url: 'https://youtube.com' },
        { platform: 'phone', url: 'tel:18001260' },
        { platform: 'email', url: 'mailto:hotro@cloudnext.vn' },
      ],
      copyright: '© 2026 CloudNext Technologies — Hệ sinh thái số CloudNext. Tất cả quyền được bảo lưu.',
    },
    styles: {
      base: {
        backgroundColor: '#0B0F19',
        color: '#E2E8F0',
      },
    },
  });

  // 5. Nạp toàn bộ các block vào Database
  console.log(`  ⏳ Đang nạp ${allBlocksToInsert.length} khối phân cấp vào DB...`);
  await db.insert(blocks).values(allBlocksToInsert);
  console.log(`  ✅ Đã nạp thành công ${allBlocksToInsert.length} blocks!`);

  // 6. Nạp 1 Mẫu Custom Block cho riêng site này (để kiểm tra Thư viện block riêng của site)
  await db.insert(customBlocks).values({
    site_id: site.id,
    name: 'Thẻ Dịch Vụ Nổi Bật (Custom Cloud Card)',
    category: 'features',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
    created_by: creatorId,
    block_nodes: [
      {
        id: randomUUID(),
        type: 'container',
        props: { tag: 'article' },
        styles: {
          base: {
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid #2563EB',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.1)',
          },
        },
        children: [
          {
            id: randomUUID(),
            type: 'icon',
            props: {
              icon: 'solar:bolt-bold',
              size: 28,
              color: '#2563EB',
              style_variant: 'bold',
              bg_shape: 'circle',
              bg_color: '#EFF6FF',
              padding: 10,
            },
          },
          {
            id: randomUUID(),
            type: 'heading',
            props: { text: 'Tối Ưu Đám Mây Chuyên Biệt', level: 'h3' },
            styles: { base: { fontSize: '18px', fontWeight: '700', marginTop: '12px' } },
          },
          {
            id: randomUUID(),
            type: 'text',
            props: { richtext: 'Mẫu thẻ tuỳ biến lưu riêng cho site CloudNext.' },
            styles: { base: { fontSize: '14px', color: '#64748B' } },
          },
        ],
      },
    ],
  });
  console.log(`  ✅ Đã tạo Custom Block mẫu trong thư viện block riêng của site.`);

  console.log('\n🎉 KHỞI TẠO DỮ LIỆU MẪU WEBSITE HOÀN THÀNH XUẤT SẮC!');
  console.log(`-----------------------------------------------------`);
  console.log(`- Site ID:       ${site.id}`);
  console.log(`- Site Name:     ${site.name}`);
  console.log(`- Domain:        ${domain}`);
  console.log(`- Home Page ID:  ${homePage.id}`);
  console.log(`- Version:       1 (published)`);
  console.log(`- Số lượng khối: ${allBlocksToInsert.length} blocks`);
  console.log(`- Public URL:    http://localhost:3001 (Host: ${domain})`);
  console.log(`- Editor URL:    http://localhost:3000/editor/${site.id}/${homePage.id}`);
  console.log(`-----------------------------------------------------`);

  process.exit(0);
}

seedSampleSite().catch((err) => {
  console.error('❌ Lỗi khi seed site mẫu:', err);
  process.exit(1);
});
