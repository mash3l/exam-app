export type UserRole = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

export type AppSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
};

export type AppSession = {
  user?: AppSessionUser;
  accessToken?: string;
};
