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
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkQueryDto } from './dto/work-query.dto';
import { WorksService } from './works.service';

type WorkImageFiles = {
  poster?: Express.Multer.File[];
  banner?: Express.Multer.File[];
};

const workImageFields = [
  {
    name: 'poster',
    maxCount: 1,
  },
  {
    name: 'banner',
    maxCount: 1,
  },
];

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @UseInterceptors(FileFieldsInterceptor(workImageFields))
  async create(
    @Body() createWorkDto: CreateWorkDto,
    @UploadedFiles() files?: WorkImageFiles,
  ) {
    const work = await this.worksService.create(createWorkDto, {
      poster: files?.poster?.[0],
      banner: files?.banner?.[0],
    });

    return successResponse('Work created successfully.', work);
  }

  @Public()
  @Get()
  findMany(@Query() query: WorkQueryDto) {
    return this.worksService.findMany(query);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param() params: SlugParamDto) {
    return this.worksService.findBySlug(params.slug);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor(workImageFields))
  async update(
    @Param() params: IdParamDto,
    @Body() updateWorkDto: UpdateWorkDto,
    @UploadedFiles() files?: WorkImageFiles,
  ) {
    const work = await this.worksService.update(params.id, updateWorkDto, {
      poster: files?.poster?.[0],
      banner: files?.banner?.[0],
    });

    return successResponse('Work updated successfully.', work);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  async remove(@Param() params: IdParamDto) {
    await this.worksService.remove(params.id);

    return successResponse('Work deleted successfully.');
  }
}
