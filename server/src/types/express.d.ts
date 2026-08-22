import type { UserRole } from "../middleware/auth.middleware.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: UserRole;
      };
    }
  }
}

export {};