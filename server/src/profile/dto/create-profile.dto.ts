import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  companyName: string;

  @IsEmail()
  companyEmail: string;
  @IsString()
  companyPhone: string;
  @IsString()
  formeJuridique: string;

  @IsNumber()
  @Type(() => Number)
  capitalSocial: number;

  @IsString()
  siret: string;

  @IsString()
  tva: string;

  @IsString()
  rcsOuRm: string;

  @IsString()
  adresse: string;

  @IsString()
  nomAssurance: string;

  @IsNumber()
  @Type(() => Number)
  montantMobilier: number;

  @IsNumber()
  @Type(() => Number)
  montantMaxParObjet: number;

  @IsNumber()
  @Type(() => Number)
  franchise: number;

  @IsNumber()
  @Type(() => Number)
  pourcentageAcompte: number;

  @IsString()
  bic: string;

  @IsString()
  iban: string;
}
