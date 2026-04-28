"use client";

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({ children, className }) => (
  <div className={cn("w-full space-y-2", className)}>{children}</div>
)

const AccordionItem = ({ children, className, value }) => {
  return (
    <div className={cn("border-b border-zinc-800", className)}>
      {children}
    </div>
  )
}

const AccordionTrigger = ({ children, className, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between py-6 text-left text-lg font-medium text-white transition-all hover:text-blue-500",
      className
    )}
  >
    {children}
    <motion.div
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronDown className="h-5 w-5 text-zinc-500" />
    </motion.div>
  </button>
)

const AccordionContent = ({ children, className, isOpen }) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className={cn("pb-6 text-zinc-400 leading-relaxed", className)}>
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
