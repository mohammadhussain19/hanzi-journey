import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAuthenticationDecision } from "@/lib/auth/access";

export { getAuthenticationDecision, getLoginRedirect } from "@/lib/auth/access";

export async function requireUser(pathname = "/dashboard") {
  const session = await auth();
  const decision = getAuthenticationDecision(session?.user?.id, pathname);
  if (!decision.allowed) redirect(decision.redirectTo);
  return session!.user;
}
