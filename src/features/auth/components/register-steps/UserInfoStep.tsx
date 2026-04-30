"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUserInfoStepSchema } from "@/features/auth/schemas/auth.schema";
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

export type UserInfoValues = z.infer<typeof registerUserInfoStepSchema>;

interface Props {
  onNext: (values: UserInfoValues) => void | Promise<void>;
}

export function UserInfoStep({ onNext }: Props) {
  const form = useForm<UserInfoValues>({
    resolver: zodResolver(registerUserInfoStepSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onNext(values);
        })}
        className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Tell us more about you</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="firstName">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input {...field} id="firstName" placeholder="Ahmed" className="h-11 rounded-none border-gray-200 focus-visible:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="lastName">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input {...field} id="lastName" placeholder="Ashraf" className="h-11 rounded-none border-gray-200 focus-visible:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="usernameReg">
                Username
              </FormLabel>
              <FormControl>
                <Input {...field} id="usernameReg" placeholder="ahmed_ashraf" className="h-11 rounded-none border-gray-200 focus-visible:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="phone">
                Phone
              </FormLabel>
              <div className="flex">
                <div className="flex h-11 items-center justify-center border border-r-0 border-gray-200 bg-gray-50 px-3 text-[13px] font-medium text-gray-600">
                  🇪🇬 +20
                </div>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} id="phone" placeholder="1012345678" className="h-11 rounded-none border-gray-200 focus-visible:ring-blue-500" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-4 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700">
          Next
        </Button>
      </form>
    </Form>
  );
}
