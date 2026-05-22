import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { WorkStatus, WorkType } from 'src/generated/prisma/client';

function toStringArray(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value;
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export class CreateWorkDto {
  @IsString()
  @MaxLength(255)
  titleVi: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOriginal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleRomaji?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleEnglish?: string;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  otherNames?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsEnum(WorkType)
  type: WorkType;

  @IsOptional()
  @IsEnum(WorkStatus)
  status?: WorkStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  artistName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  scriptWriter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  magazine?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  platform?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  chapterCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  episodeCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  volumeCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  seasonCount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  officialUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  legalReadUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  legalWatchUrl?: string;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsUUID(undefined, { each: true })
  genreIds?: string[];
}
