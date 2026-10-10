export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  website?: string;
}

// For backward compatibility with assessment results
export interface CrisisResourceItem {
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}