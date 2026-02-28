import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("docman_token")?.value;
}

export async function requireAuthHeader() {
  const token = await getSessionToken();

  if (!token) {
    redirect("/login");
  }

  return { Authorization: `Bearer ${token}` };
}
