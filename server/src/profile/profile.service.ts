import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from 'generated/prisma';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProfileDto): Promise<Profile> {
    return this.prisma.profile.create({ data });
  }

  async findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      include: {
        userProfiles: true,
        devises: true,
      },
    });
  }
async findProfilesByUser(userId: number): Promise<Profile[]> {
  return this.prisma.profile.findMany({
    where: {
      userProfiles: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      userProfiles: true,
      devises: true,
    },
  });
}
  async findOne(id: number): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        userProfiles: true,
        devises: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return profile;
  }

  async update(id: number, data: UpdateProfileDto): Promise<Profile> {
    // Check if profile exists first
    await this.findOne(id);

    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Profile> {
    // Check if profile exists first
    await this.findOne(id);

    return this.prisma.profile.delete({
      where: { id },
    });
  }
}
