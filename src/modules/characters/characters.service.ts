import { ConflictException, Injectable } from '@nestjs/common';
import {
  createPaginatedResult,
  getPagination,
} from 'src/common/utils/pagination';
import { slugify } from 'src/common/utils/slugify';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ImageStorageService } from 'src/storage/image-storage.service';
import { CharacterQueryDto, CharacterSort } from './dto/character-query.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

type CharacterImages = {
  avatar?: Express.Multer.File;
  cover?: Express.Multer.File;
};

const CHARACTER_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const characterInclude = {
  works: {
    include: {
      work: {
        select: {
          id: true,
          titleVi: true,
          titleOriginal: true,
          slug: true,
          type: true,
          status: true,
          posterUrl: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  },
  _count: {
    select: {
      skills: true,
      factions: true,
      wikiPages: true,
      mediaAssets: true,
      relationsFrom: true,
      relationsTo: true,
    },
  },
} satisfies Prisma.CharacterInclude;

type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: typeof characterInclude;
}>;

@Injectable()
export class CharactersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async create(
    createCharacterDto: CreateCharacterDto,
    images: CharacterImages = {},
  ) {
    const slug = createCharacterDto.slug ?? slugify(createCharacterDto.nameVi);
    await this.ensureSlugAvailable(slug);

    const [avatarKey, coverKey] = await Promise.all([
      images.avatar
        ? this.uploadCharacterImage(images.avatar, 'avatars')
        : null,
      images.cover ? this.uploadCharacterImage(images.cover, 'covers') : null,
    ]);

    const character = await this.prisma.character.create({
      data: {
        ...this.buildCreateData(createCharacterDto, slug, avatarKey, coverKey),
        works: this.buildWorkCreateInput(createCharacterDto.workIds),
      },
      include: characterInclude,
    });

    return this.serializeCharacter(character);
  }

  async findMany(query: CharacterQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [characters, total] = await this.prisma.$transaction([
      this.prisma.character.findMany({
        where,
        include: characterInclude,
        orderBy: this.buildOrderBy(query),
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.character.count({ where }),
    ]);

    return createPaginatedResult(
      characters.map((character) => this.serializeCharacter(character)),
      total,
      pagination,
    );
  }

  async findBySlug(slug: string) {
    const character = await this.prisma.character.findUniqueOrThrow({
      where: {
        slug,
      },
      include: characterInclude,
    });

    return this.serializeCharacter(character);
  }

  async update(
    id: string,
    updateCharacterDto: UpdateCharacterDto,
    images: CharacterImages = {},
  ) {
    if (updateCharacterDto.slug) {
      await this.ensureSlugAvailable(updateCharacterDto.slug, id);
    }

    const currentCharacter = await this.prisma.character.findUniqueOrThrow({
      where: {
        id,
      },
    });

    const [avatarKey, coverKey] = await Promise.all([
      images.avatar
        ? this.uploadCharacterImage(images.avatar, 'avatars')
        : undefined,
      images.cover
        ? this.uploadCharacterImage(images.cover, 'covers')
        : undefined,
    ]);

    const character = await this.prisma.$transaction(async (tx) => {
      const updatedCharacter = await tx.character.update({
        where: {
          id,
        },
        data: this.buildUpdateData(updateCharacterDto, avatarKey, coverKey),
        include: characterInclude,
      });

      if (updateCharacterDto.workIds !== undefined) {
        await tx.workCharacter.deleteMany({
          where: {
            characterId: id,
          },
        });

        if (updateCharacterDto.workIds.length > 0) {
          await tx.workCharacter.createMany({
            data: this.uniqueIds(updateCharacterDto.workIds).map(
              (workId, index) => ({
                workId,
                characterId: id,
                sortOrder: index,
              }),
            ),
          });
        }

        return tx.character.findUniqueOrThrow({
          where: {
            id,
          },
          include: characterInclude,
        });
      }

      return updatedCharacter;
    });

    await Promise.all([
      this.deleteOldImage(currentCharacter.avatarUrl, avatarKey),
      this.deleteOldImage(currentCharacter.coverUrl, coverKey),
    ]);

    return this.serializeCharacter(character);
  }

  async remove(id: string) {
    const character = await this.prisma.character.findUniqueOrThrow({
      where: {
        id,
      },
    });

    await this.prisma.character.delete({
      where: {
        id,
      },
    });

    await Promise.all([
      this.imageStorageService.deleteKeyIfManaged(character.avatarUrl),
      this.imageStorageService.deleteKeyIfManaged(character.coverUrl),
    ]);
  }

  private buildCreateData(
    createCharacterDto: CreateCharacterDto,
    slug: string,
    avatarKey?: string | null,
    coverKey?: string | null,
  ): Prisma.CharacterCreateInput {
    return {
      nameVi: createCharacterDto.nameVi,
      nameOriginal: createCharacterDto.nameOriginal,
      nameRomaji: createCharacterDto.nameRomaji,
      nameEnglish: createCharacterDto.nameEnglish,
      aliases: createCharacterDto.aliases,
      slug,
      gender: createCharacterDto.gender,
      age: createCharacterDto.age,
      birthday: createCharacterDto.birthday,
      species: createCharacterDto.species,
      occupation: createCharacterDto.occupation,
      voiceActors: createCharacterDto.voiceActors,
      shortIntro: createCharacterDto.shortIntro,
      background: createCharacterDto.background,
      appearance: createCharacterDto.appearance,
      personality: createCharacterDto.personality,
      lifeStory: createCharacterDto.lifeStory,
      seoTitle: createCharacterDto.seoTitle,
      seoDescription: createCharacterDto.seoDescription,
      avatarUrl: avatarKey,
      coverUrl: coverKey,
      isSpoilerHeavy: createCharacterDto.isSpoilerHeavy,
    };
  }

  private buildUpdateData(
    updateCharacterDto: UpdateCharacterDto,
    avatarKey?: string,
    coverKey?: string,
  ): Prisma.CharacterUpdateInput {
    return {
      nameVi: updateCharacterDto.nameVi,
      nameOriginal: updateCharacterDto.nameOriginal,
      nameRomaji: updateCharacterDto.nameRomaji,
      nameEnglish: updateCharacterDto.nameEnglish,
      aliases: updateCharacterDto.aliases,
      slug: updateCharacterDto.slug,
      gender: updateCharacterDto.gender,
      age: updateCharacterDto.age,
      birthday: updateCharacterDto.birthday,
      species: updateCharacterDto.species,
      occupation: updateCharacterDto.occupation,
      voiceActors: updateCharacterDto.voiceActors,
      shortIntro: updateCharacterDto.shortIntro,
      background: updateCharacterDto.background,
      appearance: updateCharacterDto.appearance,
      personality: updateCharacterDto.personality,
      lifeStory: updateCharacterDto.lifeStory,
      seoTitle: updateCharacterDto.seoTitle,
      seoDescription: updateCharacterDto.seoDescription,
      avatarUrl: avatarKey,
      coverUrl: coverKey,
      isSpoilerHeavy: updateCharacterDto.isSpoilerHeavy,
    };
  }

  private buildWorkCreateInput(workIds?: string[]) {
    if (!workIds?.length) {
      return undefined;
    }

    return {
      create: this.uniqueIds(workIds).map((workId, index) => ({
        work: {
          connect: {
            id: workId,
          },
        },
        sortOrder: index,
      })),
    };
  }

  private buildWhere(query: CharacterQueryDto): Prisma.CharacterWhereInput {
    const where: Prisma.CharacterWhereInput = {};

    if (query.workId) {
      where.works = {
        some: {
          workId: query.workId,
        },
      };
    }

    if (query.gender) {
      where.gender = {
        contains: query.gender,
        mode: 'insensitive',
      };
    }

    if (query.species) {
      where.species = {
        contains: query.species,
        mode: 'insensitive',
      };
    }

    if (query.isSpoilerHeavy !== undefined) {
      where.isSpoilerHeavy = query.isSpoilerHeavy;
    }

    if (query.search) {
      where.OR = [
        {
          nameVi: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          nameOriginal: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          nameRomaji: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          nameEnglish: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          aliases: {
            has: query.search,
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: CharacterQueryDto,
  ): Prisma.CharacterOrderByWithRelationInput {
    switch (query.sort) {
      case CharacterSort.OLDEST:
        return {
          createdAt: 'asc',
        };
      case CharacterSort.NAME:
        return {
          nameVi: 'asc',
        };
      case CharacterSort.VIEWS:
        return {
          viewCount: 'desc',
        };
      case CharacterSort.NEWEST:
      default:
        return {
          createdAt: 'desc',
        };
    }
  }

  private async ensureSlugAvailable(slug: string, currentCharacterId?: string) {
    const existingCharacter = await this.prisma.character.findUnique({
      where: {
        slug,
      },
    });

    if (existingCharacter && existingCharacter.id !== currentCharacterId) {
      throw new ConflictException('Slug đã tồn tại trong hệ thống');
    }
  }

  private async uploadCharacterImage(
    file: Express.Multer.File,
    folder: string,
  ) {
    return this.imageStorageService.uploadImage({
      file,
      keyPrefix: ['characters', folder],
      maxSizeBytes: CHARACTER_IMAGE_MAX_SIZE_BYTES,
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

  private serializeCharacter(character: CharacterWithRelations) {
    return {
      ...character,
      avatarUrl: this.imageStorageService.getPublicUrl(character.avatarUrl),
      coverUrl: this.imageStorageService.getPublicUrl(character.coverUrl),
      works: character.works.map((workCharacter) => ({
        role: workCharacter.role,
        description: workCharacter.description,
        sortOrder: workCharacter.sortOrder,
        work: {
          ...workCharacter.work,
          posterUrl: this.imageStorageService.getPublicUrl(
            workCharacter.work.posterUrl,
          ),
        },
      })),
    };
  }

  private uniqueIds(ids: string[]) {
    return [...new Set(ids)];
  }
}
