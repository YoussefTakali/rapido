export class SendDevisDto {
  client_name: string;
  client_email: string;
  devis_number: string;
  dem_date: string;
  company_name: string;
  company_email: string;
  total_ttc?: number;
  total_M?: number;
  is_payment?: boolean;
  pdf1Content: Buffer; // Generated devis PDF
  pdf2Content: Buffer; // CGV PDF
  pdf3Content?: Buffer; // Optional furniture list PDF
}