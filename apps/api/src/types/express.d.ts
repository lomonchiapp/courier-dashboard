import type { AuthContext } from "@/common/guards/combined-auth.guard";

export interface CustomerAuthContext {
  customerId: string;
  tenantId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      customerAuth?: CustomerAuthContext;
    }
  }
}

export {};
