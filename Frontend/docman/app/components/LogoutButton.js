"use client";
import { logoutAction } from "./logout-action";

export default function LogoutButton() {
  return (
    <button 
      onClick={async () => await logoutAction()}
      className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors text-sm font-medium"
    >
      Logout
    </button>
  );
}