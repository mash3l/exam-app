"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, X, AlertTriangle, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react"; // 1. استيراد السيشن وتسجيل الخروج
import {
  accountProfileFormSchema,
  requestEmailChangeBodySchema,
  confirmEmailChangeBodySchema,
} from "@/features/account/schemas/account.schema";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { toast } from "sonner";

type ProfileFormValues = z.infer<typeof accountProfileFormSchema>;
type RequestEmailValues = z.infer<typeof requestEmailChangeBodySchema>;
type ConfirmEmailValues = z.infer<typeof confirmEmailChangeBodySchema>;

const BASE_URL = "https://exam-app.elevate-bootcamp.cloud";

export default function ProfilePage() {
  const { data: session } = useSession(); // سحب بيانات الجلسة والتوكن
  const token = session?.accessToken;

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [readOnlyData, setReadOnlyData] = useState({ username: "", email: "" });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalStep, setEmailModalStep] = useState<1 | 2>(1);
  const [pendingNewEmail, setPendingNewEmail] = useState("");
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(accountProfileFormSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  const requestEmailForm = useForm<RequestEmailValues>({
    resolver: zodResolver(requestEmailChangeBodySchema),
    defaultValues: { newEmail: "" },
  });

  const confirmEmailForm = useForm<ConfirmEmailValues>({
    resolver: zodResolver(confirmEmailChangeBodySchema),
    defaultValues: { code: "" },
  });

  // 1. جلب بيانات اليوزر أول ما يفتح الصفحة
  useEffect(() => {
    // اتأكد إن التوكن موجود قبل ما نبعت
    if (!token) return;
    
    async function fetchProfile() {
      try {
        const res = await fetch("https://exam-app.elevate-bootcamp.cloud/api/users/profile", {
          method: "GET", // ضيفنا دي للتأكيد
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
        });

        const data = await res.json();

        if (res.ok && data.payload?.user) { 
          // سحبنا اليوزر من جوه الـ payload
          const userData = data.payload.user; 

          profileForm.reset({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phone: userData.phone || "",
          });
          
          setReadOnlyData({ 
            username: userData.username || "", 
            email: userData.email || "" 
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [token, profileForm]);
  // 2. تحديث الاسم ورقم التليفون
  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile saved successfully", { richColors: true });
    } catch (error) {
      toast.error("Something went wrong while saving.", { richColors: true });
    }
  }

  // 3. طلب تغيير الإيميل (إرسال الكود)
  async function onRequestEmailSubmit(values: RequestEmailValues) {
    try {
      const res = await fetch(`${BASE_URL}/api/users/email/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail: values.newEmail }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        requestEmailForm.setError("newEmail", { message: data?.message || "Failed to request email change" });
        return;
      }

      setPendingNewEmail(values.newEmail);
      setEmailModalStep(2);
      confirmEmailForm.reset({ code: "" });
    } catch (error) {
      toast.error("Network error occurred.");
    }
  }

  // 4. تأكيد تغيير الإيميل بالكود
  async function onConfirmEmailSubmit(values: ConfirmEmailValues) {
    try {
      const res = await fetch(`${BASE_URL}/api/users/email/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // غالباً الباك إند بيحتاج الكود وربما الإيميل الجديد، عدلها لو الباك إند طالب حاجة تانية
        body: JSON.stringify({ code: values.code, newEmail: pendingNewEmail }), 
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        confirmEmailForm.setError("code", { message: data?.message || "Invalid OTP" });
        return;
      }

      setIsEmailModalOpen(false);
      setReadOnlyData(prev => ({ ...prev, email: pendingNewEmail })); // نحدث الإيميل في الشاشة
      toast.success("Email changed successfully!", { richColors: true });
    } catch (error) {
      toast.error("Network error occurred.");
    }
  }

  // 5. حذف الحساب
  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete account");
      
      setIsDeleteAccountModalOpen(false);
      toast.error("Account deleted permanently", { richColors: true });
      // نطرده بره ونمسح السيشن
      signOut({ callbackUrl: "/login" });
    } catch (error) {
      toast.error("Could not delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  function openEmailModal() {
    setEmailModalStep(1);
    requestEmailForm.reset({ newEmail: "" });
    confirmEmailForm.reset({ code: "" });
    setIsEmailModalOpen(true);
  }

  if (isLoadingProfile) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-bold font-mono text-slate-800">First name</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-14 rounded-none border-gray-200 bg-white font-mono text-[14px] shadow-sm focus-visible:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-bold font-mono text-slate-800">Last name</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-14 rounded-none border-gray-200 bg-white font-mono text-[14px] shadow-sm focus-visible:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
          </div>

          <div className="space-y-3">
            <FormLabel className="text-[13px] font-bold font-mono text-slate-800">Username</FormLabel>
            <Input
              value={readOnlyData.username}
              readOnly
              disabled
              className="h-14 cursor-not-allowed rounded-none border-gray-200 bg-[#F8F9FA] font-mono text-[14px] text-gray-500 shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-[13px] font-bold font-mono text-slate-800">Email</FormLabel>
              <button
                type="button"
                onClick={openEmailModal}
                className="flex cursor-pointer items-center gap-1.5 font-mono text-[13px] font-bold text-[#175FFF] hover:underline"
              >
                <Edit2 size={14} strokeWidth={2.5} /> Change
              </button>
            </div>
            <Input
              value={readOnlyData.email}
              readOnly
              disabled
              className="h-14 cursor-not-allowed rounded-none border-gray-200 bg-[#F8F9FA] font-mono text-[14px] text-gray-500 shadow-sm"
            />
          </div>

          <FormField control={profileForm.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold font-mono text-slate-800">Phone</FormLabel>
                <div className="flex shadow-sm">
                  <div className="flex h-14 items-center justify-center border border-r-0 border-gray-200 bg-white px-5 font-mono text-[13px] font-bold text-slate-800">
                    🇪🇬 EG(+20) <span className="ml-3 text-[11px] text-gray-400">↕</span>
                  </div>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="h-14 rounded-none border-gray-200 bg-white font-mono text-[14px] focus-visible:ring-blue-500" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />

          <div className="flex gap-6 pt-8">
            <button
              type="button"
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="h-14 flex-1 cursor-pointer rounded-none bg-[#FEF3F2] font-mono text-[14px] font-bold text-[#F04438] shadow-sm transition-colors hover:bg-red-50"
            >
              Delete My Account
            </button>
            <Button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="h-14 flex-1 rounded-none bg-[#175FFF] font-mono text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 flex justify-center items-center"
            >
              {profileForm.formState.isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      {/* مودال الإيميل (مفيش تغيير في تصميمه، اتعدل اللوجيك بس) */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-[500px] animate-in zoom-in-95 border border-gray-100 bg-white p-8 shadow-xl duration-200">
            <button type="button" onClick={() => setIsEmailModalOpen(false)} className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-gray-700"><X size={20} /></button>
            <h2 className="mb-6 font-mono text-2xl font-bold tracking-tight text-slate-900">Change Email</h2>
            {emailModalStep === 1 ? (
              <Form {...requestEmailForm}>
                <form onSubmit={requestEmailForm.handleSubmit(onRequestEmailSubmit)} className="space-y-6">
                  <p className="font-mono text-[14px] font-bold text-[#175FFF]">Enter your new email</p>
                  <FormField control={requestEmailForm.control} name="newEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[12px] font-bold text-slate-700">Email</FormLabel>
                        <FormControl><Input {...field} placeholder="user@example.com" className="h-12 rounded-none border-gray-200 font-mono text-[13px] focus-visible:ring-blue-500" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <Button type="submit" disabled={requestEmailForm.formState.isSubmitting} className="mt-4 flex h-12 w-full items-center justify-center rounded-none bg-[#175FFF] font-mono font-bold uppercase text-white hover:bg-blue-700">
                    {requestEmailForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Next >"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...confirmEmailForm}>
                <form onSubmit={confirmEmailForm.handleSubmit(onConfirmEmailSubmit)} className="space-y-6">
                  <p className="font-mono text-[14px] font-bold text-[#175FFF]">Verify OTP</p>
                  <p className="max-w-[300px] font-mono text-[12px] leading-relaxed text-gray-500">
                    Please enter the 6-digit code we have sent to: <span className="mt-1 block font-bold text-slate-800">{pendingNewEmail}. <button type="button" className="cursor-pointer font-bold text-[#175FFF] hover:underline" onClick={() => setEmailModalStep(1)}>Edit</button></span>
                  </p>
                  <FormField control={confirmEmailForm.control} name="code" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} className="h-12 rounded-none border-gray-200 text-center font-mono text-lg font-bold tracking-[0.5em] focus-visible:ring-blue-500" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <Button type="submit" disabled={confirmEmailForm.formState.isSubmitting} className="mt-2 flex h-12 w-full items-center justify-center rounded-none bg-[#175FFF] font-mono font-bold uppercase text-white hover:bg-blue-700">
                    {confirmEmailForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Verify Code"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      )}

      {/* مودال حذف الحساب (مفيش تغيير في تصميمه، اتعدل اللوجيك بس) */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex w-[500px] flex-col items-center gap-4 border border-red-100 bg-white p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setIsDeleteAccountModalOpen(false)} className="absolute right-4 top-4 cursor-pointer text-gray-400 transition-colors hover:text-red-500"><X size={20} /></button>
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-[#F04438]" strokeWidth={2} />
            </div>
            <h2 className="mt-2 font-mono text-[17px] font-bold tracking-tight text-[#F04438]">Are you sure you want to delete your account?</h2>
            <p className="mb-4 font-mono text-[12px] leading-relaxed text-slate-500">This action is permanent and cannot be undone.</p>
            <div className="mt-2 flex w-full gap-4">
              <button type="button" onClick={() => setIsDeleteAccountModalOpen(false)} className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-none bg-gray-100 font-mono text-[13px] font-bold text-slate-700 transition-colors hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-none bg-[#F04438] font-mono text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-red-700">
                {isDeleting ? <Loader2 className="animate-spin" /> : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}