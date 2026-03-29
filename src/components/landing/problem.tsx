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

export function Problem() {
  return (
    <section className="py-32">
      <motion.div
        className="max-w-4xl mx-auto px-6"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-semibold tracking-widest uppercase text-teal-600 text-center mb-4"
        >
          SOUND FAMILIAR?
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-[48px] font-bold tracking-[-0.03em] text-center text-gray-900 leading-tight"
        >
          You know your programs inside out.
          <br />
          You shouldn&apos;t have to prove it
          <br />
          <span
            className="italic text-teal-600"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            twelve different ways.
          </span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-600 leading-relaxed mt-8 max-w-2xl mx-auto text-center"
        >
          Every funder wants the same information arranged their way. Different
          templates. Different word limits. Different emphasis. So you spend hours
          reformatting the same outcomes data into twelve different documents —
          when you could be running your programs.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-600 leading-relaxed mt-4 max-w-2xl mx-auto text-center"
        >
          The average development director spends 6–8 hours per grant, per
          reporting cycle, on this mechanical work. Multiply that by eight active
          grants and you&apos;ve lost a full work week to copy-paste.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 max-w-2xl mx-auto border-l-4 border-teal-200 pl-6"
        >
          <span className="text-5xl text-teal-300 leading-none font-serif">
            &ldquo;
          </span>
          <p className="text-xl text-gray-700 italic leading-relaxed">
            I spend more time formatting reports than I spend with the families we
            serve. That can&apos;t be right.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            — Development Director, Indianapolis nonprofit
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
