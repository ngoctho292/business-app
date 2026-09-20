import { db, websiteTemplates, sites, pages, blocks } from './index';
import { eq } from 'drizzle-orm';

async function seedTemplates() {
  console.log('🌱 Bắt đầu nạp Kho Mẫu Giao Diện Website vào Database (website_templates)...');

  // 1. Lấy toàn bộ 72 blocks của site CloudNext nếu đã có sẵn trong DB
  const cloudNextSite = await db.query.sites.findFirst({
    where: eq(sites.domain, 'cloudnext.local'),
  });

  let cloudNextBlocks: any[] = [];
  if (cloudNextSite) {
    const cloudNextPage = await db.query.pages.findFirst({
      where: eq(pages.site_id, cloudNextSite.id),
    });
    if (cloudNextPage && cloudNextPage.current_version_id) {
      cloudNextBlocks = await db
        .select()
        .from(blocks)
        .where(eq(blocks.page_version_id, cloudNextPage.current_version_id))
        .orderBy(blocks.order_index);
    }
  }

  // 2. Lấy blocks của mẫu Nhà Hàng F&B (19 blocks đầy đủ)
  let nhahangBlocks: any[] = [];
  try {
    nhahangBlocks = require('./data/fb_template_blocks.json');
  } catch {
    // fallback
  }

  // Nạp Template 1: CloudNext SaaS
  const cloudNextSlug = 'cloudnext-tech-saas';
  const existingCloudNext = await db.query.websiteTemplates.findFirst({
    where: eq(websiteTemplates.slug, cloudNextSlug),
  });

  const cloudNextData = {
    name: 'Doanh Nghiệp Công Nghệ & Chuyển Đổi Số (CloudNext SaaS)',
    slug: cloudNextSlug,
    category: 'technology',
    badge: '⚡ Đa Cột CSS Grid 2026',
    description:
      'Mẫu website cao cấp chuẩn quốc tế dành cho công ty công nghệ, phần mềm SaaS, giải pháp số: Bố cục đa cột CSS Grid hiện đại, thẻ bọc Container, Solar Icons đồng bộ, bảng giá 3 gói dịch vụ, đánh giá đối tác và form liên hệ tối ưu chuyển đổi.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    features: [
      'Split Hero 60:40 Chữ & Dashboard Ảnh',
      '3 Cột Thẻ Card Solar Icons',
      'Bảng Giá 3 Gói Chuyên Nghiệp',
      'Form Thu Hút Khách Hàng Tiềm Năng',
      'Header Đa Cấp & Footer 4 Cột',
      '100% Tự Động Co Dãn Trên Mobile',
    ],
    block_nodes: cloudNextBlocks,
    theme: {
      primaryColor: '#2563EB',
      accentColor: '#7C3AED',
      backgroundColor: '#0F172A',
      textColor: '#1E293B',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      borderRadius: '12px',
    },
    is_system: true,
    is_featured: true,
  };

  if (existingCloudNext) {
    await db
      .update(websiteTemplates)
      .set(cloudNextData)
      .where(eq(websiteTemplates.id, existingCloudNext.id));
    console.log('  ✅ Đã cập nhật Template: CloudNext SaaS vào Database.');
  } else {
    await db.insert(websiteTemplates).values(cloudNextData);
    console.log('  ✅ Đã thêm mới Template: CloudNext SaaS vào Database.');
  }

  // Nạp Template 2: Nhà Hàng Ẩm Thực F&B
  const fbSlug = 'fb-restaurant-master';
  const existingFb = await db.query.websiteTemplates.findFirst({
    where: eq(websiteTemplates.slug, fbSlug),
  });

  const fbData = {
    name: 'Nhà Hàng Ẩm Thực Cao Cấp (F&B Master)',
    slug: fbSlug,
    category: 'food_beverage',
    badge: '🍕 Chuẩn F&B',
    description:
      'Mẫu website hoàn chỉnh chuyên nghiệp cho nhà hàng, quán ăn, quán cafe: Hero Banner sang trọng, giới thiệu câu chuyện thương hiệu, thực đơn động kết nối CMS, form đặt bàn online & bản đồ vị trí.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    features: [
      'Hero Header & Giới thiệu',
      'Thực đơn CMS Động',
      'Đặt bàn & Cọc MoMo',
      'Bản đồ Google Maps',
    ],
    block_nodes: nhahangBlocks,
    theme: {
      primaryColor: '#2F6F4F',
      accentColor: '#6B4EFF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F1E1B',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      borderRadius: '8px',
    },
    is_system: true,
    is_featured: false,
  };

  if (existingFb) {
    await db
      .update(websiteTemplates)
      .set(fbData)
      .where(eq(websiteTemplates.id, existingFb.id));
    console.log('  ✅ Đã cập nhật Template: Nhà Hàng F&B vào Database.');
  } else {
    await db.insert(websiteTemplates).values(fbData);
    console.log('  ✅ Đã thêm mới Template: Nhà Hàng F&B vào Database.');
  }

  const allTemplates = await db.query.websiteTemplates.findMany();
  console.log(`\n🎉 NẠP THÀNH CÔNG ${allTemplates.length} TEMPLATES VÀO DATABASE!`);
  for (const t of allTemplates) {
    console.log(`- [${t.category}] ${t.name} (${t.slug}) | Blocks count: ${(t.block_nodes as any[]).length}`);
  }

  process.exit(0);
}

seedTemplates().catch((err) => {
  console.error('❌ Lỗi khi seed templates:', err);
  process.exit(1);
});
