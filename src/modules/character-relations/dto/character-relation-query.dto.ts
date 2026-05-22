import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CharacterRelationType } from 'src/generated/prisma/client';

export class CharacterRelationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  characterId?: string;

  @IsOptional()
  @IsUUID()
  fromCharacterId?: string;

  @IsOptional()
  @IsUUID()
  toCharacterId?: string;

  @IsOptional()
  @IsEnum(CharacterRelationType)
  relationType?: CharacterRelationType;
}
