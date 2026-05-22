import { ConflictException, Injectable } from '@nestjs/common';
import {
  createPaginatedResult,
  getPagination,
} from 'src/common/utils/pagination';
import { slugify } from 'src/common/utils/slugify';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ImageStorageService } from 'src/storage/image-storage.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkQueryDto, WorkSort } from './dto/work-query.dto';

type WorkImages = {
  poster?: Express.Multer.File;
  banner?: Express.Multer.File;
};

const WORK_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const workInclude = {
  genres: {
    include: {
      genre: true,
    },
  },
  _count: {
    select: {
      characters: true,
      wikiPages: true,
      ratings: true,
      mediaAssets: true,
    },
  },
} satisfies Prisma.WorkInclude;

type WorkWithRelations = Prisma.WorkGetPayload<{ include: typeof workInclude }>;

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async create(createWorkDto: CreateWorkDto, images: WorkImages = {}) {
    const slug = createWorkDto.slug ?? slugify(createWorkDto.titleVi);
    await this.ensureSlugAvailable(slug);

    const [posterKey, bannerKey] = await Promise.all([
      images.poster ? this.uploadWorkImage(images.poster, 'posters') : null,
      images.banner ? this.uploadWorkImage(images.banner, 'banners') : null,
    ]);

    const work = await this.prisma.work.create({
      data: {
        ...this.buildCreateData(createWorkDto, slug, posterKey, bannerKey),
        genres: this.buildGenreCreateInput(createWorkDto.genreIds),
      },
      include: workInclude,
    });

    return this.serializeWork(work);
  }

  async findMany(query: WorkQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [works, total] = await this.prisma.$transaction([
      this.prisma.work.findMany({
        where,
        include: workInclude,
        orderBy: this.buildOrderBy(query),
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.work.count({ where }),
    ]);

    return createPaginatedResult(
      works.map((work) => this.serializeWork(work)),
      total,
      pagination,
    );
  }

  async findBySlug(slug: string) {
    const work = await this.prisma.work.findUniqueOrThrow({
      where: {
        slug,
      },
      include: workInclude,
    });

    return this.serializeWork(work);
  }

  async update(
    id: string,
    updateWorkDto: UpdateWorkDto,
    images: WorkImages = {},
  ) {
    if (updateWorkDto.slug) {
      await this.ensureSlugAvailable(updateWorkDto.slug, id);
    }

    const currentWork = await this.prisma.work.findUniqueOrThrow({
      where: {
        id,
      },
    });

    const [posterKey, bannerKey] = await Promise.all([
      images.poster
        ? this.uploadWorkImage(images.poster, 'posters')
        : undefined,
      images.banner
        ? this.uploadWorkImage(images.banner, 'banners')
        : undefined,
    ]);

    const work = await this.prisma.$transaction(async (tx) => {
      const updatedWork = await tx.work.update({
        where: {
          id,
        },
        data: this.buildUpdateData(updateWorkDto, posterKey, bannerKey),
        include: workInclude,
      });

      if (updateWorkDto.genreIds !== undefined) {
        await tx.workGenre.deleteMany({
          where: {
            workId: id,
          },
        });

        if (updateWorkDto.genreIds.length > 0) {
          await tx.workGenre.createMany({
            data: this.uniqueIds(updateWorkDto.genreIds).map((genreId) => ({
              workId: id,
              genreId,
            })),
          });
        }

        return tx.work.findUniqueOrThrow({
          where: {
            id,
          },
          include: workInclude,
        });
      }

      return updatedWork;
    });

    await Promise.all([
      this.deleteOldImage(currentWork.posterUrl, posterKey),
      this.deleteOldImage(currentWork.bannerUrl, bannerKey),
    ]);

    return this.serializeWork(work);
  }

  async remove(id: string) {
    const work = await this.prisma.work.findUniqueOrThrow({
      where: {
        id,
      },
    });

    await this.prisma.work.delete({
      where: {
        id,
      },
    });

    await Promise.all([
      this.imageStorageService.deleteKeyIfManaged(work.posterUrl),
      this.imageStorageService.deleteKeyIfManaged(work.bannerUrl),
    ]);
  }

  private buildCreateData(
    createWorkDto: CreateWorkDto,
    slug: string,
    posterKey?: string | null,
    bannerKey?: string | null,
  ): Prisma.WorkCreateInput {
    return {
      titleVi: createWorkDto.titleVi,
      titleOriginal: createWorkDto.titleOriginal,
      titleRomaji: createWorkDto.titleRomaji,
      titleEnglish: createWorkDto.titleEnglish,
      otherNames: createWorkDto.otherNames,
      slug,
      type: createWorkDto.type,
      status: createWorkDto.status,
      authorName: createWorkDto.authorName,
      artistName: createWorkDto.artistName,
      scriptWriter: createWorkDto.scriptWriter,
      country: createWorkDto.country,
      originalName: createWorkDto.originalName,
      magazine: createWorkDto.magazine,
      publisher: createWorkDto.publisher,
      platform: createWorkDto.platform,
      startDate: this.toDate(createWorkDto.startDate),
      endDate: this.toDate(createWorkDto.endDate),
      chapterCount: createWorkDto.chapterCount,
      episodeCount: createWorkDto.episodeCount,
      volumeCount: createWorkDto.volumeCount,
      seasonCount: createWorkDto.seasonCount,
      description: createWorkDto.description,
      synopsis: createWorkDto.synopsis,
      posterUrl: posterKey,
      bannerUrl: bannerKey,
      officialUrl: createWorkDto.officialUrl,
      legalReadUrl: createWorkDto.legalReadUrl,
      legalWatchUrl: createWorkDto.legalWatchUrl,
    };
  }

  private buildUpdateData(
    updateWorkDto: UpdateWorkDto,
    posterKey?: string,
    bannerKey?: string,
  ): Prisma.WorkUpdateInput {
    return {
      titleVi: updateWorkDto.titleVi,
      titleOriginal: updateWorkDto.titleOriginal,
      titleRomaji: updateWorkDto.titleRomaji,
      titleEnglish: updateWorkDto.titleEnglish,
      otherNames: updateWorkDto.otherNames,
      slug: updateWorkDto.slug,
      type: updateWorkDto.type,
      status: updateWorkDto.status,
      authorName: updateWorkDto.authorName,
      artistName: updateWorkDto.artistName,
      scriptWriter: updateWorkDto.scriptWriter,
      country: updateWorkDto.country,
      originalName: updateWorkDto.originalName,
      magazine: updateWorkDto.magazine,
      publisher: updateWorkDto.publisher,
      platform: updateWorkDto.platform,
      startDate: this.toDate(updateWorkDto.startDate),
      endDate: this.toDate(updateWorkDto.endDate),
      chapterCount: updateWorkDto.chapterCount,
      episodeCount: updateWorkDto.episodeCount,
      volumeCount: updateWorkDto.volumeCount,
      seasonCount: updateWorkDto.seasonCount,
      description: updateWorkDto.description,
      synopsis: updateWorkDto.synopsis,
      posterUrl: posterKey,
      bannerUrl: bannerKey,
      officialUrl: updateWorkDto.officialUrl,
      legalReadUrl: updateWorkDto.legalReadUrl,
      legalWatchUrl: updateWorkDto.legalWatchUrl,
    };
  }

  private buildGenreCreateInput(genreIds?: string[]) {
    if (!genreIds?.length) {
      return undefined;
    }

    return {
      create: this.uniqueIds(genreIds).map((genreId) => ({
        genre: {
          connect: {
            id: genreId,
          },
        },
      })),
    };
  }

  private buildWhere(query: WorkQueryDto): Prisma.WorkWhereInput {
    const where: Prisma.WorkWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.genreId) {
      where.genres = {
        some: {
          genreId: query.genreId,
        },
      };
    }

    if (query.country) {
      where.country = {
        contains: query.country,
        mode: 'insensitive',
      };
    }

    if (query.authorName) {
      where.authorName = {
        contains: query.authorName,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        {
          titleVi: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          titleOriginal: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          titleRomaji: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          titleEnglish: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          otherNames: {
            has: query.search,
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: WorkQueryDto,
  ): Prisma.WorkOrderByWithRelationInput {
    switch (query.sort) {
      case WorkSort.OLDEST:
        return {
          createdAt: 'asc',
        };
      case WorkSort.TITLE:
        return {
          titleVi: 'asc',
        };
      case WorkSort.RATING:
        return {
          avgRating: 'desc',
        };
      case WorkSort.VIEWS:
        return {
          viewCount: 'desc',
        };
      case WorkSort.NEWEST:
      default:
        return {
          createdAt: 'desc',
        };
    }
  }

  private async ensureSlugAvailable(slug: string, currentWorkId?: string) {
    const existingWork = await this.prisma.work.findUnique({
      where: {
        slug,
      },
    });

    if (existingWork && existingWork.id !== currentWorkId) {
      throw new ConflictException('Slug đã tồn tại trong hệ thống');
    }
  }

  private async uploadWorkImage(file: Express.Multer.File, folder: string) {
    return this.imageStorageService.uploadImage({
      file,
      keyPrefix: ['works', folder],
      maxSizeBytes: WORK_IMAGE_MAX_SIZE_BYTES,
    });
  }

  private async deleteOldImage(
    oldImageKey?: string | null,
    newImageKey?: string,
  ) {
    if (!oldImageKey || !newImageKey || oldImageKey === newImageKey) {
      return;
    }

    await this.imageStorageService.deleteKeyIfManaged(oldImageKey);
  }

  private serializeWork(work: WorkWithRelations) {
    return {
      ...work,
      posterUrl: this.imageStorageService.getPublicUrl(work.posterUrl),
      bannerUrl: this.imageStorageService.getPublicUrl(work.bannerUrl),
      genres: work.genres.map((workGenre) => workGenre.genre),
    };
  }

  private toDate(value?: string) {
    return value ? new Date(value) : undefined;
  }

  private uniqueIds(ids: string[]) {
    return [...new Set(ids)];
  }
}
