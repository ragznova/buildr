"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, userData, loading, logout } = useAuthStore();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email sent!");
    } catch (err) {
      setMessage("Error sending email.");
    } finally {
      setResending(false);
    }
  };

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
        {/* Email Verification Banner */}
        {!user.emailVerified && (
          <div className="mb-8 p-4 bg-blue-600/10 border border-blue-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <p className="text-sm text-blue-100">Please verify your email to enable all features.</p>
             </div>
             <div className="flex items-center gap-3">
                {message && <span className="text-xs text-blue-400">{message}</span>}
                <Button 
                  onClick={handleResend} 
                  disabled={resending}
                  className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-4"
                >
                  {resending ? "Sending..." : "Resend Link"}
                </Button>
             </div>
          </div>
        )}

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
