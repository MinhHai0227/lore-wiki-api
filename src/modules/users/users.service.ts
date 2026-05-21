import { Injectable } from '@nestjs/common';
import { hashPassword } from 'src/common/utils/password';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

export type GoogleUserInput = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await hashPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        displayName: createUserDto.displayName,
      },
    });
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
}
