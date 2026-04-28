"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6"
       >
          <Settings className="text-zinc-400" size={32} />
       </motion.div>
       <h1 className="text-3xl font-bold text-white mb-4">Settings Coming Soon</h1>
       <p className="text-zinc-500 max-w-md">
         Manage your account, API keys, and notification preferences from here.
       </p>
    </div>
  );
}
