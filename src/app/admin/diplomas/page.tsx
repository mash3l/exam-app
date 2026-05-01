import AdminDiplomaTable from "@/features/admin/components/AdminDiplomaTable";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { AppSession } from "@/types/auth";
import type { Diploma } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default async function AdminDiplomasPage() {
  const session = await getServerSession(authOptions);
  const token = (session as AppSession | null)?.accessToken;

  let diplomas: Diploma[] = [];

  try {
    const res = await fetch(`${BASE_URL}/api/diplomas`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const responseData = await res.json();
      // استخراج الداتا حسب الـ Payload بتاع السيرفر
      diplomas = responseData.payload?.data || responseData.data || responseData.payload || [];
    }
  } catch {
    diplomas = [];
  }

  return (
    <div className="w-full pt-4 px-4 md:px-8 pb-20">
      <AdminDiplomaTable diplomas={Array.isArray(diplomas) ? diplomas : []}>
        {/* الزرار الأخضر الموحد للدبلومات */}
        <Link href="/admin/diplomas/create">
          <Button
            variant="adminCta"
            size="admin-cta"
            className="font-mono rounded-[4px] shadow-none transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Diploma
          </Button>
        </Link>
      </AdminDiplomaTable>
    </div>
  );
}