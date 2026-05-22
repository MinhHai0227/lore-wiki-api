import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import { successResponse } from 'src/common/utils/response';
import { UserRole } from 'src/generated/prisma/client';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = {
  user: {
    id: string;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.findPublicById(req.user.id);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
      avatar,
    );

    return successResponse('User profile updated successfully.', user);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createUserDto: CreateAdminUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const user = await this.usersService.createForAdmin(createUserDto, avatar);

    return successResponse('User created successfully.', user);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findMany(@Query() query: UserQueryDto) {
    return this.usersService.findMany(query);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.usersService.findPublicById(params.id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param() params: IdParamDto,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const user = await this.usersService.update(
      params.id,
      updateUserDto,
      avatar,
    );

    return successResponse('User updated successfully.', user);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param() params: IdParamDto) {
    await this.usersService.remove(params.id);

    return successResponse('User deleted successfully.');
  }
}
