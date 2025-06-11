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
  UploadedFiles,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Roles } from 'src/user/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

const fileUploadOptions = {
  storage: diskStorage({
    destination: './uploads/profilesPDF',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@Roles('ADMIN')
@Post()
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'pdfCgv', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: './uploads/profilesPDF',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    },
  ),
)
async create(
  @Body() body: CreateProfileDto,
  @UploadedFiles()
  files: {
    pdfCgv?: Express.Multer.File[];
    logo?: Express.Multer.File[];
  },
) {
  const pdfCgvFile = files.pdfCgv?.[0];
  const logoFile = files.logo?.[0];
  console.log(body)
  return this.profileService.create(body, pdfCgvFile, logoFile);
}

@Roles('ADMIN')
@Put(':id')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'pdfCgv', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: './uploads/profilesPDF',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    },
  ),
)
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: UpdateProfileDto,
  @UploadedFiles()
  files: {
    pdfCgv?: Express.Multer.File[];
    logo?: Express.Multer.File[];
  },
) {
  const pdfCgvFile = files.pdfCgv?.[0];
  const logoFile = files.logo?.[0];
  return this.profileService.update(id, body, pdfCgvFile, logoFile);
}

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.findOne(id);
  }

  @Get('user/:userId')
  async getProfilesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.profileService.findProfilesByUser(userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.remove(id);
  }
}
