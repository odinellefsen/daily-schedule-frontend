import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "@/lib/api/client";

// Mock mode for development - set to true to bypass backend auth
const MOCK_AUTH_MODE = true;

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
                    placeholder: "Enter your email",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Mock authentication for development
                    if (MOCK_AUTH_MODE) {
                        // Accept any email/password for demo purposes
                        if (credentials.email && credentials.password) {
                            return {
                                id: "demo-user-123",
                                email: credentials.email,
                                name: "Demo User",
                                image: null,
                                accessToken: "demo-access-token-123",
                            };
                        }
                        return null;
                    }

                    // Real authentication with Hono backend
                    const response = await fetch(
                        `${process.env.HONO_API_URL || "http://localhost:8000"}/api/auth/login`,
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

                    const data = await response.json();

                    if (data.user && data.accessToken) {
                        const user = data.user;
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            accessToken: user.accessToken,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Authentication error:", error);
                    if (MOCK_AUTH_MODE) {
                        // Fallback to mock auth even on error
                        return {
                            id: "demo-user-123",
                            email: credentials.email,
                            name: "Demo User",
                            image: null,
                            accessToken: "demo-access-token-123",
                        };
                    }
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
        signIn: "/login",
        error: "/login?error=auth_error",
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
