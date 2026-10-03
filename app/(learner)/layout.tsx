import { LearnerShell } from "@/components/learn/learner-shell";
import { requireUser } from "@/lib/auth/session";

export default async function LearningLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  return <LearnerShell name={user.name ?? null} email={user.email ?? "learner"}>{children}</LearnerShell>;
}
