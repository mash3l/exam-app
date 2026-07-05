"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { updateQuestionBodySchema } from "@/features/exams/schemas/question.schema";
import { useUpdateQuestion } from "@/features/admin/hooks/useAdminMutations";
import { clientApiUrl } from "@/lib/client-api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

const editQuestionFormSchema = updateQuestionBodySchema.extend({
  text: z.string().min(1, "Question text cannot be empty"),
  answers: z
    .array(
      z.object({
        text: z.string().min(1, "Answer text cannot be empty"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 answers are required"),
});

type EditQuestionFormValues = z.infer<typeof editQuestionFormSchema>;

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const examId = params.id as string;
  const questionId = params.questionId as string;
  const updateQuestion = useUpdateQuestion(questionId, examId);

  const form = useForm<EditQuestionFormValues>({
    resolver: zodResolver(editQuestionFormSchema),
    defaultValues: {
      text: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadQuestion() {
      const res = await fetch(clientApiUrl(`/api/questions/${questionId}`));
      if (!res.ok) {
        toast.error("Failed to load question");
        return;
      }
      const data = await res.json();
      const question = data.payload?.question || data.payload || data;
      const answers = (question.answers || question.options || []).map(
        (answer: { text?: string; title?: string; isCorrect?: boolean }, index: number) => ({
          text: answer.text || answer.title || "",
          isCorrect: Boolean(answer.isCorrect ?? index === 0),
        })
      );

      form.reset({
        text: question.text || question.title || question.questionText || "",
        answers: answers.length >= 2 ? answers : form.getValues("answers"),
      });
    }

    void loadQuestion();
  }, [status, questionId, form]);

  function markCorrect(index: number) {
    const current = form.getValues("answers");
    form.setValue(
      "answers",
      current.map((answer, i) => ({ ...answer, isCorrect: i === index }))
    );
  }

  async function onSubmit(values: EditQuestionFormValues) {
    try {
      await updateQuestion.mutateAsync(values);
      toast.success("Question updated successfully");
      router.push(`/admin/exams/${examId}/questions/${questionId}`);
    } catch {
      toast.error("Failed to update question");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
        <div className="text-[13px] font-mono tracking-wide flex items-center gap-2">
          <Link href={`/admin/exams/${examId}`} className="text-gray-400 hover:text-gray-600">
            Exam
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#175FFF] font-bold">Edit Question</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-none font-mono">
            <X size={16} className="mr-2" /> Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateQuestion.isPending}
            className="rounded-none bg-[#00C853] hover:bg-[#00A844] text-white font-mono"
          >
            {updateQuestion.isPending ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save size={16} className="mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 p-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Answers</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`answers.${index}.text`}
                    render={({ field: answerField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...answerField} className="rounded-none" placeholder={`Answer ${index + 1}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" onClick={() => markCorrect(index)} className="rounded-none text-xs">
                    {form.watch(`answers.${index}.isCorrect`) ? "Correct" : "Mark correct"}
                  </Button>
                  {fields.length > 2 ? (
                    <Button type="button" variant="ghost" onClick={() => remove(index)} className="rounded-none">
                      Remove
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ text: "", isCorrect: false })} className="rounded-none">
                Add answer
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
