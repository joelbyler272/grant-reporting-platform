"use client"

import { motion } from "framer-motion"
import {
  Database,
  Sparkles,
  LayoutPanelLeft,
  Users,
  Calendar,
  Download,
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const features = [
  {
    icon: Database,
    title: "Smart Data Entry",
    body: "Three ways in: upload a document and let AI extract the data, fill out a guided form, or import a spreadsheet. Your data is structured once and reused everywhere.",
    className: "bg-white border-gray-100",
  },
  {
    icon: Sparkles,
    title: "Multi-Funder Report Generator",
    body: "The core feature. Select a grant, click generate. ClearGrant assembles your program data, matches the funder's template section by section, respects word limits, and produces a complete draft — typically in under 60 seconds. Uses only your real data. Never fabricates outcomes or metrics.",
    className: "bg-teal-50 border-teal-100 md:col-span-2",
  },
  {
    icon: LayoutPanelLeft,
    title: "Side-by-Side Review",
    body: "Review your report with the funder's requirements visible on the left and your content on the right. Edit inline. See word counts in real time. Gaps are flagged in yellow so you know exactly what needs attention.",
    className: "bg-white border-gray-100",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    body: "Share drafts with your ED or program staff for review. They leave comments directly on sections. You resolve them and approve. No email chains, no version confusion, no lost feedback.",
    className: "bg-white border-gray-100",
  },
  {
    icon: Calendar,
    title: "Deadline Dashboard",
    body: "Every grant, every due date, every status — visible at a glance. Color-coded urgency. Email reminders at two weeks, one week, and three days. You'll never miss a deadline or discover one the night before.",
    className: "bg-white border-gray-100",
  },
  {
    icon: Download,
    title: "One-Click Export",
    body: "Download as a formatted Word document, a clean PDF, or plain text ready to paste into a funder portal. Each export matches the funder's exact specifications.",
    className: "bg-white border-gray-100",
  },
]

export function Features() {
  return (
    <section id="features" className="py-32">
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
          FEATURES
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-center text-gray-900"
        >
          Built for the way development directors actually work.
        </motion.h2>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className={`rounded-2xl p-8 border shadow-sm ${feature.className}`}
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 mt-2 leading-relaxed">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
