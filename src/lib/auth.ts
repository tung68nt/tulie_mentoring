import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "./db";
import { loginSchema } from "./validators";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            profile(profile) {
                return {
                    id: profile.sub,
                    email: profile.email,
                    firstName: profile.given_name || profile.name?.split(" ")[0] || "",
                    lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
                    image: profile.picture,
                    role: "mentee", // Default role for Google sign-ups
                };
            },
        }),
        Credentials({
            async authorize(credentials) {
                const validatedData = loginSchema.safeParse(credentials);

                if (!validatedData.success) return null;

                const { email, password } = validatedData.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.passwordHash) return null;

                const passwordMatch = await bcrypt.compare(password, user.passwordHash);

                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            },
        }),
    ],
    events: {
        async createUser({ user }) {
            // When a new user signs up via Google, create their mentee profile
            if (user.id) {
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
                if (dbUser && dbUser.role === "mentee") {
                    await prisma.menteeProfile.upsert({
                        where: { userId: user.id },
                        create: { userId: user.id },
                        update: {},
                    });
                }
            }
        },
    },
});
