"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useUIStore } from "@/store/useUIStore";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuthStore();
  const { isSidebarCollapsed } = useUIStore();
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
    <div className="flex min-h-screen bg-[#0A0A0A] selection:bg-blue-500/30">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className={`flex-grow ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} min-h-screen relative transition-all duration-300 ease-in-out`}>
        {children}
      </main>
    </div>
  );
}
