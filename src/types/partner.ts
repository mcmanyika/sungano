export interface PartnerProfile {
  id: string;
  organisation: string;
  name: string;
  email: string;
  createdAt: Date | null;
}

export interface PartnerProfileInput {
  organisation: string;
  name: string;
  email: string;
}
