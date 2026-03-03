"use client";
import Link from "next/link";
import { REGISTRATION_DISABLED_MESSAGE } from "./registration-status";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center pt-20">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200">
        <h1 className="text-2xl font-bold mb-6 text-slate-800 text-center">Register</h1>
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {REGISTRATION_DISABLED_MESSAGE}
        </div>
        <form className="space-y-4">
          <fieldset disabled className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500"
              />
            </div>
            <button
              disabled
              className="w-full cursor-not-allowed rounded bg-slate-300 py-2 font-medium text-slate-600"
            >
              Registration Unavailable
            </button>
          </fieldset>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Existing users can still <Link href="/login" className="text-slate-900 hover:underline">sign in</Link>.
        </p>
      </div>
    </div>
  );
}
