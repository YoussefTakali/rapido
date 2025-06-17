// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignProfilesDto } from './dto/assign.profiles.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
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

async update(id: number, updateData: Partial<UpdateUserDto>) {
  // Get current user to check for old profile picture and email uniqueness
  const currentUser = await this.prisma.user.findUnique({ where: { id } });
  if (!currentUser) throw new NotFoundException('User not found');

  // Check if email is being changed to one that already exists
  if (updateData.email && updateData.email !== currentUser.email) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: updateData.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use by another user');
    }
  }

  // Delete old picture if it exists and isn't the default
  if (updateData.profilePicture && 
      currentUser.profilePicture && 
      currentUser.profilePicture !== 'defaultpp.jpg') {
    try {
      fs.unlinkSync(`./uploads/profile-pictures/${currentUser.profilePicture}`);
    } catch (err) {
      console.error('Failed to delete old profile picture', err);
    }
  }

  // Update allowed fields
  return this.prisma.user.update({
    where: { id },
    data: {
      name: updateData.name,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
      dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
      profilePicture: updateData.profilePicture || currentUser.profilePicture
    }
  });
}

async remove(id: number) {
  // Step 1: Delete related records
  await this.prisma.userProfile.deleteMany({
    where: { userId: id },
  });

  await this.prisma.notification.deleteMany({
    where: {
      OR: [
        { userId: id },
        { addedId: id }
      ]
    },
  });

  await this.prisma.calendarEvent.deleteMany({
    where: { userId: id },
  });

  await this.prisma.devis.deleteMany({
    where: { userId: id },
  });

  // Step 2: Now delete the user
  return this.prisma.user.delete({
    where: { id },
  });
}
  async updateProfilePicture(userId: number, filename: string) {
    // First get the user to check current picture
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old picture if it exists and isn't the default
    if (user.profilePicture && user.profilePicture !== 'defaultpp.jpg') {
      try {
        fs.unlinkSync(`./uploads/profile-pictures/${user.profilePicture}`);
      } catch (err) {
        console.error('Failed to delete old profile picture', err);
      }
    }

    // Update with new filename
    return this.prisma.user.update({
      where: { id: userId },
      data: { profilePicture: filename },
    });
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
const assignedProfiles = await this.prisma.userProfile.findMany({ where: { userId: assignProfiles.userId } });
console.log(assignedProfiles);
  return { message: 'Profiles assigned successfully' };
}
}
