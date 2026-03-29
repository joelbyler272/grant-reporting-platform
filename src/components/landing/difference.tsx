"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const items = [
  {
    label: "Your data stays yours",
    description:
      "We don\u2019t train on your data. We don\u2019t sell it. We don\u2019t share it. Your program outcomes, client stories, and financial data are encrypted at rest and in transit.",
  },
  {
    label: "AI that assists, not invents",
    description:
      "ClearGrant uses Claude to transform your real data into readable narratives. It never fabricates metrics, outcomes, or stories. Every number in a generated report traces back to something you entered.",
  },
  {
    label: "Priced for the sector",
    description:
      "We know your budget. $20/month is less than the hourly cost of the staff time you\u2019ll save on a single report. The free tier has no time limit \u2014 use it as long as it works for you.",
  },
]

export default function Difference() {
  return (
    <section className="py-32 bg-gray-900 w-full">
      <motion.div
        className="max-w-4xl mx-auto px-6"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-semibold tracking-widest uppercase text-teal-400 text-center mb-4"
        >
          WHY CLEARGRANT
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-center text-white"
        >
          Built to serve the sector. Not to extract from it.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-400 text-center max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Most software in this space is built for funders and priced for
          institutions. ClearGrant is built for the people doing the work —
          development directors, program managers, and small teams trying to keep
          the lights on while proving their impact.
        </motion.p>

        <div className="mt-16 space-y-8">
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="flex items-start gap-4"
            >
              <Check className="w-6 h-6 text-teal-400 shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold text-lg">
                  {item.label}
                </p>
                <p className="text-gray-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
