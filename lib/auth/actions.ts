"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export interface AuthFormState {
  error?: string;
}

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  if (name.length < 1 || name.length > 60) return { error: "Please enter a name between 1 and 60 characters." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: "Enter a valid email address." };
  if (password.length < 8 || password.length > 128) return { error: "Use a password between 8 and 128 characters." };

  try {
    const passwordHash = await hash(password, 12);
    await prisma.user.create({ data: { name, email, passwordHash, currentLevel: "HSK1" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return { error: "An account with that email already exists. Try logging in." };
    return { error: "We couldn’t reach the account database. Please check the app’s database setup and try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/onboarding" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Your account was created, but sign-in did not finish. Please log in." };
    throw error;
  }
  return {};
}

export async function loginAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  try {
    const callbackUrl = readText(formData, "callbackUrl");
    const redirectTo = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";
    await signIn("credentials", {
      email: readText(formData, "email").toLowerCase(),
      password: readText(formData, "password"),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "That email and password combination doesn’t match." };
    return { error: "Sign-in is temporarily unavailable. Please check the database configuration and try again." };
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
