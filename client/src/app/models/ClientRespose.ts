export interface ClientResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  devisCount?: number;  // <-- add this to store count of devis
}