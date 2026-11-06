import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "CANDIDATE" | "ADMIN";
    candidateId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "CANDIDATE" | "ADMIN";
      candidateId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "CANDIDATE" | "ADMIN";
    candidateId: string | null;
  }
}
