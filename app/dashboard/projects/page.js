'use client';

import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">My Projects</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full flex gap-2 shadow-lg">
          <Plus size={20} />
          <span className="font-bold">New Project</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for projects */}
        <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-blue-600 transition-all">
          <div className="p-4 bg-zinc-800 rounded-2xl mb-4 text-zinc-500 group-hover:text-blue-500 transition-colors">
            <Folder size={32} />
          </div>
          <h3 className="text-white font-bold mb-2">No projects yet</h3>
          <p className="text-zinc-500 text-sm">Start by creating your first AI-generated website.</p>
        </div>
      </div>
    </div>
  );
}
