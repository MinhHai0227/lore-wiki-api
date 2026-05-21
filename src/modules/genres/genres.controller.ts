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
import { IdParamDto } from '../../common/dto/id-param.dto';
import { SlugParamDto } from '../../common/dto/slug-param.dto';
import { successResponse } from '../../common/utils/response';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreQueryDto } from './dto/genre-query.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const genre = await this.genresService.create(createGenreDto);

    return successResponse('Genre created successfully.', genre);
  }

  @Get()
  findMany(@Query() query: GenreQueryDto) {
    return this.genresService.findMany(query);
  }

  @Get(':slug')
  findBySlug(@Param() params: SlugParamDto) {
    return this.genresService.findBySlug(params.slug);
  }

  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const genre = await this.genresService.update(params.id, updateGenreDto);

    return successResponse('Genre updated successfully.', genre);
  }

  @Delete(':id')
  async remove(@Param() params: IdParamDto) {
    await this.genresService.remove(params.id);

    return successResponse('Genre deleted successfully.');
  }
}
