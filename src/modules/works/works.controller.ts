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
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkQueryDto } from './dto/work-query.dto';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Post()
  async create(@Body() createWorkDto: CreateWorkDto) {
    const work = await this.worksService.create(createWorkDto);

    return successResponse('Work created successfully.', work);
  }

  @Get()
  findMany(@Query() query: WorkQueryDto) {
    return this.worksService.findMany(query);
  }

  @Get(':slug')
  findBySlug(@Param() params: SlugParamDto) {
    return this.worksService.findBySlug(params.slug);
  }

  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    const work = await this.worksService.update(params.id, updateWorkDto);

    return successResponse('Work updated successfully.', work);
  }

  @Delete(':id')
  async remove(@Param() params: IdParamDto) {
    await this.worksService.remove(params.id);

    return successResponse('Work deleted successfully.');
  }
}
