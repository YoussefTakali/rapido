import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

 async create(
    data: CreateProfileDto,
    pdfCgvFile?: Express.Multer.File,
    logoFile?: Express.Multer.File,
  ): Promise<Profile> {
    const profileData: any = { ...data };

    if (pdfCgvFile) {
      profileData.pdfCgv = pdfCgvFile.filename; // or file.path if stored fully
    }

    if (logoFile) {
      profileData.logo = logoFile.filename;
    }

    return this.prisma.profile.create({ data: profileData });
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

async update(
    id: number,
    data: UpdateProfileDto,
    pdfCgvFile?: Express.Multer.File,
    logoFile?: Express.Multer.File,
  ): Promise<Profile> {
    await this.findOne(id);

 const updateData: any = {
  ...data,
  capitalSocial: Number(data.capitalSocial),
  montantMobilier: Number(data.montantMobilier),
  montantMaxParObjet: Number(data.montantMaxParObjet),
  franchise: Number(data.franchise),
  pourcentageAcompte: Number(data.pourcentageAcompte),
  companyName: data.companyName,
  companyEmail: data.companyEmail,
  companyPhone: data.companyPhone,
  formeJuridique: data.formeJuridique,
  siret: data.siret,
  tva: data.tva,
  rcsOuRm: data.rcsOuRm,
  adresse: data.adresse,
  nomAssurance: data.nomAssurance,
  bic: data.bic,
  iban: data.iban,
};
    if (pdfCgvFile) {
      updateData.pdfCgv = pdfCgvFile.filename;
    }

    if (logoFile) {
      updateData.logo = logoFile.filename;
    }

    return this.prisma.profile.update({
      where: { id },
      data: updateData,
    }); 
  }

async remove(id: number) {
  // Check if profile exists (optional)
  await this.findOne(id);

  // Delete related Devis first
  await this.prisma.devis.deleteMany({
    where: { profileId: id }
  });

  // Now delete the profile
  return this.prisma.profile.delete({
    where: { id }
  });
}

} 