import { 
  IsInt, IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsDate, IsNumber 
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { AscenseurType, DistancePortageType, EtatDevis, OptionType, TypeLogement } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDevisDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  distance?: number;
  @IsNumber()
  userId: number;

  @IsNumber()
  profileId: number;

  @IsNumber()
  clientId: number;

  @IsNumber()
  volume: number;

  @IsString()
  adresseDepart: string;

  @IsEnum(TypeLogement)
  typeLogementDepart: TypeLogement;

  @IsInt()
  etageDepart: number;

  @IsEnum(AscenseurType)
  ascenseurDepart: AscenseurType;

  @IsEnum(DistancePortageType)
  distancePortageDepart: DistancePortageType;

  @Type(() => Date)
  @IsDate()
  dateDepart: Date;

  @IsBoolean()
  monteMeubleDepart: boolean;

  @IsString()
  adresseLivraison: string;

  @IsEnum(TypeLogement)
  typeLogementLivraison: TypeLogement;

  @IsInt()
  etageLivraison: number;

  @IsEnum(AscenseurType)
  ascenseurLivraison: AscenseurType;

  @IsEnum(DistancePortageType)
  distancePortageLivraison: DistancePortageType;

  @Type(() => Date)
  @IsDate()
  dateLivraison: Date;

  @IsBoolean()
  monteMeubleLivraison: boolean;

  @IsOptional()
  @IsEnum(OptionType, { each: true })
  options?: OptionType[];

  @IsEnum(EtatDevis)
  etat: EtatDevis;
    @IsOptional()
  @IsNumber()
  prixDevis?: number;
}
