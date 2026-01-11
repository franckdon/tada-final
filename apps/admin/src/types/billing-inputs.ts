export interface BillingInputs {
  organizationId: string;
  credits: number;
  street?: string;
  city?: string;
  zip?: string;
  country: string;
  company: string;
  civility: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}
