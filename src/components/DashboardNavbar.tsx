"use client";

import Link from "next/link";
import { Sparkles, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function DashboardNavbar() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Signed out successfully");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-dark/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-light" />
            <span className="text-xl font-bold gradient-text">AIForge</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/profile"
              className="p-2 text-light-3 hover:text-light transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 text-light-3 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
