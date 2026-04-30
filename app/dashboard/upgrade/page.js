'use client';

import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UpgradePage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: ["3 AI Generations", "Standard Speed", "Community Support"],
      active: true
    },
    {
      name: "Pro",
      price: "$19/mo",
      features: ["Unlimited Generations", "Neural Engine Access", "Priority Support", "Custom Domains"],
      active: false
    }
  ];

  return (
    <div className="p-8 flex flex-col items-center">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-4">Upgrade to Pro</h1>
        <p className="text-zinc-500 max-w-md mx-auto">Unlock the full power of the AI Neural Engine and build without limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {plans.map((plan) => (
          <div key={plan.name} className={`p-10 rounded-[40px] border ${plan.active ? 'border-zinc-800 bg-zinc-900/50' : 'border-blue-600/50 bg-blue-600/5 shadow-[0_0_80px_rgba(59,130,246,0.1)]'} flex flex-col`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{plan.name}</h2>
              {plan.active && <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Active</span>}
            </div>
            
            <div className="mb-8">
              <span className="text-5xl font-black text-white italic">{plan.price}</span>
            </div>

            <div className="space-y-4 mb-12 flex-grow">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-zinc-400 text-sm">
                  <div className="p-1 bg-zinc-800 rounded-full text-blue-500">
                    <Check size={12} />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <Button className={`w-full h-14 rounded-2xl font-bold text-lg ${plan.active ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl'}`}>
              {plan.active ? 'Current Plan' : 'Get Started'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
