// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignProfilesDto } from './dto/assign.profiles.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already used');
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        userProfiles: true,
        devises: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userProfiles: true,
        devises: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto:UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
async assignProfilesToUser(assignProfiles: AssignProfilesDto): Promise<{ message: string }> {
  // First, optionally verify user exists
  const user = await this.prisma.user.findUnique({ where: { id: assignProfiles.userId } });
  if (!user) {
    throw new NotFoundException(`User with id ${assignProfiles.userId} not found`);
  }

  // Verify profiles exist
  const profiles = await this.prisma.profile.findMany({
    where: { id: { in: assignProfiles.profileIds } },
  });
  if (profiles.length !== assignProfiles.profileIds.length) {
    throw new NotFoundException(`One or more profiles not found`);
  }

  // Optional: delete old assignments
  await this.prisma.userProfile.deleteMany({
    where: { userId: assignProfiles.userId },
  });

  // Create new assignments
  const userProfilesData = assignProfiles.profileIds.map((profileId) => ({
    userId: assignProfiles.userId,
    profileId,
  }));

  await this.prisma.userProfile.createMany({
    data: userProfilesData,
    skipDuplicates: true,
  });

  // ✅ Return success message
  return { message: 'Profiles assigned successfully' };
}
}
