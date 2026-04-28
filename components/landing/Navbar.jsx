"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, userData, logout } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tighter">
          BUILDR
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How it works</Link>
          <Link href="/#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
               <Link href="/dashboard" className="text-sm font-medium hover:text-blue-500 transition-colors">
                  Dashboard
               </Link>
               <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                     {(userData?.name || user.displayName || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                    {userData?.name || user.displayName || "User"}
                  </span>
               </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-blue-500 transition-colors">Log in</Link>
              <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
