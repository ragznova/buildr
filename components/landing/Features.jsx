"use client";

import { motion } from "framer-motion";
import { Layout, AppWindow, Palette, Box, Layers, Globe } from "lucide-react";

const features = [
  {
    title: "AI Website Builder",
    description: "Generate pixel-perfect websites with responsive layouts and modern design systems.",
    icon: Layout,
  },
  {
    title: "App Builder",
    description: "Build full-stack applications with logic, databases, and authentication using plain English.",
    icon: AppWindow,
  },
  {
    title: "Logo Generator",
    description: "Create unique branding assets and SVG logos tailored to your project's identity.",
    icon: Palette,
  },
  {
    title: "3D Builder",
    description: "Incorporate immersive 3D elements and interactive scenes directly into your web projects.",
    icon: Box,
  },
  {
    title: "500+ Templates",
    description: "Start fast with a library of premium templates for every industry and use case.",
    icon: Layers,
  },
  {
    title: "Multi Language Support",
    description: "Automatically translate and localize your apps for a global audience with AI.",
    icon: Globe,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Everything you need to build the next generation of digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl border border-zinc-800 bg-black hover:border-blue-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <feature.icon className="text-blue-500 group-hover:text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
