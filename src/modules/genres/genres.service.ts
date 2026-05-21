import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  createPaginatedResult,
  getPagination,
} from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slugify';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreQueryDto } from './dto/genre-query.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

const genreInclude = {
  _count: {
    select: {
      works: true,
    },
  },
} satisfies Prisma.GenreInclude;

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    return this.prisma.genre.create({
      data: {
        name: createGenreDto.name,
        slug: createGenreDto.slug ?? slugify(createGenreDto.name),
      },
      include: genreInclude,
    });
  }

  async findMany(query: GenreQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [genres, total] = await this.prisma.$transaction([
      this.prisma.genre.findMany({
        where,
        include: genreInclude,
        orderBy: {
          name: 'asc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.genre.count({ where }),
    ]);

    return createPaginatedResult(genres, total, pagination);
  }

  async findBySlug(slug: string) {
    return this.prisma.genre.findUniqueOrThrow({
      where: {
        slug,
      },
      include: genreInclude,
    });
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    return this.prisma.genre.update({
      where: {
        id,
      },
      data: {
        name: updateGenreDto.name,
        slug: updateGenreDto.slug,
      },
      include: genreInclude,
    });
  }

  async remove(id: string) {
    await this.prisma.genre.delete({
      where: {
        id,
      },
    });
  }

  private buildWhere(query: GenreQueryDto): Prisma.GenreWhereInput {
    if (!query.search) {
      return {};
    }

    return {
      OR: [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }
}
