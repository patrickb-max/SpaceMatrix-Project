// place files you want to import through the `$lib` alias in this folder.
export const SERVICES = {
  PROPERTY: 'http://127.0.0.1:3001/api/v1/properties',
  INQUIRY: 'http://127.0.0.1:3002/api/v1/inquiries',
  ANALYTICS: 'http://127.0.0.1:3003/api/v1/analytics',
  NOTIFICATION: 'http://127.0.0.1:3004/api/v1/notifications'
} as const;

export interface Property {
  _id?: string;
  name: string;
  description: string;
  propertyType: 'office' | 'warehouse' | 'retail';
  totalArea: number;
  rentPerSqFt: number;
  totalMonthlyRent: number;
  images?: string[];
  imageUrl?: string;
}

export interface InquiryPayload {
  propertyId: string | null;
  propertyName: string;
  inquirerName: string;
  inquirerEmail: string;
  phone: string;
  message: string;
}