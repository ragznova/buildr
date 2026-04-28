"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, userData, loading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userData?.name || user.displayName || "Builder"}!</h1>
            <p className="text-zinc-500">You are on the {userData?.plan || "free"} plan.</p>
          </div>
          <Button onClick={logout} variant="outline" className="border-zinc-800 hover:bg-zinc-900">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">Projects</h3>
            <p className="text-4xl font-bold">{userData?.projectCount || 0}</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">Storage Used</h3>
            <p className="text-4xl font-bold">{userData?.storageUsed || 0} MB</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">AI Credits</h3>
            <p className="text-4xl font-bold">Unlimited</p>
          </div>
        </div>

        <div className="mt-12 p-12 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
           </div>
           <h3 className="text-xl font-bold mb-2">Create your first project</h3>
           <p className="text-zinc-500 max-w-sm mb-6">Start from a template or a blank canvas and let AI do the heavy lifting.</p>
           <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-8">
              New Project
           </Button>
        </div>
      </div>
    </div>
  );
}
