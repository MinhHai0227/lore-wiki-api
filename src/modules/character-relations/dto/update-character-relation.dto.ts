import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CharacterRelationType } from 'src/generated/prisma/client';

export class UpdateCharacterRelationDto {
  @IsOptional()
  @IsEnum(CharacterRelationType)
  relationType?: CharacterRelationType;

  @IsOptional()
  @IsString()
  description?: string;
}
