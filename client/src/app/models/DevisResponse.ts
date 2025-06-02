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
  DEMONTAGE = "DEMONTAGE",
  REMONTAGE = "REMONTAGE",
  EMBALLAGE = "EMBALLAGE",
  DEBALLAGE = "DEBALLAGE",
  TRANSPORT = "TRANSPORT",
  GARDE_MEUBLE = "GARDE_MEUBLE",
  MANUTENTION = "MANUTENTION"
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
  SANS_ASCENSEUR = "SANS_ASCENSEUR",
  TYPE1 = "TYPE1",
  TYPE2 = "TYPE2",
  TYPE3 = "TYPE3",
  TYPE4 = "TYPE4",
  TYPE5 = "TYPE5"
}

export enum DistancePortageType {
  TYPE1 = "TYPE1",
  TYPE2 = "TYPE2",
  TYPE3 = "TYPE3",
  TYPE4 = "TYPE4",
  TYPE5 = "TYPE5",
  TYPE6 = "TYPE6",
  TYPE7 = "TYPE7",
  TYPE8 = "TYPE8",
  TYPE9 = "TYPE9",
  TYPE10 = "TYPE10",
  TYPE11 = "TYPE11"
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
  name: string;
  email: string;
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
}

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}
