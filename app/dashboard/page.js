"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import Image from "next/image";

const stats = [
  { label: "Total Projects", value: "projectCount", icon: "📁" },
  { label: "Storage Used", value: "storageUsed", suffix: "MB", icon: "📦" },
  { label: "Websites Live", value: "0", icon: "🌐" },
  { label: "Plan Status", value: "plan", icon: "💎" },
];

export default function DashboardPage() {
  const { user, userData } = useAuthStore();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      const unsubscribe = fetchProjects(user.uid);
      return () => unsubscribe && unsubscribe();
    }
  }, [user, fetchProjects]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      await deleteProject(user.uid, id);
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
             Welcome back, {userData?.name?.split(' ')[0] || "Builder"}!
           </h1>
           <p className="text-zinc-500 mt-1">Manage your digital empire from one place.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl flex gap-2 items-center text-white font-bold"
        >
          <Plus size={20} />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-6 rounded-2xl bg-[#1A1A1A] border border-zinc-800 hover:border-zinc-700 transition-colors"
           >
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-2xl">{stat.icon}</span>
                 <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-white">
                    {stat.value === "projectCount" ? userData?.projectCount || 0 : 
                     stat.value === "storageUsed" ? userData?.storageUsed || 0 : 
                     stat.value === "plan" ? userData?.plan?.toUpperCase() || "FREE" : 
                     stat.value}
                 </span>
                 {stat.suffix && <span className="text-zinc-500 text-sm font-bold">{stat.suffix}</span>}
              </div>
           </motion.div>
         ))}
      </div>

      {/* Search & Projects Header */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">My Projects</h2>
            <div className="flex items-center gap-4">
               <div className="relative hidden sm:block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..." 
                    className="bg-[#1A1A1A] border-zinc-800 w-64 pl-10 rounded-xl focus:ring-blue-600"
                  />
               </div>
               <Button variant="outline" className="border-zinc-800 h-10 px-4 rounded-xl flex gap-2 items-center text-zinc-400">
                  <Filter size={16} />
                  Filter
               </Button>
            </div>
         </div>

         {/* Projects Grid */}
         {loading ? (
           <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={32} />
           </div>
         ) : filteredProjects.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-[#1A1A1A] border border-zinc-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all shadow-xl"
                  >
                    {/* Thumbnail Area */}
                    <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                       <Image 
                         src={project.thumbnail} 
                         alt={project.name}
                         fill
                         className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12">
                             <Edit3 size={20} />
                          </Button>
                          <Button size="icon" variant="outline" className="border-white/20 bg-white/10 backdrop-blur-md rounded-full w-12 h-12 text-white">
                             <ExternalLink size={20} />
                          </Button>
                       </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-6">
                       <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white truncate">{project.name}</h3>
                          <button onClick={() => handleDelete(project.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                             <Trash2 size={16} />
                          </button>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800">{project.type}</span>
                          <span>•</span>
                          <span>{project.techStack}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full ${project.isLive ? 'bg-green-500' : 'bg-amber-500'}`} />
                             {project.isLive ? 'Live' : 'Draft'}
                          </span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
         ) : (
           <div className="h-96 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-8 bg-[#1A1A1A]/30">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-3xl">
                 📁
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
              <p className="text-zinc-500 max-w-sm mb-8">
                The canvas is blank. Let&apos;s turn your imagination into code with our AI builder.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-xl text-white font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              >
                Create My First Project
              </Button>
           </div>
         )}
      </div>

      {/* Plan Warning for Free Users */}
      {userData?.plan === "free" && userData?.projectCount >= 2 && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/50 flex items-center gap-4">
           <AlertCircle className="text-amber-500 shrink-0" size={24} />
           <div className="flex-grow">
              <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Warning</h4>
              <p className="text-zinc-400 text-sm">
                You have used {userData?.projectCount} of 3 free projects. **Upgrade to Pro** for unlimited creativity!
              </p>
           </div>
           <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-10 px-6 rounded-lg text-xs">
              Upgrade Now
           </Button>
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
