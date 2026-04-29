"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "waitlist"), {
        email: email,
        timestamp: serverTimestamp(),
      });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Error adding to waitlist:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-16 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Join the Waitlist</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Be the first to experience the future of app building. Early adopters get exclusive pricing and priority access.
            </p>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 text-green-500"
              >
                <CheckCircle2 size={48} />
                <span className="text-xl font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-zinc-800 text-white h-14 rounded-xl px-6 focus:ring-blue-500"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-xl font-bold text-lg transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Join Waitlist"}
                </Button>
              </form>
            )}
            
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
