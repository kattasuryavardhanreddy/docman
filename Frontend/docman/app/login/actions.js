"use server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api";

export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(buildApiUrl("/api/v1/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);
    if (!response.ok) {
      return { error: data.message || "Login failed" };
    }

    // FIX: Await the cookies() call
    const cookieStore = await cookies();
    cookieStore.set("docman_token", data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresInSeconds,
    });

    return { success: true };
  } catch (err) {
    // If the error was the 'await' issue, it landed here
    return { error: "Authentication service error: " + err.message };
  }
}
