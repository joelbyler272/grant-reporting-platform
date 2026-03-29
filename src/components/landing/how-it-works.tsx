"use client"

import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const steps = [
  {
    number: "01",
    title: "Enter your data once",
    body: "Upload a board report, fill out a guided form, or paste from a spreadsheet. ClearGrant structures it automatically. You never retype the same number twice.",
  },
  {
    number: "02",
    title: "Click generate",
    body: "Pick a grant. ClearGrant pulls the right data, matches the funder's template, respects word limits, and writes a complete draft in under 60 seconds. No fabricated data, ever.",
  },
  {
    number: "03",
    title: "Review, approve, submit",
    body: "Edit inline with funder requirements visible side-by-side. Share with your ED for review. Export as Word, PDF, or paste into a funder portal. Mark submitted and clear it from your dashboard.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-gray-50">
      <motion.div
        className="max-w-6xl mx-auto px-6"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-semibold tracking-widest uppercase text-teal-600 text-center mb-4"
        >
          HOW IT WORKS
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-center text-gray-900"
        >
          Three steps. Then you&apos;re done.
        </motion.h2>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <span className="text-8xl font-bold text-teal-50 leading-none absolute -top-2 -right-2">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mt-2 relative">
                {step.title}
              </h3>
              <p className="text-gray-600 mt-3 leading-relaxed relative">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
