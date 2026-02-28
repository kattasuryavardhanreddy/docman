"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerAction(formData);

      if (result?.success) {
        router.replace("/documents");
        return;
      }

      setError(result?.error || "Registration failed");
    } catch (err) {
      setError("Registration service error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center pt-20">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200">
        <h1 className="text-2xl font-bold mb-6 text-slate-800 text-center">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input name="email" type="email" required className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 focus:ring-slate-500 focus:border-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" required className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 focus:ring-slate-500 focus:border-slate-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-slate-900 text-white py-2 rounded font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
