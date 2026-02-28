import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DocPortal",
  description: "Secure Document Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-slate-900 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/documents" className="text-xl font-bold tracking-tight">
              DocPortal
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/documents" className="hover:text-slate-300 transition-colors">
                Documents
              </Link>
              <LogoutButton />
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}