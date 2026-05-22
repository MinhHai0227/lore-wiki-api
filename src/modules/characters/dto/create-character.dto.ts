import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

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

function toBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}

export class CreateCharacterDto {
  @IsString()
  @MaxLength(255)
  nameVi: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameOriginal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameRomaji?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  age?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  species?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  occupation?: string;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  voiceActors?: string[];

  @IsOptional()
  @IsString()
  shortIntro?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  appearance?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  lifeStory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isSpoilerHeavy?: boolean;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsUUID(undefined, { each: true })
  workIds?: string[];
}
