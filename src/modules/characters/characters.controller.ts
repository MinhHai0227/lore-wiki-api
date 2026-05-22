import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { SlugParamDto } from 'src/common/dto/slug-param.dto';
import { successResponse } from 'src/common/utils/response';
import { UserRole } from 'src/generated/prisma/client';
import { CharacterQueryDto } from './dto/character-query.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharactersService } from './characters.service';

type CharacterImageFiles = {
  avatar?: Express.Multer.File[];
  cover?: Express.Multer.File[];
};

const characterImageFields = [
  {
    name: 'avatar',
    maxCount: 1,
  },
  {
    name: 'cover',
    maxCount: 1,
  },
];

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @UseInterceptors(FileFieldsInterceptor(characterImageFields))
  async create(
    @Body() createCharacterDto: CreateCharacterDto,
    @UploadedFiles() files?: CharacterImageFiles,
  ) {
    const character = await this.charactersService.create(createCharacterDto, {
      avatar: files?.avatar?.[0],
      cover: files?.cover?.[0],
    });

    return successResponse('Character created successfully.', character);
  }

  @Public()
  @Get()
  findMany(@Query() query: CharacterQueryDto) {
    return this.charactersService.findMany(query);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param() params: SlugParamDto) {
    return this.charactersService.findBySlug(params.slug);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor(characterImageFields))
  async update(
    @Param() params: IdParamDto,
    @Body() updateCharacterDto: UpdateCharacterDto,
    @UploadedFiles() files?: CharacterImageFiles,
  ) {
    const character = await this.charactersService.update(
      params.id,
      updateCharacterDto,
      {
        avatar: files?.avatar?.[0],
        cover: files?.cover?.[0],
      },
    );

    return successResponse('Character updated successfully.', character);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  async remove(@Param() params: IdParamDto) {
    await this.charactersService.remove(params.id);

    return successResponse('Character deleted successfully.');
  }
}
