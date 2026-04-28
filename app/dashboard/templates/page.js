"use client";

import { motion } from "framer-motion";
import { Layout } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6"
       >
          <Layout className="text-blue-500" size={32} />
       </motion.div>
       <h1 className="text-3xl font-bold text-white mb-4">Templates Coming Soon</h1>
       <p className="text-zinc-500 max-w-md">
         We are currently designing professional, high-conversion templates for you. 
         Stay tuned!
       </p>
    </div>
  );
}
