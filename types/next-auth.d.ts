import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Now id is required
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
