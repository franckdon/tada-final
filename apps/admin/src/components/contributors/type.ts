export interface Contributor {
  id: string;
  name: string;
  email: string;
  role: string;
  kyc_status: string | null;
  image: string | null;
  location: string | null;
  job?: string | null;
  banned?: boolean | null;
}
