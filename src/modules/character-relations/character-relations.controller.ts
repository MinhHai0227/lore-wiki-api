import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { successResponse } from 'src/common/utils/response';
import { UserRole } from 'src/generated/prisma/client';
import { CharacterRelationQueryDto } from './dto/character-relation-query.dto';
import { CreateCharacterRelationDto } from './dto/create-character-relation.dto';
import { UpdateCharacterRelationDto } from './dto/update-character-relation.dto';
import { CharacterRelationsService } from './character-relations.service';

@Controller()
export class CharacterRelationsController {
  constructor(
    private readonly characterRelationsService: CharacterRelationsService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post('character-relations')
  async create(@Body() createRelationDto: CreateCharacterRelationDto) {
    const relation =
      await this.characterRelationsService.create(createRelationDto);

    return successResponse(
      'Character relation created successfully.',
      relation,
    );
  }

  @Public()
  @Get('character-relations')
  findMany(@Query() query: CharacterRelationQueryDto) {
    return this.characterRelationsService.findMany(query);
  }

  @Public()
  @Get('characters/:id/relations')
  findByCharacterId(
    @Param() params: IdParamDto,
    @Query() query: CharacterRelationQueryDto,
  ) {
    return this.characterRelationsService.findByCharacterId(params.id, query);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch('character-relations/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateRelationDto: UpdateCharacterRelationDto,
  ) {
    const relation = await this.characterRelationsService.update(
      params.id,
      updateRelationDto,
    );

    return successResponse(
      'Character relation updated successfully.',
      relation,
    );
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete('character-relations/:id')
  async remove(@Param() params: IdParamDto) {
    await this.characterRelationsService.remove(params.id);

    return successResponse('Character relation deleted successfully.');
  }
}
