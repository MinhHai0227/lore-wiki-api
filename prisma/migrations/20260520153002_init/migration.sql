-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('ANIME', 'MANGA', 'MANHUA', 'MANHWA', 'DONGHUA', 'NOVEL', 'WEB_NOVEL', 'LIGHT_NOVEL', 'GAME', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WikiRevisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WikiRevisionTargetType" AS ENUM ('WIKI_PAGE', 'WIKI_SECTION');

-- CreateEnum
CREATE TYPE "SpoilerLevel" AS ENUM ('NONE', 'LIGHT', 'MEDIUM', 'HEAVY', 'FULL');

-- CreateEnum
CREATE TYPE "WikiPageType" AS ENUM ('WORK_REVIEW', 'CHARACTER_PROFILE', 'ARTIFACT_PROFILE', 'SKILL_PROFILE', 'FACTION_PROFILE', 'TERM_EXPLAINER', 'STORY_SUMMARY', 'WORLD_BUILDING', 'POWER_SYSTEM', 'RECOMMENDATION', 'NEWS', 'ANALYSIS', 'GUIDE');

-- CreateEnum
CREATE TYPE "WikiSectionType" AS ENUM ('NORMAL', 'OVERVIEW', 'BASIC_INFO', 'PLOT_SUMMARY', 'CHARACTER_LIST', 'WORLD_SETTING', 'POWER_SYSTEM', 'REVIEW_OPINION', 'ACHIEVEMENT', 'RELATED_WORKS', 'BACKGROUND', 'APPEARANCE', 'PERSONALITY', 'RELATIONSHIP', 'LIFE_STORY', 'SKILL_LIST', 'ARTIFACT_ORIGIN', 'ARTIFACT_HISTORY', 'ARTIFACT_FUNCTIONS', 'ARTIFACT_OWNERS', 'ARTIFACT_ROLE_IN_STORY', 'ARTIFACT_COMPARISON', 'IMAGE_GALLERY', 'SOURCE_LIST');

-- CreateEnum
CREATE TYPE "CharacterWorkRole" AS ENUM ('MAIN', 'SUPPORTING', 'VILLAIN', 'CAMEO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CharacterRelationType" AS ENUM ('RELATED', 'FRIEND_OF', 'ENEMY_OF', 'RIVAL_OF', 'ALLY_OF', 'FAMILY_OF', 'PARENT_OF', 'CHILD_OF', 'SIBLING_OF', 'SPOUSE_OF', 'LOVE_INTEREST_OF', 'MASTER_OF', 'DISCIPLE_OF', 'SAME_PERSON_AS');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('TREASURE', 'MAGIC_WEAPON', 'DIVINE_WEAPON', 'SWORD', 'SPEAR', 'BOW', 'ARMOR', 'PILL', 'TALISMAN', 'FORMATION', 'BOOK', 'BEAD', 'CAULDRON', 'BOTTLE', 'RING', 'SEAL', 'TOKEN', 'SPIRIT_BEAST', 'MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ArtifactFunctionType" AS ENUM ('TIME_ACCELERATION', 'CULTIVATION_SUPPORT', 'HEALING', 'RESURRECTION', 'SEALING', 'STORAGE_SPACE', 'WORLD_CONTROL', 'ATTACK', 'DEFENSE', 'ESCAPE', 'SOUL_PROTECTION', 'DESTINY_CAUSALITY', 'SUMMONING', 'REFINING', 'OTHER');

-- CreateEnum
CREATE TYPE "ArtifactOwnershipType" AS ENUM ('CREATOR', 'ORIGINAL_OWNER', 'OWNER', 'TEMPORARY_HOLDER', 'INHERITOR', 'STEALER', 'GUARDIAN', 'DESTROYER', 'RELATED_PERSON');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('MARTIAL_ART', 'MAGIC', 'CURSED_TECHNIQUE', 'QI_TECHNIQUE', 'CULTIVATION_METHOD', 'BLOODLINE', 'WEAPON_TECHNIQUE', 'SPECIAL_ABILITY', 'FORMATION', 'ALCHEMY', 'OTHER');

-- CreateEnum
CREATE TYPE "FactionType" AS ENUM ('SECT', 'CLAN', 'FAMILY', 'ORGANIZATION', 'SCHOOL', 'KINGDOM', 'EMPIRE', 'GUILD', 'COMPANY', 'ALLIANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('REALM', 'POWER_SYSTEM', 'ORGANIZATION_CONCEPT', 'RACE', 'ITEM_CLASS', 'LOCATION_TYPE', 'CONCEPT', 'TECHNIQUE_CLASS', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_REPLY', 'COMMENT_ON_PAGE', 'PAGE_PUBLISHED', 'PAGE_UPDATED', 'MENTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('WORK', 'CHARACTER', 'ARTIFACT', 'SKILL', 'FACTION', 'TERM', 'WIKI_PAGE', 'COMMENT');

-- CreateEnum
CREATE TYPE "EntityRelationType" AS ENUM ('RELATED', 'SIMILAR_TO', 'PART_OF', 'SEQUEL_OF', 'PREQUEL_OF', 'SPIN_OFF_OF', 'ADAPTATION_OF', 'APPEARS_IN', 'USES_SKILL', 'OWNS_ARTIFACT', 'MEMBER_OF', 'ENEMY_OF', 'FRIEND_OF', 'FAMILY_OF', 'MASTER_OF', 'DISCIPLE_OF', 'CREATED_BY', 'DESTROYED_BY', 'LOCATED_IN', 'COMPARED_WITH');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_original" TEXT,
    "title_romaji" TEXT,
    "title_english" TEXT,
    "other_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "work_type" "WorkType" NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'UNKNOWN',
    "author_name" TEXT,
    "artist_name" TEXT,
    "script_writer" TEXT,
    "country" TEXT,
    "original_name" TEXT,
    "magazine" TEXT,
    "publisher" TEXT,
    "platform" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "chapter_count" INTEGER,
    "episode_count" INTEGER,
    "volume_count" INTEGER,
    "season_count" INTEGER,
    "description" TEXT,
    "synopsis" TEXT,
    "poster_url" TEXT,
    "banner_url" TEXT,
    "official_url" TEXT,
    "legal_read_url" TEXT,
    "legal_watch_url" TEXT,
    "avg_rating" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_genres" (
    "work_id" UUID NOT NULL,
    "genre_id" UUID NOT NULL,

    CONSTRAINT "work_genres_pkey" PRIMARY KEY ("work_id","genre_id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL,
    "name_vi" TEXT NOT NULL,
    "name_original" TEXT,
    "name_romaji" TEXT,
    "name_english" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "gender" TEXT,
    "age" TEXT,
    "birthday" TEXT,
    "species" TEXT,
    "occupation" TEXT,
    "voice_actors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "short_intro" TEXT,
    "background" TEXT,
    "appearance" TEXT,
    "personality" TEXT,
    "life_story" TEXT,
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "is_spoiler_heavy" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_characters" (
    "work_id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "role" "CharacterWorkRole" NOT NULL DEFAULT 'UNKNOWN',
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_characters_pkey" PRIMARY KEY ("work_id","character_id")
);

-- CreateTable
CREATE TABLE "character_relations" (
    "id" UUID NOT NULL,
    "from_character_id" UUID NOT NULL,
    "to_character_id" UUID NOT NULL,
    "relation_type" "CharacterRelationType" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" UUID NOT NULL,
    "name_vi" TEXT NOT NULL,
    "name_original" TEXT,
    "name_romaji" TEXT,
    "name_english" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "work_id" UUID,
    "artifact_type" "ArtifactType" NOT NULL DEFAULT 'OTHER',
    "rank" TEXT,
    "origin" TEXT,
    "true_nature" TEXT,
    "owner_condition" TEXT,
    "description" TEXT,
    "appearance" TEXT,
    "abilities" TEXT,
    "weakness" TEXT,
    "limitation" TEXT,
    "first_appearance" TEXT,
    "current_status" TEXT,
    "image_url" TEXT,
    "cover_url" TEXT,
    "is_spoiler_heavy" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifact_functions" (
    "id" UUID NOT NULL,
    "artifact_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "function_type" "ArtifactFunctionType" NOT NULL DEFAULT 'OTHER',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artifact_functions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifact_owners" (
    "id" UUID NOT NULL,
    "artifact_id" UUID NOT NULL,
    "character_id" UUID,
    "owner_name" TEXT,
    "ownership_type" "ArtifactOwnershipType" NOT NULL DEFAULT 'OWNER',
    "description" TEXT,
    "arc_name" TEXT,
    "chapter_from" INTEGER,
    "chapter_to" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artifact_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name_vi" TEXT NOT NULL,
    "name_original" TEXT,
    "name_english" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "work_id" UUID,
    "skill_type" "SkillType" NOT NULL DEFAULT 'OTHER',
    "rank" TEXT,
    "description" TEXT,
    "effect" TEXT,
    "limitation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_skills" (
    "character_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("character_id","skill_id")
);

-- CreateTable
CREATE TABLE "factions" (
    "id" UUID NOT NULL,
    "name_vi" TEXT NOT NULL,
    "name_original" TEXT,
    "name_english" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "work_id" UUID,
    "faction_type" "FactionType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "leader_name" TEXT,
    "headquarters" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_factions" (
    "character_id" UUID NOT NULL,
    "faction_id" UUID NOT NULL,
    "role" TEXT,
    "note" TEXT,

    CONSTRAINT "character_factions_pkey" PRIMARY KEY ("character_id","faction_id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" UUID NOT NULL,
    "name_vi" TEXT NOT NULL,
    "name_original" TEXT,
    "name_english" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT NOT NULL,
    "work_id" UUID,
    "term_type" "TermType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "level_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_pages" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "page_type" "WikiPageType" NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "cover_url" TEXT,
    "work_id" UUID,
    "character_id" UUID,
    "artifact_id" UUID,
    "skill_id" UUID,
    "faction_id" UUID,
    "term_id" UUID,
    "author_id" UUID,
    "content_md" TEXT,
    "has_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "spoiler_level" "SpoilerLevel" NOT NULL DEFAULT 'NONE',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wiki_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_sections" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "parent_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "content_md" TEXT NOT NULL DEFAULT '',
    "section_type" "WikiSectionType" NOT NULL DEFAULT 'NORMAL',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wiki_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_revisions" (
    "id" UUID NOT NULL,
    "target_type" "WikiRevisionTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "editor_id" UUID,
    "reviewer_id" UUID,
    "status" "WikiRevisionStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "content_md" TEXT,
    "old_snapshot" JSONB,
    "new_snapshot" JSONB NOT NULL,
    "change_note" TEXT,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_page_tags" (
    "page_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "wiki_page_tags_pkey" PRIMARY KEY ("page_id","tag_id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" UUID NOT NULL,
    "work_id" UUID,
    "character_id" UUID,
    "artifact_id" UUID,
    "faction_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT NOT NULL,
    "arc_name" TEXT,
    "chapter_from" INTEGER,
    "chapter_to" INTEGER,
    "episode_from" INTEGER,
    "episode_to" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "alt_text" TEXT,
    "caption" TEXT,
    "source_url" TEXT,
    "credit" TEXT,
    "work_id" UUID,
    "character_id" UUID,
    "artifact_id" UUID,
    "skill_id" UUID,
    "faction_id" UUID,
    "term_id" UUID,
    "page_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_references" (
    "id" UUID NOT NULL,
    "page_id" UUID,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "source_name" TEXT,
    "accessed_at" DATE,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "user_id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("user_id","work_id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" "EntityType" NOT NULL,
    "target_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "actor_id" UUID,
    "notification_type" "NotificationType" NOT NULL,
    "target_type" "EntityType",
    "target_id" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_relations" (
    "id" UUID NOT NULL,
    "source_type" "EntityType" NOT NULL,
    "source_id" UUID NOT NULL,
    "target_type" "EntityType" NOT NULL,
    "target_id" UUID NOT NULL,
    "relation_type" "EntityRelationType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "works_slug_key" ON "works"("slug");

-- CreateIndex
CREATE INDEX "works_work_type_idx" ON "works"("work_type");

-- CreateIndex
CREATE INDEX "works_status_idx" ON "works"("status");

-- CreateIndex
CREATE INDEX "works_title_vi_idx" ON "works"("title_vi");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE INDEX "work_genres_work_id_idx" ON "work_genres"("work_id");

-- CreateIndex
CREATE INDEX "work_genres_genre_id_idx" ON "work_genres"("genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_slug_key" ON "characters"("slug");

-- CreateIndex
CREATE INDEX "characters_name_vi_idx" ON "characters"("name_vi");

-- CreateIndex
CREATE INDEX "work_characters_work_id_idx" ON "work_characters"("work_id");

-- CreateIndex
CREATE INDEX "work_characters_character_id_idx" ON "work_characters"("character_id");

-- CreateIndex
CREATE INDEX "work_characters_role_idx" ON "work_characters"("role");

-- CreateIndex
CREATE INDEX "character_relations_from_character_id_idx" ON "character_relations"("from_character_id");

-- CreateIndex
CREATE INDEX "character_relations_to_character_id_idx" ON "character_relations"("to_character_id");

-- CreateIndex
CREATE INDEX "character_relations_relation_type_idx" ON "character_relations"("relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "character_relations_from_character_id_to_character_id_relat_key" ON "character_relations"("from_character_id", "to_character_id", "relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "artifacts_slug_key" ON "artifacts"("slug");

-- CreateIndex
CREATE INDEX "artifacts_work_id_idx" ON "artifacts"("work_id");

-- CreateIndex
CREATE INDEX "artifacts_artifact_type_idx" ON "artifacts"("artifact_type");

-- CreateIndex
CREATE INDEX "artifacts_name_vi_idx" ON "artifacts"("name_vi");

-- CreateIndex
CREATE INDEX "artifact_functions_artifact_id_idx" ON "artifact_functions"("artifact_id");

-- CreateIndex
CREATE INDEX "artifact_functions_function_type_idx" ON "artifact_functions"("function_type");

-- CreateIndex
CREATE INDEX "artifact_owners_artifact_id_idx" ON "artifact_owners"("artifact_id");

-- CreateIndex
CREATE INDEX "artifact_owners_character_id_idx" ON "artifact_owners"("character_id");

-- CreateIndex
CREATE INDEX "artifact_owners_ownership_type_idx" ON "artifact_owners"("ownership_type");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "skills_work_id_idx" ON "skills"("work_id");

-- CreateIndex
CREATE INDEX "skills_skill_type_idx" ON "skills"("skill_type");

-- CreateIndex
CREATE INDEX "character_skills_character_id_idx" ON "character_skills"("character_id");

-- CreateIndex
CREATE INDEX "character_skills_skill_id_idx" ON "character_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "factions_slug_key" ON "factions"("slug");

-- CreateIndex
CREATE INDEX "factions_work_id_idx" ON "factions"("work_id");

-- CreateIndex
CREATE INDEX "factions_faction_type_idx" ON "factions"("faction_type");

-- CreateIndex
CREATE INDEX "character_factions_character_id_idx" ON "character_factions"("character_id");

-- CreateIndex
CREATE INDEX "character_factions_faction_id_idx" ON "character_factions"("faction_id");

-- CreateIndex
CREATE UNIQUE INDEX "terms_slug_key" ON "terms"("slug");

-- CreateIndex
CREATE INDEX "terms_work_id_idx" ON "terms"("work_id");

-- CreateIndex
CREATE INDEX "terms_term_type_idx" ON "terms"("term_type");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_pages_slug_key" ON "wiki_pages"("slug");

-- CreateIndex
CREATE INDEX "wiki_pages_page_type_idx" ON "wiki_pages"("page_type");

-- CreateIndex
CREATE INDEX "wiki_pages_status_idx" ON "wiki_pages"("status");

-- CreateIndex
CREATE INDEX "wiki_pages_work_id_idx" ON "wiki_pages"("work_id");

-- CreateIndex
CREATE INDEX "wiki_pages_character_id_idx" ON "wiki_pages"("character_id");

-- CreateIndex
CREATE INDEX "wiki_pages_artifact_id_idx" ON "wiki_pages"("artifact_id");

-- CreateIndex
CREATE INDEX "wiki_pages_skill_id_idx" ON "wiki_pages"("skill_id");

-- CreateIndex
CREATE INDEX "wiki_pages_faction_id_idx" ON "wiki_pages"("faction_id");

-- CreateIndex
CREATE INDEX "wiki_pages_term_id_idx" ON "wiki_pages"("term_id");

-- CreateIndex
CREATE INDEX "wiki_pages_published_at_idx" ON "wiki_pages"("published_at");

-- CreateIndex
CREATE INDEX "wiki_pages_status_published_at_idx" ON "wiki_pages"("status", "published_at");

-- CreateIndex
CREATE INDEX "wiki_pages_work_id_status_page_type_idx" ON "wiki_pages"("work_id", "status", "page_type");

-- CreateIndex
CREATE INDEX "wiki_sections_page_id_idx" ON "wiki_sections"("page_id");

-- CreateIndex
CREATE INDEX "wiki_sections_parent_id_idx" ON "wiki_sections"("parent_id");

-- CreateIndex
CREATE INDEX "wiki_sections_sort_order_idx" ON "wiki_sections"("sort_order");

-- CreateIndex
CREATE INDEX "wiki_sections_page_id_parent_id_sort_order_idx" ON "wiki_sections"("page_id", "parent_id", "sort_order");

-- CreateIndex
CREATE INDEX "wiki_revisions_target_type_target_id_created_at_idx" ON "wiki_revisions"("target_type", "target_id", "created_at");

-- CreateIndex
CREATE INDEX "wiki_revisions_target_type_target_id_status_idx" ON "wiki_revisions"("target_type", "target_id", "status");

-- CreateIndex
CREATE INDEX "wiki_revisions_editor_id_idx" ON "wiki_revisions"("editor_id");

-- CreateIndex
CREATE INDEX "wiki_revisions_reviewer_id_idx" ON "wiki_revisions"("reviewer_id");

-- CreateIndex
CREATE INDEX "wiki_revisions_status_created_at_idx" ON "wiki_revisions"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "wiki_page_tags_page_id_idx" ON "wiki_page_tags"("page_id");

-- CreateIndex
CREATE INDEX "wiki_page_tags_tag_id_idx" ON "wiki_page_tags"("tag_id");

-- CreateIndex
CREATE INDEX "timeline_events_work_id_idx" ON "timeline_events"("work_id");

-- CreateIndex
CREATE INDEX "timeline_events_character_id_idx" ON "timeline_events"("character_id");

-- CreateIndex
CREATE INDEX "timeline_events_artifact_id_idx" ON "timeline_events"("artifact_id");

-- CreateIndex
CREATE INDEX "timeline_events_faction_id_idx" ON "timeline_events"("faction_id");

-- CreateIndex
CREATE INDEX "timeline_events_sort_order_idx" ON "timeline_events"("sort_order");

-- CreateIndex
CREATE INDEX "timeline_events_work_id_sort_order_idx" ON "timeline_events"("work_id", "sort_order");

-- CreateIndex
CREATE INDEX "media_assets_work_id_idx" ON "media_assets"("work_id");

-- CreateIndex
CREATE INDEX "media_assets_character_id_idx" ON "media_assets"("character_id");

-- CreateIndex
CREATE INDEX "media_assets_artifact_id_idx" ON "media_assets"("artifact_id");

-- CreateIndex
CREATE INDEX "media_assets_skill_id_idx" ON "media_assets"("skill_id");

-- CreateIndex
CREATE INDEX "media_assets_faction_id_idx" ON "media_assets"("faction_id");

-- CreateIndex
CREATE INDEX "media_assets_term_id_idx" ON "media_assets"("term_id");

-- CreateIndex
CREATE INDEX "media_assets_page_id_idx" ON "media_assets"("page_id");

-- CreateIndex
CREATE INDEX "source_references_page_id_idx" ON "source_references"("page_id");

-- CreateIndex
CREATE INDEX "ratings_work_id_idx" ON "ratings"("work_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_target_type_target_id_idx" ON "bookmarks"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_target_type_target_id_key" ON "bookmarks"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_page_id_idx" ON "comments"("page_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "comments_page_id_created_at_idx" ON "comments"("page_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_created_at_idx" ON "notifications"("recipient_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_actor_id_idx" ON "notifications"("actor_id");

-- CreateIndex
CREATE INDEX "notifications_target_type_target_id_idx" ON "notifications"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "entity_relations_source_type_source_id_idx" ON "entity_relations"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "entity_relations_target_type_target_id_idx" ON "entity_relations"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "entity_relations_relation_type_idx" ON "entity_relations"("relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "entity_relations_source_type_source_id_target_type_target_i_key" ON "entity_relations"("source_type", "source_id", "target_type", "target_id", "relation_type");

-- AddForeignKey
ALTER TABLE "work_genres" ADD CONSTRAINT "work_genres_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_genres" ADD CONSTRAINT "work_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_characters" ADD CONSTRAINT "work_characters_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_characters" ADD CONSTRAINT "work_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_from_character_id_fkey" FOREIGN KEY ("from_character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_to_character_id_fkey" FOREIGN KEY ("to_character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifact_functions" ADD CONSTRAINT "artifact_functions_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifact_owners" ADD CONSTRAINT "artifact_owners_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifact_owners" ADD CONSTRAINT "artifact_owners_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factions" ADD CONSTRAINT "factions_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_factions" ADD CONSTRAINT "character_factions_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_factions" ADD CONSTRAINT "character_factions_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_sections" ADD CONSTRAINT "wiki_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_sections" ADD CONSTRAINT "wiki_sections_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "wiki_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_revisions" ADD CONSTRAINT "wiki_revisions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_revisions" ADD CONSTRAINT "wiki_revisions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_page_tags" ADD CONSTRAINT "wiki_page_tags_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_page_tags" ADD CONSTRAINT "wiki_page_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_faction_id_fkey" FOREIGN KEY ("faction_id") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_references" ADD CONSTRAINT "source_references_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
