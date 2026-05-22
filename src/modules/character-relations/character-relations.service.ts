import { BadRequestException, Injectable } from '@nestjs/common';
import {
  createPaginatedResult,
  getPagination,
} from 'src/common/utils/pagination';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ImageStorageService } from 'src/storage/image-storage.service';
import { CharacterRelationQueryDto } from './dto/character-relation-query.dto';
import { CreateCharacterRelationDto } from './dto/create-character-relation.dto';
import { UpdateCharacterRelationDto } from './dto/update-character-relation.dto';

const characterSummarySelect = {
  id: true,
  nameVi: true,
  nameOriginal: true,
  nameRomaji: true,
  nameEnglish: true,
  slug: true,
  avatarUrl: true,
} satisfies Prisma.CharacterSelect;

const relationInclude = {
  fromCharacter: {
    select: characterSummarySelect,
  },
  toCharacter: {
    select: characterSummarySelect,
  },
} satisfies Prisma.CharacterRelationInclude;

type RelationWithCharacters = Prisma.CharacterRelationGetPayload<{
  include: typeof relationInclude;
}>;

@Injectable()
export class CharacterRelationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async create(createRelationDto: CreateCharacterRelationDto) {
    this.assertDifferentCharacters(
      createRelationDto.fromCharacterId,
      createRelationDto.toCharacterId,
    );

    await this.assertCharactersExist([
      createRelationDto.fromCharacterId,
      createRelationDto.toCharacterId,
    ]);

    const relation = await this.prisma.characterRelation.create({
      data: {
        fromCharacterId: createRelationDto.fromCharacterId,
        toCharacterId: createRelationDto.toCharacterId,
        relationType: createRelationDto.relationType,
        description: createRelationDto.description,
      },
      include: relationInclude,
    });

    return this.serializeRelation(relation);
  }

  async findMany(query: CharacterRelationQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [relations, total] = await this.prisma.$transaction([
      this.prisma.characterRelation.findMany({
        where,
        include: relationInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.characterRelation.count({ where }),
    ]);

    return createPaginatedResult(
      relations.map((relation) => this.serializeRelation(relation)),
      total,
      pagination,
    );
  }

  async findByCharacterId(
    characterId: string,
    query: CharacterRelationQueryDto,
  ) {
    return this.findMany({
      ...query,
      characterId,
    });
  }

  async update(id: string, updateRelationDto: UpdateCharacterRelationDto) {
    const relation = await this.prisma.characterRelation.update({
      where: {
        id,
      },
      data: {
        relationType: updateRelationDto.relationType,
        description: updateRelationDto.description,
      },
      include: relationInclude,
    });

    return this.serializeRelation(relation);
  }

  async remove(id: string) {
    await this.prisma.characterRelation.delete({
      where: {
        id,
      },
    });
  }

  private buildWhere(
    query: CharacterRelationQueryDto,
  ): Prisma.CharacterRelationWhereInput {
    const where: Prisma.CharacterRelationWhereInput = {};

    if (query.characterId) {
      where.OR = [
        {
          fromCharacterId: query.characterId,
        },
        {
          toCharacterId: query.characterId,
        },
      ];
    }

    if (query.fromCharacterId) {
      where.fromCharacterId = query.fromCharacterId;
    }

    if (query.toCharacterId) {
      where.toCharacterId = query.toCharacterId;
    }

    if (query.relationType) {
      where.relationType = query.relationType;
    }

    return where;
  }

  private assertDifferentCharacters(
    fromCharacterId: string,
    toCharacterId: string,
  ) {
    if (fromCharacterId === toCharacterId) {
      throw new BadRequestException(
        'Không thể tạo quan hệ với cùng một nhân vật',
      );
    }
  }

  private async assertCharactersExist(characterIds: string[]) {
    const uniqueCharacterIds = [...new Set(characterIds)];
    const count = await this.prisma.character.count({
      where: {
        id: {
          in: uniqueCharacterIds,
        },
      },
    });

    if (count !== uniqueCharacterIds.length) {
      throw new BadRequestException('Một hoặc nhiều nhân vật không tồn tại');
    }
  }

  private serializeRelation(relation: RelationWithCharacters) {
    return {
      ...relation,
      fromCharacter: {
        ...relation.fromCharacter,
        avatarUrl: this.imageStorageService.getPublicUrl(
          relation.fromCharacter.avatarUrl,
        ),
      },
      toCharacter: {
        ...relation.toCharacter,
        avatarUrl: this.imageStorageService.getPublicUrl(
          relation.toCharacter.avatarUrl,
        ),
      },
    };
  }
}
