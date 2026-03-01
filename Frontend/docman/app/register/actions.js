"use server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api";

export async function registerAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    // const response = await fetch(buildApiUrl("/api/v1/auth/register"), {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password }),
    // });

    // const data = await response.json();

    // if (!response.ok) {
    //   return { error: data.message || "Registration failed" };
    // }

    // // FIX: Await the cookies() call
    // const cookieStore = await cookies();
    // cookieStore.set("docman_token", data.accessToken, {
    //   httpOnly: true,
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: data.expiresInSeconds,
    // });
    // raise an alert to say that registration is not allowed for now
    throw new Error("Registration is not allowed for now");
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Registration service error" };
  }
}
