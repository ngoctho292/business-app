import { ContentService } from '../src/modules/content/content.service';
import { db, contentTypes, contentItems } from '../src/db';
import { eq } from 'drizzle-orm';

describe('RBAC & Approval Workflow Security Tests (Sprint 6)', () => {
  let contentService: ContentService;
  const siteId = '6afeff8e-4fd9-4df7-8f49-eff1e558cd3f';
  const userId = 'b229a374-19d3-4332-b175-3e1541e4255f';

  beforeAll(() => {
    contentService = new ContentService();
  });

  it('1. Editor creating an item on regular Content Type publishes immediately', async () => {
    const [cType] = await db
      .insert(contentTypes)
      .values({
        site_id: siteId,
        name: 'Test No Approval Type',
        requires_approval: false,
        field_schema: [{ key: 'name', label: 'Tên', type: 'text', required: true }],
        created_by: userId,
      })
      .returning();

    const createdItem = await contentService.createContentItem(
      siteId,
      cType.id,
      { name: 'Item Regular' },
      'published',
      userId,
      'editor'
    );

    expect(createdItem.status).toBe('published');

    // Cleanup
    await db.delete(contentTypes).where(eq(contentTypes.id, cType.id));
  });

  it('2. Editor creating an item on Content Type with requires_approval: true is forced to DRAFT', async () => {
    const [cType] = await db
      .insert(contentTypes)
      .values({
        site_id: siteId,
        name: 'Test Approval Required Type',
        requires_approval: true,
        field_schema: [{ key: 'name', label: 'Tên', type: 'text', required: true }],
        created_by: userId,
      })
      .returning();

    // Editor attempts to create directly as 'published'
    const createdItem = await contentService.createContentItem(
      siteId,
      cType.id,
      { name: 'Unapproved Item' },
      'published',
      userId,
      'editor'
    );

    // Must be forced to 'draft' status because editor lacks approval bypass
    expect(createdItem.status).toBe('draft');

    // 3. Designer / Owner can approve and publish the item
    const approvedItem = await contentService.updateContentItem(
      siteId,
      cType.id,
      createdItem.id,
      undefined,
      'published',
      userId
    );

    expect(approvedItem.status).toBe('published');

    // Cleanup
    await db.delete(contentTypes).where(eq(contentTypes.id, cType.id));
  });
});
