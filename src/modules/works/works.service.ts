import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  createPaginatedResult,
  getPagination,
} from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slugify';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkQueryDto } from './dto/work-query.dto';

const workInclude = {
  genres: {
    include: {
      genre: true,
    },
    orderBy: {
      genre: {
        name: 'asc',
      },
    },
  },
} satisfies Prisma.WorkInclude;

@Injectable()
export class WorksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkDto: CreateWorkDto) {
    const { genreIds, ...workDto } = createWorkDto;

    return this.prisma.work.create({
      data: {
        ...this.mapCreateData(workDto),
        genres: this.mapGenreCreates(genreIds),
      },
      include: workInclude,
    });
  }

  async findMany(query: WorkQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [works, total] = await this.prisma.$transaction([
      this.prisma.work.findMany({
        where,
        include: workInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.work.count({ where }),
    ]);

    return createPaginatedResult(works, total, pagination);
  }

  async findBySlug(slug: string) {
    return this.prisma.work.findUniqueOrThrow({
      where: {
        slug,
      },
      include: workInclude,
    });
  }

  async update(id: string, updateWorkDto: UpdateWorkDto) {
    const { genreIds, ...workDto } = updateWorkDto;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.work.update({
        where: {
          id,
        },
        data: this.mapUpdateData(workDto),
      });

      if (genreIds !== undefined) {
        await prisma.workGenre.deleteMany({
          where: {
            workId: id,
          },
        });

        if (genreIds.length > 0) {
          await prisma.workGenre.createMany({
            data: genreIds.map((genreId) => ({
              workId: id,
              genreId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.prisma.work.findUniqueOrThrow({
      where: {
        id,
      },
      include: workInclude,
    });
  }

  async remove(id: string) {
    await this.prisma.work.delete({
      where: {
        id,
      },
    });
  }

  private buildWhere(query: WorkQueryDto): Prisma.WorkWhereInput {
    const where: Prisma.WorkWhereInput = {};
    const and: Prisma.WorkWhereInput[] = [];

    if (query.search) {
      and.push({
        OR: [
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
        ],
      });
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.genreId) {
      and.push({
        genres: {
          some: {
            genreId: query.genreId,
          },
        },
      });
    }

    if (query.genreSlug) {
      and.push({
        genres: {
          some: {
            genre: {
              slug: query.genreSlug,
            },
          },
        },
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    return where;
  }

  private mapCreateData(
    workDto: Omit<CreateWorkDto, 'genreIds'>,
  ): Prisma.WorkCreateInput {
    return {
      titleVi: workDto.titleVi,
      titleOriginal: workDto.titleOriginal,
      titleRomaji: workDto.titleRomaji,
      titleEnglish: workDto.titleEnglish,
      otherNames: workDto.otherNames,
      slug: workDto.slug ?? slugify(workDto.titleVi),
      type: workDto.type,
      status: workDto.status,
      authorName: workDto.authorName,
      artistName: workDto.artistName,
      scriptWriter: workDto.scriptWriter,
      country: workDto.country,
      originalName: workDto.originalName,
      magazine: workDto.magazine,
      publisher: workDto.publisher,
      platform: workDto.platform,
      startDate: this.mapDate(workDto.startDate),
      endDate: this.mapDate(workDto.endDate),
      chapterCount: workDto.chapterCount,
      episodeCount: workDto.episodeCount,
      volumeCount: workDto.volumeCount,
      seasonCount: workDto.seasonCount,
      description: workDto.description,
      synopsis: workDto.synopsis,
      posterUrl: workDto.posterUrl,
      bannerUrl: workDto.bannerUrl,
      officialUrl: workDto.officialUrl,
      legalReadUrl: workDto.legalReadUrl,
      legalWatchUrl: workDto.legalWatchUrl,
    };
  }

  private mapUpdateData(
    workDto: Omit<UpdateWorkDto, 'genreIds'>,
  ): Prisma.WorkUpdateInput {
    return {
      titleVi: workDto.titleVi,
      titleOriginal: workDto.titleOriginal,
      titleRomaji: workDto.titleRomaji,
      titleEnglish: workDto.titleEnglish,
      otherNames: workDto.otherNames,
      slug: workDto.slug,
      type: workDto.type,
      status: workDto.status,
      authorName: workDto.authorName,
      artistName: workDto.artistName,
      scriptWriter: workDto.scriptWriter,
      country: workDto.country,
      originalName: workDto.originalName,
      magazine: workDto.magazine,
      publisher: workDto.publisher,
      platform: workDto.platform,
      startDate: this.mapDate(workDto.startDate),
      endDate: this.mapDate(workDto.endDate),
      chapterCount: workDto.chapterCount,
      episodeCount: workDto.episodeCount,
      volumeCount: workDto.volumeCount,
      seasonCount: workDto.seasonCount,
      description: workDto.description,
      synopsis: workDto.synopsis,
      posterUrl: workDto.posterUrl,
      bannerUrl: workDto.bannerUrl,
      officialUrl: workDto.officialUrl,
      legalReadUrl: workDto.legalReadUrl,
      legalWatchUrl: workDto.legalWatchUrl,
    };
  }

  private mapGenreCreates(genreIds: string[] | undefined) {
    if (!genreIds || genreIds.length === 0) {
      return undefined;
    }

    return {
      create: genreIds.map((genreId) => ({
        genre: {
          connect: {
            id: genreId,
          },
        },
      })),
    };
  }

  private mapDate(value: string | undefined) {
    return value ? new Date(value) : undefined;
  }
}
