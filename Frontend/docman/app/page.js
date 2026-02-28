import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/auth";

export default async function HomePage() {
  const token = await getSessionToken();
  redirect(token ? "/documents" : "/login");
}
