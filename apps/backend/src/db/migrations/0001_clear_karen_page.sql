CREATE TABLE IF NOT EXISTS "custom_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) DEFAULT 'custom' NOT NULL,
	"thumbnail_url" varchar(1024),
	"block_nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"page_slug" varchar(255) DEFAULT 'home' NOT NULL,
	"form_title" varchar(255) DEFAULT 'Form Liên Hệ' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(50) NOT NULL,
	"amount" bigint NOT NULL,
	"billing_cycle" varchar(50) DEFAULT 'monthly' NOT NULL,
	"payment_method" varchar(50) DEFAULT 'vietqr' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"order_code" varchar(100) NOT NULL,
	"transaction_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"billing_cycle" varchar(50) DEFAULT 'monthly' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(100) DEFAULT 'general' NOT NULL,
	"description" text,
	"thumbnail_url" varchar(1024),
	"badge" varchar(50),
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"block_nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"theme" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN IF NOT EXISTS "styles" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN IF NOT EXISTS "custom_classes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN IF NOT EXISTS "custom_css" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "custom_domain" varchar(255);--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "theme" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_blocks" ADD CONSTRAINT "custom_blocks_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_blocks" ADD CONSTRAINT "custom_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_templates" ADD CONSTRAINT "website_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cb_site_id" ON "custom_blocks" ("site_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fs_site_id" ON "form_submissions" ("site_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fs_created_at" ON "form_submissions" ("site_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_orders_code" ON "orders" ("order_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subs_user_id" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_wt_slug" ON "website_templates" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wt_category" ON "website_templates" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wt_featured" ON "website_templates" ("is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sites_custom_domain" ON "sites" ("custom_domain");