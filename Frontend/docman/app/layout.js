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
      <body className={`${inter.className} antialiased`}>
        <nav className="border-b border-red-200/70 bg-slate-900 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/documents" className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-300 ring-4 ring-red-200/20" />
              DocPortal
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/documents" className="hover:text-red-100 transition-colors">
                Documents
              </Link>
              <LogoutButton />
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-transparent">
          {children}
        </main>
      </body>
    </html>
  );
}
