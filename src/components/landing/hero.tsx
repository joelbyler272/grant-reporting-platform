"use client"

import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[68px] pb-20">
      {/* Badge */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-xs font-medium text-teal-700">
          AI-powered grant reporting for nonprofits
        </span>
      </motion.div>

      {/* H1 */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] text-gray-900">
          Grant reporting,
          <br />
          finally{" "}
          <span
            className="italic text-teal-600"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            done right.
          </span>
        </h1>
      </motion.div>

      {/* Sub-headline */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg md:text-[19px] text-gray-500 max-w-[520px] leading-[1.65] mt-6">
          ClearGrant connects your program data to every funder&apos;s format
          &mdash; and generates polished, submission-ready reports
          automatically. One input. Twelve reports. Zero Friday nights lost.
        </p>
      </motion.div>

      {/* CTA group */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 mt-8"
      >
        <a
          id="hero-cta"
          href="/signup"
          className="inline-flex items-center bg-teal-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-teal-700 transition-colors shadow-sm"
        >
          Start for free
        </a>
        <a
          href="#how-it-works"
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          See how it works &rarr;
        </a>
      </motion.div>

      {/* Trust line */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-gray-400 mt-4">
          Free for up to 3 funders &middot; No credit card required &middot;
          $20/month after that
        </p>
      </motion.div>

      {/* Product mockup */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
          },
        }}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="mt-16 w-full max-w-4xl mx-auto"
        style={{
          transform: "perspective(1200px) rotateX(4deg)",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.12)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Browser chrome */}
        <div className="rounded-xl overflow-hidden border border-gray-200">
          {/* Browser bar */}
          <div className="bg-gray-100 flex items-center px-4 py-2.5 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 font-mono flex-1">
              app.cleargrant.org/dashboard
            </div>
          </div>

          {/* App content */}
          <div className="bg-white p-6">
            {/* Header */}
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900">
                Welcome back, Sarah
              </p>
              <p className="text-sm text-gray-500">Good morning</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-gray-900">
                    3 Reports Due
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  8 Active Grants
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  $127K Managed
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  24 Submitted
                </span>
              </div>
            </div>

            {/* Reports list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    Lilly Endowment
                  </span>
                  <span className="text-sm text-gray-500">
                    Workforce Program
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    3 days
                  </span>
                  <button className="bg-teal-600 text-white text-xs px-3 py-1 rounded hover:bg-teal-700 transition-colors">
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    CICF
                  </span>
                  <span className="text-sm text-gray-500">Youth Services</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    9 days
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    Dekko Foundation
                  </span>
                  <span className="text-sm text-gray-500">
                    Education Program
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    21 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
