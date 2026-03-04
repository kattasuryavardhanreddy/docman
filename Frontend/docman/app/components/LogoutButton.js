"use client";
import { logoutAction } from "./logout-action";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => await logoutAction()}
      className="rounded bg-red-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-700"
    >
      Logout
    </button>
  );
}
