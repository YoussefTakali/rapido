import { Devis } from "./DevisResponse";
import { UserProfile } from "./User";

export interface ProfileDetails {
  id: number;
  name: string;
  phone: string;
  companyName: string;
  formeJuridique: string;
  capitalSocial: string;
  siret: string;
  tva: string;
  rcsOuRm: string;
  adresse: string;
  logo: string;
  nomAssurance: string;
  montantMobilier: string;
  montantMaxParObjet: string;
  franchise: string;
  pourcentageAcompte: string;
  bic: string;
  iban: string;
  pdfCgv: string;
  userProfiles: UserProfile[];
  devises: Devis[];
}
export interface ProfileSummary {
  id: number;
  name: string;
  devisCount: number;
  clientCount: number;
  userCount: number;
}