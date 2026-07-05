import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

function resolvePostLoginPath(role: unknown) {
  const normalizedRole = String(role ?? "").toUpperCase();
  return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN"
    ? "/admin/diplomas"
    : "/diplomas";
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: unknown } | undefined)?.role;

  if (session?.user) {
    redirect(resolvePostLoginPath(userRole));
  }

  redirect("/login");
}