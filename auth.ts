import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/server/db/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const credentials = credentialsSchema.safeParse(rawCredentials);

        if (!credentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            companyId: true,
            passwordHash: true
          }
        });

        if (!user?.passwordHash || user.status !== "active") {
          return null;
        }

        const isValidPassword = await compare(credentials.data.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.companyId = token.companyId ?? null;
      }

      return session;
    }
  }
});
