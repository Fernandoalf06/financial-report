import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: Please log in.");
  return session.user as any; // Type override since we augment Session user in auth.ts
}

export async function requireDivision() {
  const user = await requireUser();
  if (!user.divisionId) {
    throw new Error("Unauthorized: You do not belong to a Division. Please wait for an invitation.");
  }
  return {
    ...user,
    divisionId: user.divisionId,
    divisionRole: user.divisionRole,
    globalRole: user.globalRole,
  };
}

export async function requireHead() {
  const user = await requireDivision();
  if (user.divisionRole !== "HEAD") {
    throw new Error("Forbidden: You must be a Division Head to perform this action.");
  }
  return user;
}

export async function requireEditor() {
  const user = await requireDivision();
  if (user.divisionRole !== "HEAD" && user.divisionRole !== "EDITOR") {
    throw new Error("Forbidden: You must have Editor permissions to perform this action.");
  }
  return user;
}
