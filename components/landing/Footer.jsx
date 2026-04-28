"use client";

import { Twitter, Github, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-16 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-black text-white tracking-tighter mb-6 block">
              BUILDR
            </Link>
            <p className="text-zinc-500 max-w-sm leading-relaxed mb-6">
              The world&apos;s most advanced AI-powered website and app builder. 
              Built for speed, scale, and the future of work.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-all">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-all">
                <Github size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-600 hover:text-white transition-all">
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Platform</h4>
            <ul className="space-y-4 text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">AI Builder</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Company</h4>
            <ul className="space-y-4 text-zinc-500">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm text-center">
            &copy; {new Date().getFullYear()} BUILDR Technologies Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-zinc-600 text-sm">
             <Link href="#" className="hover:text-white transition-colors">Status</Link>
             <Link href="#" className="hover:text-white transition-colors">Security</Link>
             <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
