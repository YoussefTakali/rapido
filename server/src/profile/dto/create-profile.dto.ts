import { IsString, IsOptional, IsNumber, IsDecimal, IsEmail } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  companyName: string;

  @IsString()
  formeJuridique: string;

  @IsNumber()
  capitalSocial: number;

  @IsString()
  siret: string;

  @IsString()
  tva: string;

  @IsString()
  rcsOuRm: string;

  @IsString()
  adresse: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  nomAssurance: string;

  @IsNumber()
  montantMobilier: number;

  @IsNumber()
  montantMaxParObjet: number;

  @IsNumber()
  franchise: number;

  @IsNumber()
  pourcentageAcompte: number;

  @IsString()
  bic: string;

  @IsString()
  iban: string;

  @IsOptional()
  @IsString()
  pdfCgv?: string;
}
