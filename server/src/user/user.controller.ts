import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AssignProfilesDto } from './dto/assign.profiles.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
@Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto, 
  ) {
    const profilePicture = file?.filename;
    return this.userService.create({ ...createUserDto, profilePicture });
  }
@Roles('ADMIN')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

@Put(':id')
@UseInterceptors(
  FileInterceptor('profilePicture', {
    storage: diskStorage({
      destination: './uploads/profile-pictures',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `profile-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }),
)
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserDto: UpdateUserDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  // Only update the fields we want to allow
  const updateData: Partial<UpdateUserDto> = {
    name: updateUserDto.name,
    email: updateUserDto.email,
    phoneNumber: updateUserDto.phoneNumber,
    dateOfBirth: updateUserDto.dateOfBirth
  };

  if (file) {
    updateData.profilePicture = file.filename;
  }

  return this.userService.update(id, updateData);
}
@Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
@Roles('ADMIN')
  @Post('assign')
  assignProfiles(@Body() assignProfilesDto: AssignProfilesDto) {
    return this.userService.assignProfilesToUser(assignProfilesDto);
  }
@Post(':id/profile-picture')
@UseInterceptors(
  FileInterceptor('profilePicture', {
    storage: diskStorage({
      destination: './uploads/profile-pictures',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `profile-${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }),
)
async updateProfilePicture(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  const updatedUser = await this.userService.updateProfilePicture(
    id,
    file.filename,
  );
  
  return {
    message: 'Profile picture updated successfully',
    profilePicture: updatedUser.profilePicture,
  };
}
}
