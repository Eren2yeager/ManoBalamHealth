import { Role } from "@/constants/roles.constant";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
      validatedData?: {
        body?: any;
        query?: any;
        params?: any;
      };
      rawBody?: string;
    }
  }
}
