"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for exploring the power of AI building.",
    features: ["3 projects", "BUILDR watermark", "Standard AI generation", "Community support"],
  },
  {
    name: "Pro",
    price: "₹499",
    description: "For professionals building high-quality apps.",
    features: ["Unlimited projects", "No watermark", "Pro AI models", "Email support", "Custom domains"],
    popular: true,
  },
  {
    name: "Premium",
    price: "₹1999",
    description: "The ultimate tool for high-scale builders.",
    features: ["Everything in Pro", "Best AI models (Claude/GPT-4)", "Priority support", "Team collaboration"],
  },
  {
    name: "Ultra",
    price: "₹9999",
    description: "For enterprises and massive scale.",
    features: ["Everything in Premium", "Unlimited AI generation", "Dedicated account manager", "Custom contracts"],
  },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Choose the plan that fits your ambition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full p-8 bg-zinc-900/50 border-zinc-800 flex flex-col relative ${plan.popular ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-blue-600 text-white border-none">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500">/month</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Check className="text-blue-500" size={12} />
                      </div>
                      <span className="text-zinc-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className={`w-full py-6 rounded-xl ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-800 hover:bg-zinc-700'} text-white`}>
                  Get Started
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
