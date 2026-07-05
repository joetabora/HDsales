import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import db from "@/lib/db";
import {
  env,
  getAuthBaseUrl,
  isAppleOAuthEnabled,
  isGoogleOAuthEnabled,
} from "@/lib/env";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: getAuthBaseUrl(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    ...(isGoogleOAuthEnabled()
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {}),
    ...(isAppleOAuthEnabled()
      ? {
          apple: {
            clientId: env.APPLE_CLIENT_ID!,
            clientSecret: env.APPLE_CLIENT_SECRET!,
          },
        }
      : {}),
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Dev outbox: log magic link to console
        console.log(`[Forge Magic Link] ${email}: ${url}`);
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "SALESPERSON",
      },
      dealershipId: {
        type: "string",
        required: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      title: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      qrSlug: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
