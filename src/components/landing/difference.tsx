"use client";

import { Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const signals = [
  { label: "No investor pressure", desc: "pricing stays stable" },
  { label: "No training on your data", desc: "your program data is yours" },
  { label: "No surprise price increases", desc: "what you see is what you pay" },
];

export default function Difference() {
  return (
    <section className="py-32 bg-gray-900">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.08em] uppercase text-teal mb-4">
            Why ClearGrant
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="text-[48px] max-md:text-[34px] font-bold tracking-[-0.03em] leading-[1.1] text-white mb-6">
            Built to serve the sector.
            <br />
            <span className="font-display italic text-teal-light">Not to extract from it.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-lg text-gray-400 leading-[1.75] max-w-2xl mb-6">
            Most software companies that serve nonprofits are backed by investors who need a return.
            That means prices that rise, features that get paywalled, and tools that eventually get
            acquired and shut down.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <p className="text-lg text-gray-400 leading-[1.75] max-w-2xl mb-6">
            ClearGrant is different. We charge $20/month — enough to cover our infrastructure and keep
            improving the product. That&apos;s it. No profit motive, no venture capital, no exit
            strategy that leaves you stranded.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <p className="text-lg text-gray-300 leading-[1.75] max-w-2xl mb-16 font-medium">
            We built this because development directors deserve a tool that&apos;s actually on their
            side.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-8">
          {signals.map((s, i) => (
            <ScrollReveal key={s.label} delay={0.35 + i * 0.1}>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{s.label}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
