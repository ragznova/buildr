"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { 
  Home, 
  FolderOpen, 
  PlusCircle, 
  Layout, 
  Settings, 
  Gem, 
  LogOut,
  ChevronRight,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "My Projects", icon: FolderOpen, path: "/dashboard/projects" },
  { name: "Templates", icon: Layout, path: "/dashboard/templates" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, userData, logout } = useAuthStore();

  const storageUsed = userData?.storageUsed || 0;
  const storageLimit = userData?.plan === "free" ? 100 : 5000;
  const storagePercent = (storageUsed / storageLimit) * 100;

  return (
    <aside className="w-64 h-screen bg-[#111111] border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          BUILDR
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="activeNav" className="ml-auto">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </div>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-zinc-800">
           <Link href="/dashboard/upgrade">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-400 hover:bg-amber-400/10 transition-all">
                <Gem size={20} />
                <span className="font-medium">Upgrade Plan</span>
              </div>
           </Link>
        </div>
      </nav>

      {/* Storage Meter */}
      <div className="p-4 mx-4 mb-4 bg-black rounded-2xl border border-zinc-800">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-400">
               <Database size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Storage</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">{storageUsed} / {storageLimit}MB</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              className={`h-full rounded-full ${storagePercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
            />
         </div>
         {storagePercent > 80 && (
           <p className="text-[9px] text-red-500 mt-2 font-medium">Running low on storage!</p>
         )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
             {(userData?.name || user?.displayName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{userData?.name || user?.displayName || "User"}</h4>
            <div className="flex items-center gap-1.5">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{userData?.plan || "free"}</span>
               <div className={`w-1.5 h-1.5 rounded-full ${userData?.plan === "free" ? 'bg-zinc-500' : 'bg-blue-500 animate-pulse'}`} />
            </div>
          </div>
          <button onClick={logout} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
