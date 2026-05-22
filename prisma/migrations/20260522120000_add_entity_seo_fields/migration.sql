ALTER TABLE "works"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;

ALTER TABLE "characters"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;

ALTER TABLE "artifacts"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;

ALTER TABLE "skills"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;

ALTER TABLE "factions"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;

ALTER TABLE "terms"
ADD COLUMN "seo_title" TEXT,
ADD COLUMN "seo_description" TEXT;
