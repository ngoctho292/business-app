import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';

// ============================================================================
// 1. SITES TABLE
// ============================================================================
export const sites = pgTable(
  'sites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull().unique(),
    custom_domain: varchar('custom_domain', { length: 255 }),
    verification_token: varchar('verification_token', { length: 255 }),
    domain_verified: boolean('domain_verified').notNull().default(false),
    domain_verified_at: timestamp('domain_verified_at', { withTimezone: true }),
    theme: jsonb('theme').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    domainIdx: uniqueIndex('idx_sites_domain').on(table.domain),
    customDomainIdx: index('idx_sites_custom_domain').on(table.custom_domain),
  })
);



// ============================================================================
// 2. USERS TABLE
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('user'), // 'platform_admin' | 'user'
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
  })
);

// ============================================================================
// 3. SITES_USERS TABLE (Membership & RBAC)
// ============================================================================
export const sitesUsers = pgTable(
  'sites_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull().default('editor'), // 'owner' | 'designer' | 'editor' | 'viewer'
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    siteUserIdx: uniqueIndex('idx_su_site_user').on(table.site_id, table.user_id),
    userIdx: index('idx_su_user_id').on(table.user_id),
    siteIdIdx: index('idx_su_site_id').on(table.site_id),
  })
);

// ============================================================================
// 4. PAGES TABLE
// ============================================================================
export const pages = pgTable(
  'pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    current_version_id: uuid('current_version_id'), // FK to page_versions (handled in relations)
    slug: varchar('slug', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published'
    seo_meta: jsonb('seo_meta').notNull().default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    siteIdIdx: index('idx_pages_site_id').on(table.site_id),
    slugSiteIdx: uniqueIndex('idx_pages_slug').on(table.site_id, table.slug),
  })
);

// ============================================================================
// 5. PAGE_VERSIONS TABLE
// ============================================================================
export const pageVersions = pgTable(
  'page_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    page_id: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    version_number: integer('version_number').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'in_review' | 'approved' | 'published'
    submitted_by: uuid('submitted_by').references(() => users.id, { onDelete: 'set null' }),
    approved_by: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
    review_notes: jsonb('review_notes'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    pageStatusIdx: index('idx_pv_page_id_status').on(table.page_id, table.status),
    pageVerIdx: index('idx_pv_page_id_version').on(table.page_id, table.version_number),
  })
);

// ============================================================================
// 6. BLOCKS TABLE
// ============================================================================
export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    page_version_id: uuid('page_version_id')
      .notNull()
      .references(() => pageVersions.id, { onDelete: 'cascade' }),
    parent_id: uuid('parent_id'),
    type: varchar('type', { length: 50 }).notNull(),
    props: jsonb('props').notNull().default({}),
    styles: jsonb('styles').notNull().default({}),
    custom_classes: jsonb('custom_classes').notNull().default([]),
    custom_css: text('custom_css'),
    order_index: integer('order_index').notNull().default(0),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    versionIdx: index('idx_blocks_version_id').on(table.page_version_id),
    parentIdIdx: index('idx_blocks_parent_id').on(table.parent_id),
  })
);


// ============================================================================
// 7. CONTENT_TYPES TABLE
// ============================================================================
export const contentTypes = pgTable(
  'content_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    field_schema: jsonb('field_schema').notNull().default([]),
    requires_approval: boolean('requires_approval').notNull().default(false),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    siteIdIdx: index('idx_ct_site_id').on(table.site_id),
  })
);

// ============================================================================
// 8. CONTENT_ITEMS TABLE (Multi-tenant isolated)
// ============================================================================
export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    content_type_id: uuid('content_type_id')
      .notNull()
      .references(() => contentTypes.id, { onDelete: 'cascade' }),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }), // Denormalized for zero-leak queries
    fields: jsonb('fields').notNull().default({}),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published'
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    siteIdIdx: index('idx_ci_site_id').on(table.site_id),
    typeStatusIdx: index('idx_ci_content_type_status').on(table.content_type_id, table.status),
    typeDateIdx: index('idx_ci_content_type_date').on(table.content_type_id, table.created_at),
  })
);

// ============================================================================
// 9. MEDIA_ASSETS TABLE (Quota & Storage Enforced)
// ============================================================================
export const mediaAssets = pgTable(
  'media_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 1024 }).notNull(),
    type: varchar('type', { length: 20 }).notNull().default('image'), // 'image' | 'video'
    mime_type: varchar('mime_type', { length: 100 }).notNull(),
    file_size: bigint('file_size', { mode: 'number' }).notNull().default(0), // bytes
    filename: varchar('filename', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    siteIdIdx: index('idx_media_site_id').on(table.site_id),
  })
);

// ============================================================================
// 10. FORM_SUBMISSIONS TABLE (Contact & Lead Ingestion)
// ============================================================================
export const formSubmissions = pgTable(
  'form_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    page_slug: varchar('page_slug', { length: 255 }).notNull().default('home'),
    form_title: varchar('form_title', { length: 255 }).notNull().default('Form Liên Hệ'),
    payload: jsonb('payload').notNull().default({}),
    is_read: boolean('is_read').notNull().default(false),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    siteIdIdx: index('idx_fs_site_id').on(table.site_id),
    createdIdx: index('idx_fs_created_at').on(table.site_id, table.created_at),
  })
);

// ============================================================================
// 11. SUBSCRIPTIONS TABLE (User SaaS Subscription Plan)
// ============================================================================
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: varchar('plan', { length: 50 }).notNull().default('free'), // 'free' | 'pro' | 'business'
    status: varchar('status', { length: 50 }).notNull().default('active'), // 'active' | 'expired' | 'canceled'
    billing_cycle: varchar('billing_cycle', { length: 50 }).notNull().default('monthly'), // 'monthly' | 'yearly'
    expires_at: timestamp('expires_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_subs_user_id').on(table.user_id),
  })
);

// ============================================================================
// 12. ORDERS TABLE (Payment Transactions)
// ============================================================================
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: varchar('plan', { length: 50 }).notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(), // VND
    billing_cycle: varchar('billing_cycle', { length: 50 }).notNull().default('monthly'),
    payment_method: varchar('payment_method', { length: 50 }).notNull().default('vietqr'), // 'vietqr' | 'momo' | 'vnpay'
    status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'completed' | 'failed'
    order_code: varchar('order_code', { length: 100 }).notNull().unique(),
    transaction_id: varchar('transaction_id', { length: 255 }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completed_at: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('idx_orders_user_id').on(table.user_id),
    orderCodeIdx: uniqueIndex('idx_orders_code').on(table.order_code),
  })
);

// ============================================================================
// DRIZZLE RELATIONS
// ============================================================================

export const sitesRelations = relations(sites, ({ many }) => ({
  pages: many(pages),
  contentTypes: many(contentTypes),
  contentItems: many(contentItems),
  mediaAssets: many(mediaAssets),
  members: many(sitesUsers),
  formSubmissions: many(formSubmissions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sites: many(sitesUsers),
  subscriptions: many(subscriptions),
  orders: many(orders),
}));

export const sitesUsersRelations = relations(sitesUsers, ({ one }) => ({
  site: one(sites, {
    fields: [sitesUsers.site_id],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [sitesUsers.user_id],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, {
    fields: [pages.site_id],
    references: [sites.id],
  }),
  currentVersion: one(pageVersions, {
    fields: [pages.current_version_id],
    references: [pageVersions.id],
  }),
  versions: many(pageVersions),
}));

export const pageVersionsRelations = relations(pageVersions, ({ one, many }) => ({
  page: one(pages, {
    fields: [pageVersions.page_id],
    references: [pages.id],
  }),
  submitter: one(users, {
    fields: [pageVersions.submitted_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [pageVersions.approved_by],
    references: [users.id],
  }),
  blocks: many(blocks),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  version: one(pageVersions, {
    fields: [blocks.page_version_id],
    references: [pageVersions.id],
  }),
}));

export const contentTypesRelations = relations(contentTypes, ({ one, many }) => ({
  site: one(sites, {
    fields: [contentTypes.site_id],
    references: [sites.id],
  }),
  items: many(contentItems),
}));

export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  contentType: one(contentTypes, {
    fields: [contentItems.content_type_id],
    references: [contentTypes.id],
  }),
  site: one(sites, {
    fields: [contentItems.site_id],
    references: [sites.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  site: one(sites, {
    fields: [mediaAssets.site_id],
    references: [sites.id],
  }),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  site: one(sites, {
    fields: [formSubmissions.site_id],
    references: [sites.id],
  }),
}));

// ============================================================================
// 14. CUSTOM_BLOCKS TABLE (Site-specific saved blocks/sections)
// ============================================================================
export const customBlocks = pgTable(
  'custom_blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull().default('custom'), // 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'contact' | 'custom'
    thumbnail_url: varchar('thumbnail_url', { length: 1024 }),
    block_nodes: jsonb('block_nodes').notNull().default([]),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    siteIdIdx: index('idx_cb_site_id').on(table.site_id),
  })
);

export const customBlocksRelations = relations(customBlocks, ({ one }) => ({
  site: one(sites, {
    fields: [customBlocks.site_id],
    references: [sites.id],
  }),
}));

// ============================================================================
// 15. WEBSITE_TEMPLATES TABLE (Global & Community Website Templates)
// ============================================================================
export const websiteTemplates = pgTable(
  'website_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    category: varchar('category', { length: 100 }).notNull().default('general'), // 'technology' | 'food_beverage' | 'real_estate' | 'ecommerce' | 'services' | 'general'
    description: text('description'),
    thumbnail_url: varchar('thumbnail_url', { length: 1024 }),
    badge: varchar('badge', { length: 50 }),
    features: jsonb('features').notNull().default([]), // string[]
    block_nodes: jsonb('block_nodes').notNull().default([]), // BlockNode[]
    theme: jsonb('theme').notNull().default({}),
    is_system: boolean('is_system').notNull().default(true),
    is_featured: boolean('is_featured').notNull().default(false),
    created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_wt_slug').on(table.slug),
    categoryIdx: index('idx_wt_category').on(table.category),
    featuredIdx: index('idx_wt_featured').on(table.is_featured),
  })
);

export const websiteTemplatesRelations = relations(websiteTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [websiteTemplates.created_by],
    references: [users.id],
  }),
}));


