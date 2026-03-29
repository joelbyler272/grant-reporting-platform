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

const freeFeatures = [
  "1 program",
  "Up to 3 funders",
  "Unlimited report generation",
  "30-day report archive",
  "Email deadline reminders",
  "Community library access (read)",
]

const proFeatures = [
  "Unlimited programs",
  "Unlimited funders",
  "Unlimited report generation",
  "Full report archive",
  "Configurable reminders",
  "Community library (read + contribute)",
  "Team collaboration (up to 5)",
  "Export to Word and PDF",
  "Funder notes and history",
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 max-w-5xl mx-auto px-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-semibold tracking-widest uppercase text-teal-600 text-center mb-4"
        >
          PRICING
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-center text-gray-900"
        >
          Straightforward pricing. No surprises.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-500 text-center max-w-2xl mx-auto mt-4"
        >
          ClearGrant is a cost-recovery tool, not a venture-backed platform
          chasing margins. We charge what it costs to run the service well.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16"
        >
          {/* Free card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">Free</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">$0</p>
            <p className="text-gray-500">per month</p>
            <div className="border-t border-gray-100 my-6" />
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="mt-8 block w-full text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Get started
            </a>
          </div>

          {/* Pro card */}
          <div className="bg-teal-600 text-white rounded-2xl p-8 ring-4 ring-teal-300 ring-offset-2 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
              Most popular
            </span>
            <p className="text-2xl font-bold">Pro</p>
            <p className="text-4xl font-bold mt-2">$20</p>
            <p className="text-teal-100">per month</p>
            <div className="border-t border-teal-500 my-6" />
            <ul className="space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-teal-200 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="mt-8 block w-full text-center bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Start free trial
            </a>
          </div>
        </motion.div>

        {/* Mission callout */}
        <motion.div
          variants={fadeUp}
          className="mt-16 max-w-2xl mx-auto bg-teal-50 border border-teal-100 rounded-2xl p-8 text-center"
        >
          <p className="text-lg font-semibold text-gray-900">
            Built as a public benefit.
          </p>
          <p className="text-gray-600 mt-2">
            ClearGrant exists to reduce reporting burden across the nonprofit
            sector. Our pricing reflects our costs, not a growth target.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {[
              "No investor pressure",
              "No training on your data",
              "No surprise price increases",
            ].map((signal) => (
              <span
                key={signal}
                className="flex items-center gap-1.5 text-sm text-gray-600"
              >
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                {signal}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
