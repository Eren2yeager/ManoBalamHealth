export interface GetCrisisResourcesQuery {
  jurisdiction?: string;
}

export interface CrisisResourceResponse {
  id: string;
  name: string;
  description: string;
  phone: string;
  website?: string;
}
