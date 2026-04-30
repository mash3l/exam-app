import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.accessToken) {
    redirect("/diplomas");
  }
  redirect("/login");
  console.log("===> SESSION DATA: ", JSON.stringify(session, null, 2));
}