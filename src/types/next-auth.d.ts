export {};

import type { UserRole } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }

  interface User {
    accessToken?: string;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: UserRole;
  }
}
