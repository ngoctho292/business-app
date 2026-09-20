import { db, users, sites, sitesUsers, pages, pageVersions, blocks, contentTypes } from './index';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu sạch (Clean-slate Seeding)...');

  // 1. Tạo tài khoản Platform Admin
  const adminEmail = 'admin@vnpt.vn';
  let admin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    const [inserted] = await db
      .insert(users)
      .values({
        email: adminEmail,
        password_hash: passwordHash,
        name: 'VNPT Platform Admin',
        role: 'platform_admin',
      })
      .returning();
    admin = inserted;
    console.log('  ✅ Đã tạo tài khoản Platform Admin: admin@vnpt.vn (Mật khẩu: admin123456)');
  }

  // 2. Tạo tài khoản Designer mẫu
  const designerEmail = 'designer@agency.vn';
  let designer = await db.query.users.findFirst({
    where: eq(users.email, designerEmail),
  });

  if (!designer) {
    const passwordHash = await bcrypt.hash('designer123', 10);
    const [inserted] = await db
      .insert(users)
      .values({
        email: designerEmail,
        password_hash: passwordHash,
        name: 'Nguyễn Văn Thiết Kế',
        role: 'user',
      })
      .returning();
    designer = inserted;
    console.log('  ✅ Đã tạo tài khoản Designer: designer@agency.vn (Mật khẩu: designer123)');
  }

  // 3. Tạo tài khoản Khách hàng (Editor)
  const editorEmail = 'khachhang@nhahangabc.vn';
  let editor = await db.query.users.findFirst({
    where: eq(users.email, editorEmail),
  });

  if (!editor) {
    const passwordHash = await bcrypt.hash('khachhang123', 10);
    const [inserted] = await db
      .insert(users)
      .values({
        email: editorEmail,
        password_hash: passwordHash,
        name: 'Trần Thị Chủ Quán',
        role: 'user',
      })
      .returning();
    editor = inserted;
    console.log('  ✅ Đã tạo tài khoản Khách hàng (Editor): khachhang@nhahangabc.vn (Mật khẩu: khachhang123)');
  }

  // 4. Tạo Website mẫu "Nhà hàng ABC"
  const domain = 'nhahangabc.local';
  let site = await db.query.sites.findFirst({
    where: eq(sites.domain, domain),
  });

  if (!site) {
    const [insertedSite] = await db
      .insert(sites)
      .values({
        name: 'Nhà hàng Ẩm thực ABC',
        domain: domain,
        domain_verified: true,
        domain_verified_at: new Date(),
        theme: {
          primaryColor: '#2F6F4F',
          accentColor: '#6B4EFF',
          backgroundColor: '#FFFFFF',
          textColor: '#1F1E1B',
          fontHeading: 'Inter',
          fontBody: 'Inter',
          borderRadius: '8px',
        },
      })
      .returning();
    site = insertedSite;

    // Gán role cho members
    await db.insert(sitesUsers).values([
      { site_id: site.id, user_id: admin.id, role: 'owner' },
      { site_id: site.id, user_id: designer.id, role: 'designer' },
      { site_id: site.id, user_id: editor.id, role: 'editor' },
    ]);
    console.log(`  ✅ Đã tạo Website mẫu: ${site.name} (${domain})`);

    // 5. Tạo Trang chủ (Page) + Version v1 + Blocks chuẩn
    const [homePage] = await db
      .insert(pages)
      .values({
        site_id: site.id,
        slug: 'home',
        status: 'published',
        seo_meta: {
          title: 'Nhà hàng Ẩm thực ABC — Tinh hoa ẩm thực Việt',
          description: 'Thưởng thức các món ăn truyền thống đặc sắc tại Nhà hàng ABC trong không gian ấm cúng sang trọng.',
        },
        created_by: designer.id,
      })
      .returning();

    const [v1] = await db
      .insert(pageVersions)
      .values({
        page_id: homePage.id,
        version_number: 1,
        status: 'published',
        submitted_by: designer.id,
        approved_by: admin.id,
        created_by: designer.id,
      })
      .returning();

    // Cập nhật current_version_id
    await db
      .update(pages)
      .set({ current_version_id: v1.id })
      .where(eq(pages.id, homePage.id));

    // Thêm các block mẫu vào trang chủ với chuẩn styles
    await db.insert(blocks).values([
      {
        page_version_id: v1.id,
        type: 'heading',
        order_index: 0,
        props: {
          text: 'Chào mừng quý khách đến với Nhà hàng ABC',
          level: 'h2',
        },
        styles: {
          base: {
            textAlign: 'center',
            color: '#1E1B4B',
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
          },
          responsive: {
            mobile: {
              fontSize: '24px',
            },
          },
        },
      },
      {
        page_version_id: v1.id,
        type: 'text',
        order_index: 1,
        props: {
          richtext: 'Không gian ẩm thực Việt đẳng cấp với những món ăn đậm đà bản sắc dân tộc và phục vụ tận tâm.',
        },
        styles: {
          base: {
            textAlign: 'center',
            color: '#4B5563',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '720px',
            margin: '0 auto 24px auto',
          },
        },
      },
      {
        page_version_id: v1.id,
        type: 'button',
        order_index: 2,
        props: {
          label: 'Đặt bàn ngay hôm nay',
          href: '#booking',
        },
        styles: {
          base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-primary, #2F6F4F)',
            color: '#FFFFFF',
            padding: '14px 32px',
            borderRadius: 'var(--global-radius, 8px)',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          },
          hover: {
            backgroundColor: 'var(--color-accent, #6B4EFF)',
            transform: 'translateY(-2px)',
          },
        },
      },
    ]);

    // 6. Tạo Content Type mẫu "Bài viết Blog"
    await db.insert(contentTypes).values({
      site_id: site.id,
      name: 'Bài viết (Blog)',
      requires_approval: false,
      field_schema: [
        { key: 'title', label: 'Tiêu đề bài viết', type: 'text', required: true },
        { key: 'slug', label: 'Đường dẫn', type: 'text', required: true },
        { key: 'cover_image', label: 'Ảnh đại diện', type: 'image', required: true },
        { key: 'excerpt', label: 'Mô tả ngắn', type: 'text', required: false },
        { key: 'body', label: 'Nội dung chi tiết', type: 'richtext', required: true },
      ],
      created_by: designer.id,
    });
    console.log('  ✅ Đã tạo Content Type: Bài viết (Blog)');
  }

  console.log('\n🎉 Quá trình khởi tạo dữ liệu mẫu hoàn tất thành công!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
