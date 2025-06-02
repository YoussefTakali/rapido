import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({ 
      data: createClientDto,
    });
  }

  findAll() {
    return this.prisma.client.findMany({
      include: {
        devis: true,
      },
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { devis: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }
async findClientsByUser(userId: number) {
  return this.prisma.client.findMany({
    where: {
      devis: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      devis: {
        select: {
          id: true,
        },
      },
    },
  }).then(clients =>
    clients.map(client => ({
      ...client,
      devisCount: client.devis.length,
      devis: undefined, // optionally remove full devis array
    }))
  );
}

  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.findOne(id); // Ensure client exists
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure client exists
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
