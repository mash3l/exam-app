import AdminDiplomaTable from "@/features/admin/components/AdminDiplomaTable";

export default function AdminDiplomasPage() {
  return (
    // أضفنا pb-20 عشان نضمن إن السايد بار مياكلش آخر الجدول
    <div className="w-full pt-4 px-4 md:px-8 pb-20 overflow-hidden">
      <AdminDiplomaTable />
    </div>
  );
}