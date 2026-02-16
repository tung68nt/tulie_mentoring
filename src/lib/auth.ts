import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { prisma } from "./db";
import { loginSchema } from "./validators";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile?.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: profile.email },
                });

                if (existingUser) {
                    await prisma.account.upsert({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                            },
                        },
                        create: {
                            userId: existingUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at,
                            token_type: account.token_type,
                            scope: account.scope,
                            id_token: account.id_token,
                        },
                        update: {
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at,
                        },
                    });

                    (user as any).id = existingUser.id;
                    (user as any).role = existingUser.role;
                    (user as any).firstName = existingUser.firstName;
                    (user as any).lastName = existingUser.lastName;
                } else {
                    const firstName = (profile as any).given_name || profile.name?.split(" ")[0] || "";
                    const lastName = (profile as any).family_name || profile.name?.split(" ").slice(1).join(" ") || "";

                    const newUser = await prisma.user.create({
                        data: {
                            email: profile.email,
                            firstName,
                            lastName,
                            avatar: (profile as any).picture || null,
                            role: "mentee",
                        },
                    });

                    await prisma.account.create({
                        data: {
                            userId: newUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at,
                            token_type: account.token_type,
                            scope: account.scope,
                            id_token: account.id_token,
                        },
                    });

                    await prisma.menteeProfile.create({
                        data: { userId: newUser.id },
                    });

                    (user as any).id = newUser.id;
                    (user as any).role = newUser.role;
                    (user as any).firstName = newUser.firstName;
                    (user as any).lastName = newUser.lastName;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // If it's a sign-in, we use the user object we populated in signIn()
                token.id = user.id;
                token.role = (user as any).role;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            } else if (token.email && !token.id) {
                // Background check if ID is missing for some reason
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true, firstName: true, lastName: true }
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.firstName = dbUser.firstName;
                    token.lastName = dbUser.lastName;
                }
            }

            if (trigger === "update" && session) {
                token.role = session.role || token.role;
                token.firstName = session.firstName || token.firstName;
                token.lastName = session.lastName || token.lastName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
            }
            return session;
        },
    },
});
