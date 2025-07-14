/*
 Navicat Premium Dump SQL

 Source Server         : docker
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : localhost:5432
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 14/07/2025 15:13:25
*/


-- ----------------------------
-- Sequence structure for analytics_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."analytics_id_seq";
CREATE SEQUENCE "public"."analytics_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for links_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."links_id_seq";
CREATE SEQUENCE "public"."links_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for analytics
-- ----------------------------
DROP TABLE IF EXISTS "public"."analytics";
CREATE TABLE "public"."analytics" (
  "id" int8 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "link_id" int8 NOT NULL,
  "ip" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for links
-- ----------------------------
DROP TABLE IF EXISTS "public"."links";
CREATE TABLE "public"."links" (
  "id" int8 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "original_url" text COLLATE "pg_catalog"."default" NOT NULL,
  "short_url" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "alias" varchar(20) COLLATE "pg_catalog"."default",
  "expires_at" timestamp(6),
  "created_at" timestamp(6) DEFAULT now(),
  "deleted" bool DEFAULT false
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."analytics_id_seq"
OWNED BY "public"."analytics"."id";
SELECT setval('"public"."analytics_id_seq"', 31, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."links_id_seq"
OWNED BY "public"."links"."id";
SELECT setval('"public"."links_id_seq"', 66, true);

-- ----------------------------
-- Indexes structure for table analytics
-- ----------------------------
CREATE UNIQUE INDEX "analytics_id_idx" ON "public"."analytics" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "analytics_ip_idx" ON "public"."analytics" USING btree (
  "ip" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "analytics_link_id_idx" ON "public"."analytics" USING btree (
  "link_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table analytics
-- ----------------------------
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table links
-- ----------------------------
CREATE UNIQUE INDEX "links_alias_idx" ON "public"."links" USING btree (
  "alias" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "links_created_at_idx" ON "public"."links" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "links_id_idx" ON "public"."links" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "links_original_url_idx" ON "public"."links" USING btree (
  "original_url" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "links_short_url_idx" ON "public"."links" USING btree (
  "short_url" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table links
-- ----------------------------
ALTER TABLE "public"."links" ADD CONSTRAINT "links_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table analytics
-- ----------------------------
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
