import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { WorkStatus, WorkType } from 'src/generated/prisma/client';

export enum WorkSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE = 'title',
  RATING = 'rating',
  VIEWS = 'views',
}

export class WorkQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @IsOptional()
  @IsEnum(WorkStatus)
  status?: WorkStatus;

  @IsOptional()
  @IsUUID()
  genreId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsEnum(WorkSort)
  sort: WorkSort = WorkSort.NEWEST;
}
