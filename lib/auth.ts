import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api/client";

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string;
            image?: string;
        };
        accessToken: string;
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        image?: string;
        accessToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        userId?: string;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "your@email.com",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // This will be updated to call your actual Hono auth endpoint
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                        }
                    );

                    if (!response.ok) {
                        return null;
                    }

                    const user = await response.json();

                    if (user && user.accessToken) {
                        return {
                            id: user.id || user.userId,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            accessToken: user.accessToken,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },

    callbacks: {
        async jwt({ token, user }) {
            // Persist the OAuth access_token to the token right after signin
            if (user) {
                token.accessToken = user.accessToken;
                token.userId = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            // Send properties to the client
            if (token.accessToken) {
                session.accessToken = token.accessToken as string;
                session.user.id = token.userId as string;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },

    debug: process.env.NODE_ENV === "development",
});

// Helper function to get the current session
export async function getCurrentUser() {
    const session = await auth();
    return session?.user || null;
}

// Helper function to get the access token
export async function getAccessToken() {
    const session = await auth();
    return session?.accessToken || null;
}
