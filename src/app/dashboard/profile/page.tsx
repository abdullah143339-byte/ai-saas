"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Calendar, Shield, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-light mb-8">
          Profile Settings
        </h1>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-dark-2 flex items-center justify-center">
                <User className="w-10 h-10 text-light" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-light">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-light-3 text-sm">{user?.email}</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <Mail className="w-5 h-5 text-primary-light" />
              <div>
                <p className="text-sm text-light-3">Email</p>
                <p className="text-light">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <User className="w-5 h-5 text-primary-light" />
              <div>
                <p className="text-sm text-light-3">Name</p>
                <p className="text-light">{user?.name || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <Shield className="w-5 h-5 text-primary-light" />
              <div>
                <p className="text-sm text-light-3">Account Status</p>
                <p className="text-light">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-light-3 text-sm">
            Account management and additional settings coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
