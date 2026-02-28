"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // FIX: Await the cookies() call
  const cookieStore = await cookies();
  cookieStore.delete("docman_token");
  redirect("/login");
}