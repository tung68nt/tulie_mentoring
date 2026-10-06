import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { prisma } from "./db";
import { loginSchema } from "./validators";
import bcrypt from "bcryptjs";
import { verifyCaptcha } from "./captcha";

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

                const { email: rawEmail, password, captchaToken } = validatedData.data;
                const email = rawEmail.trim();

                // Verify Captcha
                const captchaResult = await verifyCaptcha(captchaToken);
                if (!captchaResult.success) {
                    console.log(`[AUTH] Captcha verification failed for: ${email}`);
                    throw new Error("Captcha verification failed");
                }
                console.log(`[AUTH] Attempting login for: [${email}]`);
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    console.log(`[AUTH] User not found: ${email}`);
                    return null;
                }

                if (!user.passwordHash) {
                    console.log(`[AUTH] User has no password hash: ${email}`);
                    return null;
                }

                const passwordMatch = await bcrypt.compare(password, user.passwordHash);
                console.log(`[AUTH] Password match for ${email}: ${passwordMatch}`);

                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
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

                    user.id = existingUser.id;
                    user.role = existingUser.role;
                    user.firstName = existingUser.firstName || undefined;
                    user.lastName = existingUser.lastName || undefined;
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

                    user.id = newUser.id;
                    user.role = newUser.role;
                    user.firstName = newUser.firstName || undefined;
                    user.lastName = newUser.lastName || undefined;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // For Credentials, user already has the DB info
                // For OAuth, we need to fetch the DB user we just created/updated in signIn()
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    select: { id: true, role: true, firstName: true, lastName: true }
                });

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.firstName = dbUser.firstName || undefined;
                    token.lastName = dbUser.lastName || undefined;
                } else {
                    // Fallback to provider info if DB fetch fails (shouldn't happen)
                    token.id = user.id;
                    token.role = (user as any).role || "mentee";
                    token.firstName = (user as any).firstName || undefined;
                    token.lastName = (user as any).lastName || undefined;
                }
            } else if (token.email && !token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true, firstName: true, lastName: true }
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.firstName = dbUser.firstName || undefined;
                    token.lastName = dbUser.lastName || undefined;
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
                session.user.role = token.role as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
            }

            // Impersonation: override session with target user data
            const realRole = token?.role as string;
            if (["admin", "program_manager"].includes(realRole)) {
                try {
                    const { cookies } = await import("next/headers");
                    const cookieStore = await cookies();
                    const targetUserId = cookieStore.get("impersonateUserId")?.value;

                    if (targetUserId) {
                        const targetUser = await prisma.user.findUnique({
                            where: { id: targetUserId },
                            select: { id: true, email: true, role: true, firstName: true, lastName: true, avatar: true, image: true },
                        });

                        if (targetUser) {
                            (session as any).realAdminId = session.user.id;
                            (session as any).isImpersonating = true;
                            session.user.id = targetUser.id;
                            (session.user as any).role = targetUser.role;
                            (session.user as any).firstName = targetUser.firstName;
                            (session.user as any).lastName = targetUser.lastName;
                            session.user.email = targetUser.email ?? session.user.email;
                            session.user.image = targetUser.avatar || targetUser.image;
                        }
                    }
                } catch {
                    // cookies() may fail in edge runtime — silently ignore
                }
            }

            return session;
        },
    },
});
