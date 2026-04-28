"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need coding skills to use BUILDR?",
    answer: "No, BUILDR is designed for everyone. You can build complex apps and websites by drawing, speaking, or typing your ideas.",
  },
  {
    question: "Can I export the code?",
    answer: "Yes, Pro and Premium users can export clean, production-ready React/Next.js code at any time.",
  },
  {
    question: "Which AI models does BUILDR use?",
    answer: "We use a smart router that switches between GPT-4, Claude 3.5, Gemini Pro, and specialized models for 3D and images to give you the best results.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Absolutely! Pro and Premium plans include custom domain support with free SSL certificates.",
  },
  {
    question: "Is there a free trial for the paid plans?",
    answer: "We offer a Free plan with 3 projects so you can explore all the features before upgrading.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-zinc-400">
            Everything you need to know about the future of building.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <AccordionTrigger 
                  isOpen={openIndex === index} 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent isOpen={openIndex === index}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
