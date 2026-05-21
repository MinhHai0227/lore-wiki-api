import { Type } from 'class-transformer';
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
import { WorkStatus, WorkType } from '../../../generated/prisma/enums';

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
  @IsArray()
  @IsString({ each: true })
  otherNames?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(280)
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
  @MaxLength(120)
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
  @IsUrl({ require_tld: false })
  posterUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  bannerUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  officialUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  legalReadUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  legalWatchUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];
}
