import { Module } from '@nestjs/common';
import { CharacterRelationsController } from './character-relations.controller';
import { CharacterRelationsService } from './character-relations.service';

@Module({
  controllers: [CharacterRelationsController],
  providers: [CharacterRelationsService],
})
export class CharacterRelationsModule {}
