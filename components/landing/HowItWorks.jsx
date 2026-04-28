"use client";

import { motion } from "framer-motion";
import { MousePointer2, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    title: "Draw or describe your idea",
    description: "Simply sketch on the canvas or type what you want to build. Our AI understands every detail.",
    icon: MousePointer2,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "AI builds it instantly",
    description: "Watch as code is generated in real-time. Websites, mobile apps, and 3D scenes come to life.",
    icon: Wand2,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Deploy with one click",
    description: "Go live on your own domain or export clean React/Next.js code instantly.",
    icon: Rocket,
    color: "bg-green-500/10 text-green-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it works</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            From imagination to production in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                <span className="text-zinc-600 mr-2">0{index + 1}.</span>
                {step.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
