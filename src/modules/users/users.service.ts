import { ConflictException, Injectable } from '@nestjs/common';
import {
  createPaginatedResult,
  getPagination,
} from 'src/common/utils/pagination';
import { hashPassword } from 'src/common/utils/password';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ImageStorageService } from 'src/storage/image-storage.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

export type GoogleUserInput = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type CreateUserInput = {
  email: string;
  password: string;
  displayName?: string;
};

const USER_AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      authoredPages: true,
      ratings: true,
      bookmarks: true,
      comments: true,
    },
  },
} satisfies Prisma.UserSelect;

type UserResponse = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create(createUserDto: CreateUserInput) {
    const passwordHash = await hashPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        displayName: createUserDto.displayName,
      },
    });
  }

  async createForAdmin(
    createUserDto: CreateAdminUserDto,
    avatar?: Express.Multer.File,
  ) {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const passwordHash = await hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        displayName: createUserDto.displayName,
        role: createUserDto.role,
      },
      select: userSelect,
    });

    if (!avatar) {
      return this.serializeUser(user);
    }

    const avatarKey = await this.uploadAvatar(avatar);

    const createdUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: avatarKey,
      },
      select: userSelect,
    });

    return this.serializeUser(createdUser);
  }

  async findMany(query: UserQueryDto) {
    const pagination = getPagination(query);
    const where = this.buildWhere(query);

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: {
          createdAt: 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(
      users.map((user) => this.serializeUser(user)),
      total,
      pagination,
    );
  }

  async findPublicById(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: userSelect,
    });

    return this.serializeUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ) {
    await this.ensureEmailAvailable(id, updateUserDto.email);
    const currentUser = await this.findById(id);
    const avatarKey = avatar ? await this.uploadAvatar(avatar) : undefined;

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: await this.buildUpdateData(updateUserDto, avatarKey),
      select: userSelect,
    });

    await this.deleteOldAvatar(currentUser?.avatarUrl, avatarKey);

    return this.serializeUser(user);
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    avatar?: Express.Multer.File,
  ) {
    await this.ensureEmailAvailable(id, updateProfileDto.email);
    const currentUser = await this.findById(id);
    const avatarKey = avatar ? await this.uploadAvatar(avatar) : undefined;

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: await this.buildUpdateData(updateProfileDto, avatarKey),
      select: userSelect,
    });

    await this.deleteOldAvatar(currentUser?.avatarUrl, avatarKey);

    return this.serializeUser(user);
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
      select: userSelect,
    });

    return this.serializeUser(user);
  }

  getAvatarPublicUrl(avatarKeyOrUrl?: string | null) {
    return this.imageStorageService.getPublicUrl(avatarKeyOrUrl);
  }

  async findOrCreateGoogleUser(googleUser: GoogleUserInput) {
    const existingUser = await this.findByEmail(googleUser.email);

    if (existingUser) {
      return this.prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          displayName: existingUser.displayName ?? googleUser.displayName,
          avatarUrl: existingUser.avatarUrl ?? googleUser.avatarUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email: googleUser.email,
        displayName: googleUser.displayName,
        avatarUrl: googleUser.avatarUrl,
      },
    });
  }

  private buildWhere(query: UserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          displayName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private async ensureEmailAvailable(id: string, email?: string) {
    if (!email) {
      return;
    }

    const existingUser = await this.findByEmail(email);

    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }
  }

  private async buildUpdateData(
    updateUserDto: UpdateUserDto | UpdateProfileDto,
    avatarKey?: string,
  ): Promise<Prisma.UserUpdateInput> {
    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      displayName: updateUserDto.displayName,
      avatarUrl: avatarKey,
      role: 'role' in updateUserDto ? updateUserDto.role : undefined,
    };

    if ('password' in updateUserDto && updateUserDto.password) {
      data.passwordHash = await hashPassword(updateUserDto.password);
    }

    return data;
  }

  private async uploadAvatar(avatar: Express.Multer.File) {
    return this.imageStorageService.uploadImage({
      file: avatar,
      keyPrefix: ['users', 'avatar'],
      maxSizeBytes: USER_AVATAR_MAX_SIZE_BYTES,
    });
  }

  private serializeUser(user: UserResponse): UserResponse {
    return {
      ...user,
      avatarUrl: this.getAvatarPublicUrl(user.avatarUrl),
    };
  }

  private async deleteOldAvatar(
    oldAvatarKey?: string | null,
    newAvatarKey?: string,
  ) {
    if (!oldAvatarKey || !newAvatarKey || oldAvatarKey === newAvatarKey) {
      return;
    }

    await this.imageStorageService.deleteKeyIfManaged(oldAvatarKey);
  }
}
