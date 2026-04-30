import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { resolveNextAuthSecret } from "@/lib/auth-secret";
import { attemptExternalLogin } from "@/lib/external-auth-login";

const nextAuthSecret = resolveNextAuthSecret();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
          const token = process.env.NEXT_PUBLIC_DEV_API_TOKEN?.trim();
          if (token) {
            return {
              id: "skip-auth",
              email: "dev@elevate.local",
              accessToken: token,
              role: "ADMIN", 
            };
          }
        }

        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const result = await attemptExternalLogin({ identifier: email, password });

        if (!result.ok) {
          throw new Error(result.message);
        }

        // 🔥 الإجبار المطلق: أي حد بيعمل لوجن دلوقتي بياخد رتبة ADMIN فوراً
        // عشان تخلص شغلك وتقفل صفحات لوحة التحكم براحتك
        // بنخليها طالب كافتراضي const apiData = (result as any).parsed;
       // 1. بنحاول نقرأ اللي الباك إند باعته
       let userRole = "STUDENT"; 
       const apiData = (result as any).parsed;
   

       if (apiData) {
         const foundRole = apiData.user?.role || apiData.payload?.user?.role || apiData.role;
         if (foundRole) {
           userRole = String(foundRole).toUpperCase();
         }
       }

       // 2. 🔥 الخدعة السحرية: الإجبار برقم الإيميل أو اليوزر نيم 🔥
       // ضيف اليوزر نيم بتاعك هنا، الكود هيديله أدمن غصب عن الباك إند
       if (email === "mash3l" || email === "mo7amedmash3l@gmail.com") {
         userRole = "ADMIN";
       }

        return {
          id: email,
          email,
          accessToken: result.token,
          role: userRole, 
        };
      },
    }),
  ],
  callbacks: {
    // شيلنا دالة signIn من هنا عشان الإيرور
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role; // الرتبة هتيجي ADMIN زي ما ثبتناها
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).accessToken = token.accessToken as string;
        if (session.user) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  secret: nextAuthSecret,
};