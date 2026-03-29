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

export default function FinalCta() {
  return (
    <section className="py-40 text-center px-6 relative">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(13,148,136,0.05), transparent)",
        }}
      />

      <motion.div
        className="relative z-10"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h2
          variants={fadeUp}
          className="text-5xl md:text-6xl font-extrabold tracking-[-0.04em] leading-[1.05] text-gray-900"
        >
          Your next report
          <br />
          could take{" "}
          <span
            className="italic text-teal-600"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            20 minutes.
          </span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-500 max-w-lg mx-auto mt-6"
        >
          Stop spending your evenings reformatting. Start spending them on the
          work that matters.
        </motion.p>

        <motion.div variants={fadeUp}>
          <a
            href="/signup"
            className="inline-flex items-center bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-700 transition-colors shadow-sm mt-8"
          >
            Start for free
          </a>
        </motion.div>

        <motion.p variants={fadeUp} className="text-sm text-gray-400 mt-4">
          Free for up to 3 funders · No credit card required
        </motion.p>
      </motion.div>
    </section>
  )
}
