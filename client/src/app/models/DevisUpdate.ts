
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
  prixDevis?: number; // optional, can be calculated later
  monteMeubleLivraison: boolean;
  options: OptionType[];
  etat: EtatDevis;
  distance: number; // Optional, can be used for calculations
}
export type DevisFormUpdate = Omit<
  DevisFormData,
  'userId' | 'profileId' | 'clientId' 
>;
export enum EtatDevis {
  BROUILLON = 'BROUILLON',
  ARCHIVE = 'ARCHIVE',
  GAGNE = 'GAGNE',
  PERDU = 'PERDU',
  ENVOYEE = 'ENVOYEE',
  EN_COURS = 'EN_COURS',
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
  APPARTEMENT = 'APPARTEMENT',
  MAISON = 'MAISON',
  STUDIO = 'STUDIO',
  DUPLEX = 'DUPLEX',
  BUREAU = 'BUREAU',
  GARDE_MEUBLE = 'GARDE_MEUBLE',
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
