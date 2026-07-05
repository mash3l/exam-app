"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { X, Save, Image as ImageIcon, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { useCreateDiploma, useUpdateDiploma } from "@/features/admin/hooks/useAdminMutations";
import { clientApiUrl } from "@/lib/client-api";
import type { Diploma } from "@/types/models";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

const diplomaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional(),
});

type DiplomaFormValues = z.infer<typeof diplomaFormSchema>;

interface CreateDiplomaFormProps {
  initialData?: Diploma | null;
  isEditMode?: boolean;
}

export default function CreateDiplomaForm({ initialData, isEditMode = false }: CreateDiplomaFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createDiploma = useCreateDiploma();
  const updateDiploma = useUpdateDiploma();

  const form = useForm<DiplomaFormValues>({
    resolver: zodResolver(diplomaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        image: initialData.image || "",
      });
    }
  }, [isEditMode, initialData, form]);

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);
    const uploadRes = await fetch(clientApiUrl("/api/upload"), {
      method: "POST",
      body: formData,
    });
    if (!uploadRes.ok) return null;
    const uploadData = await uploadRes.json();
    return uploadData.url || uploadData.payload?.url || uploadData.payload || "";
  }

  async function onSubmit(values: DiplomaFormValues) {
    try {
      let finalImageUrl = values.image || initialData?.image || "";
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const uploaded = await uploadImage(file);
        if (!uploaded) {
          toast.error("Failed to upload image.");
          return;
        }
        finalImageUrl = uploaded;
      }

      if (!isEditMode && !finalImageUrl) {
        toast.error("Please upload an image for the diploma");
        return;
      }

      const payload = {
        title: values.title,
        description: values.description,
        image: finalImageUrl,
      };

      if (isEditMode) {
        const id = initialData?._id || initialData?.id;
        if (!id) throw new Error("Missing diploma id");
        await updateDiploma.mutateAsync({ id, body: payload });
        toast.success("Diploma updated successfully!");
      } else {
        await createDiploma.mutateAsync(payload);
        toast.success("Diploma created successfully!");
      }

      router.push("/admin/diplomas");
      router.refresh();
    } catch {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} diploma`);
    }
  }

  const isSaving = createDiploma.isPending || updateDiploma.isPending;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-20 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-[12px] sm:text-[13px] font-mono tracking-wide flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/admin/diplomas" className="text-gray-400 hover:text-gray-600 transition-colors">
            Diplomas
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#175FFF] font-bold">
            {isEditMode ? "Edit Diploma" : "Add New Diploma"}
          </span>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/diplomas")}
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#F1F5F9] border-transparent text-slate-600 hover:bg-[#E2E8F0] font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors cursor-pointer"
          >
            <X size={16} className="mr-2" strokeWidth={2.5} /> Cancel
          </Button>

          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#00C853] hover:bg-[#00A844] text-white font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors cursor-pointer disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" strokeWidth={2.5} />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-gray-200 shadow-sm w-full">
            <div className="bg-[#175FFF] px-6 py-3 border-b border-[#175FFF]">
              <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">Diploma Information</h2>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl">
              <div>
                <label className="block text-[13px] font-mono font-bold text-slate-700 mb-3">Image</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-gray-200 p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  {form.watch("image") ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ImageIcon size={24} />
                        <span className="text-[12px] font-mono text-slate-600 font-bold">Image selected</span>
                      </div>
                      <span className="text-[12px] font-mono text-blue-500 hover:underline">Change image</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 flex items-center justify-center border border-gray-100 bg-gray-50 text-gray-300 group-hover:text-gray-400 transition-colors">
                        <ImageIcon size={24} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <CloudUpload size={20} className="text-gray-400 mb-2" strokeWidth={1.5} />
                        <p className="text-[12px] font-mono text-gray-500">
                          Drop an image here or <span className="text-[#175FFF]">select from your computer</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-mono font-bold text-slate-700">Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter diploma title" className="rounded-none border-gray-200 font-mono text-[13px] h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500 w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-mono font-bold text-slate-700">Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter diploma description"
                        className="w-full border border-gray-200 p-4 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[160px] resize-y placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
