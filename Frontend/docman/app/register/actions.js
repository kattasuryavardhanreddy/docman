"use server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api";
import {
  REGISTRATION_DISABLED_MESSAGE,
  REGISTRATION_ENABLED,
} from "./registration-status";

export async function registerAction(formData) {
  if (!REGISTRATION_ENABLED) {
    return { error: REGISTRATION_DISABLED_MESSAGE };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(buildApiUrl("/api/v1/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data?.error?.message || data?.message || "Registration failed" };
    }

    const cookieStore = await cookies();
    cookieStore.set("docman_token", data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresInSeconds,
    });

    return { success: true };
  } catch {
    return { error: "Registration service error" };
  }
}
