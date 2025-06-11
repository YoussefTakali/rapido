export interface Devis {
  id: number;
  date: string; // ISO string date
  volume: number;

  adresseDepart: string;
  typeLogementDepart: TypeLogement;
  etageDepart: number;
  ascenseurDepart: AscenseurType;
  distancePortageDepart: DistancePortageType;
  dateDepart: string;  // ISO string
  monteMeubleDepart: boolean;

  adresseLivraison: string;
  typeLogementLivraison: TypeLogement;
  etageLivraison: number;
  ascenseurLivraison: AscenseurType;
  distancePortageLivraison: DistancePortageType;
  dateLivraison: string;  // ISO string
  monteMeubleLivraison: boolean;

  prixDevis: number;  // Use number for Decimal
  options: OptionType[];
  etat: EtatDevis;
  distance: number; // Optional, can be used for calculations

  userId: number;
  profileId: number;
  clientId: number;

  // Optional relations
  user?: User;
  profile?: Profile;
  client?: Client;
}

// Enum Types (copy from your Prisma enums)
export enum EtatDevis {
  BROUILLON = "BROUILLON",
  ARCHIVE = "ARCHIVE",
  GAGNE = "GAGNE",
  PERDU = "PERDU",
  ENVOYEE = "ENVOYEE",
  EN_COURS = "EN_COURS"
}

export enum OptionType {
  PACK_CARTONS = 'PACK_CARTONS',
  REPORT_DE_DATE = 'REPORT_DE_DATE',
  FLEXIBILITE_SUR_DATE = 'FLEXIBILITE_SUR_DATE',
  DEBALLAGE_ET_REMONTAGE = 'DEBALLAGE_ET_REMONTAGE',
  EMBALLAGE_FRAGILE = 'EMBALLAGE_FRAGILE',
  EMBALLAGE_CARTONS = 'EMBALLAGE_CARTONS',
  AUTORISATION_STATIONNEMENT = 'AUTORISATION_STATIONNEMENT',
  TRANSPORT_DES_VETEMENTS = 'TRANSPORT_DES_VETEMENTS',
}

export enum TypeLogement {
  APPARTEMENT = "APPARTEMENT",
  MAISON = "MAISON",
  STUDIO = "STUDIO",
  DUPLEX = "DUPLEX",
  BUREAU = "BUREAU",
  GARDE_MEUBLE = "GARDE_MEUBLE"
}

export enum AscenseurType {
  SANS_ASCENSEUR = 'SANS_ASCENSEUR',
  PERSONNES_1_2 = 'PERSONNES_1_2',
  PERSONNES_3_4 = 'PERSONNES_3_4',
  PERSONNES_5_6 = 'PERSONNES_5_6',
  PERSONNES_7_8 = 'PERSONNES_7_8',
  TOUT_RENTRE = 'TOUT_RENTRE'
}

export enum DistancePortageType {
  M_0_10 = 'M_0_10',
  M_11_20 = 'M_11_20',
  M_21_30 = 'M_21_30',
  M_31_40 = 'M_31_40',
  M_41_50 = 'M_41_50',
  M_51_60 = 'M_51_60',
  M_61_70 = 'M_61_70',
  M_71_80 = 'M_71_80',
  M_81_90 = 'M_81_90',
  M_91_100 = 'M_91_100',
  MORE_100 = 'MORE_100'
}

// Example related interfaces (simplified, add full fields as needed)
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: 'EMPLOYEE' | 'ADMIN';
  createdAt: string;
  profilePicture: string;
}

export interface Profile {
  id: number;
  companyEmail: string;
  companyPhone: string;
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
}

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}
