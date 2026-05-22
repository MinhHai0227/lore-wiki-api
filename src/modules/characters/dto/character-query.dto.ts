import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

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

export enum CharacterSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME = 'name',
  VIEWS = 'views',
}

export class CharacterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  workId?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isSpoilerHeavy?: boolean;

  @IsOptional()
  @IsEnum(CharacterSort)
  sort: CharacterSort = CharacterSort.NEWEST;
}
