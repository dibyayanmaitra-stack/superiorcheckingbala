export enum ValidationStatus {
  Eligible = 'Eligible',
  Ineligible = 'Ineligible',
}

export interface BeneficiaryRecord {
  id: string;
  serialNumber: string;
  // Location
  blockName: string;
  gpName: string;
  village: string;
  latitude?: number;
  longitude?: number;
  // Beneficiary Info
  beneficiaryId: string;
  beneficiaryName: string;
  // Verification
  status: ValidationStatus;
  remarks: string; // Only required if Ineligible
  // Superior Info
  superiorName: string;
  superiorDesignation: string;
  superiorIdSrh: string;
  // Attachments
  imageUrl?: string;
  timestamp: number;
}

export interface Stats {
  total: number;
  eligible: number;
  ineligible: number;
}