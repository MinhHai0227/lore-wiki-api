import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CharacterRelationType } from 'src/generated/prisma/client';

export class CreateCharacterRelationDto {
  @IsUUID()
  fromCharacterId: string;

  @IsUUID()
  toCharacterId: string;

  @IsEnum(CharacterRelationType)
  relationType: CharacterRelationType;

  @IsOptional()
  @IsString()
  description?: string;
}
