
export interface DevisFormData {
  userId: number;
  profileId: number;
  clientId: number;
  volume: number;
  adresseDepart: string;
  typeLogementDepart: TypeLogement;  // not string
  etageDepart: number;
  ascenseurDepart: AscenseurType;    // not string
  distancePortageDepart: DistancePortageType; // not string
  dateDepart: string; // dates can remain string here but see point 1 and 2 above
  monteMeubleDepart: boolean;
  adresseLivraison: string;
  typeLogementLivraison: TypeLogement;
  etageLivraison: number;
  ascenseurLivraison: AscenseurType;
  distancePortageLivraison: DistancePortageType;
  dateLivraison: string;
  monteMeubleLivraison: boolean;
  options: OptionType[];
  etat: EtatDevis;
}
export enum EtatDevis {
  BROUILLON = 'BROUILLON',
  ARCHIVE = 'ARCHIVE',
  GAGNE = 'GAGNE',
  PERDU = 'PERDU',
  ENVOYEE = 'ENVOYEE',
  EN_COURS = 'EN_COURS',
}

export enum OptionType {
  DEMONTAGE = 'DEMONTAGE',
  REMONTAGE = 'REMONTAGE',
  EMBALLAGE = 'EMBALLAGE',
  DEBALLAGE = 'DEBALLAGE',
  TRANSPORT = 'TRANSPORT',
  GARDE_MEUBLE = 'GARDE_MEUBLE',
  MANUTENTION = 'MANUTENTION',
}

export enum TypeLogement {
  APPARTEMENT = 'APPARTEMENT',
  MAISON = 'MAISON',
  STUDIO = 'STUDIO',
  DUPLEX = 'DUPLEX',
  BUREAU = 'BUREAU',
  GARDE_MEUBLE = 'GARDE_MEUBLE',
}

export enum AscenseurType {
  SANS_ASCENSEUR = 'SANS_ASCENSEUR',
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  TYPE3 = 'TYPE3',
  TYPE4 = 'TYPE4',
  TYPE5 = 'TYPE5',
}

export enum DistancePortageType {
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  TYPE3 = 'TYPE3',
  TYPE4 = 'TYPE4',
  TYPE5 = 'TYPE5',
  TYPE6 = 'TYPE6',
  TYPE7 = 'TYPE7',
  TYPE8 = 'TYPE8',
  TYPE9 = 'TYPE9',
  TYPE10 = 'TYPE10',
  TYPE11 = 'TYPE11',
}
