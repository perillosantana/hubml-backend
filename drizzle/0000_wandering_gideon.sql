DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('manager', 'customer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"login" text,
	"password" text,
	"name" text,
	"phone" text,
	"access_token" text,
	"refresh_token" text,
	"seller" integer,
	"active" boolean,
	"balance" integer,
	"created_in" timestamp DEFAULT now(),
	"last_interaction_in" timestamp DEFAULT now(),
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"document" text,
	"value" integer,
	"status" text DEFAULT 'pending',
	"code_image" text,
	"code" text,
	"payment_id" text,
	"ticket_url" text,
	"expiration" text,
	"created" timestamp DEFAULT now(),
	"login" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "descriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text,
	"value" integer,
	"product_id" text,
	"status" text DEFAULT 'pending',
	"created_in" timestamp DEFAULT now(),
	"login" text,
	CONSTRAINT "descriptions_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_login_users_login_fk" FOREIGN KEY ("login") REFERENCES "users"("login") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "descriptions" ADD CONSTRAINT "descriptions_login_users_login_fk" FOREIGN KEY ("login") REFERENCES "users"("login") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
