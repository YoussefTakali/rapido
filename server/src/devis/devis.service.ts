import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';
import { Devis } from '@prisma/client';

@Injectable()
export class DevisService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateDevisDto) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new NotFoundException('User not found');

  const profile = await this.prisma.profile.findUnique({ where: { id: dto.profileId } });
  if (!profile) throw new NotFoundException('Profile not found');

  const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
  if (!client) throw new NotFoundException('Client not found');
  return this.prisma.devis.create({
    data: { 
      ...dto,
      options: dto.options ? { set: dto.options } : undefined,
    },
    include: {
      user: true,
      profile: true,
      client: true,
    },
  });
}

  async findAll(): Promise<Devis[]> {
    return this.prisma.devis.findMany({
      include: {
        user: true,
        profile: true,
        client: true,
      },
    });
  }
async findDevisByUser(userId: number): Promise<Devis[]> {
  return this.prisma.devis.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
      profile: true,
      client: true,
    },
  });
}
async findDevisByClient(clientId: number): Promise<Devis[]> {
  return this.prisma.devis.findMany({
    where: {
      clientId: clientId,
    },
    include: {
      user: true,
      profile: true,
    },
  });
}
  async findOne(id: number): Promise<Devis> {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: {
        user: true,
        profile: true,
        client: true,
      },
    });

    if (!devis) throw new NotFoundException('Devis not found');
    return devis;
  }

async update(id: number, dto: UpdateDevisDto) {
  await this.findOne(id);

  return this.prisma.devis.update({
    where: { id },
    data: {
      ...dto,
      options: dto.options ? { set: dto.options } : undefined,
    },
    include: {
      user: true,
      profile: true,
      client: true,
    },
  });
}


  async remove(id: number): Promise<Devis> {
    await this.findOne(id); // ensure it exists

    return this.prisma.devis.delete({
      where: { id },
    });
  }
}
