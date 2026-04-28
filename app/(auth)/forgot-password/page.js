"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
           <Link href="/" className="text-3xl font-black tracking-tighter text-white">BUILDR</Link>
           <p className="text-zinc-500 mt-2">Reset your password to get back in.</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 p-8 backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-white">Check your email</h3>
               <p className="text-zinc-400">We&apos;ve sent a password reset link to {email}.</p>
               <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mt-6">
                  <Link href="/login">Back to Login</Link>
               </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-zinc-800"
                />
              </div>

              {error && <p className="text-red-500 text-xs italic">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg rounded-xl">
                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
              </Button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors pt-4">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
