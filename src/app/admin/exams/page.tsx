import AdminExamTable from "@/features/admin/components/AdminExamTable";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { AppSession } from "@/types/auth";
import type { Exam } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ diploma?: string }>;
}) {
  const { diploma } = await searchParams;
  const session = await getServerSession(authOptions);
  const token = (session as AppSession | null)?.accessToken;

  let exams: Exam[] = [];

  try {
    const url = diploma
      ? `${BASE_URL}/api/exams?diploma=${diploma}`
      : `${BASE_URL}/api/exams`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const responseData = await res.json();
      exams = responseData.payload?.exams || responseData.payload?.data || responseData.payload || [];
    }
  } catch {
    exams = [];
  }

  return (
    <div className="w-full">
      <AdminExamTable exams={Array.isArray(exams) ? exams : []}>
        {/* الزرار الأخضر الموحد للامتحانات */}
        <Link href="/admin/exams/create">
          <Button
            variant="adminCta"
            size="admin-cta"
            className="font-mono rounded-[4px] shadow-none transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Exam
          </Button>
        </Link>
      </AdminExamTable>
    </div>
  );
}