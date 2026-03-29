"use client";

import { Upload, Users, Sparkles } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Add your program data once.",
    body: "Upload your board report, fill out a simple form, or import a spreadsheet from your case management system. ClearGrant reads your data and builds a source of truth for your programs — outcomes, metrics, client stories, financials. You never retype it.",
  },
  {
    num: "02",
    icon: Users,
    title: "Tell us who you're reporting to.",
    body: "Add each of your funders. Search our community library to find their template instantly, or build it in minutes. ClearGrant learns what every funder cares about — employment outcomes for workforce foundations, housing stability for housing funders — and remembers it forever.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Generate. Review. Submit.",
    body: "Select a grant, click generate. In under a minute, ClearGrant produces a complete draft — formatted to your funder\u2019s exact requirements, written in the right language, with the right emphasis. You review, adjust if needed, and export. Done.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-off-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="section-label mb-4">How It Works</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="heading-2">
              Three steps.
              <br />
              <span className="font-display italic">Then you&apos;re done.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-px border-t-2 border-dashed border-teal-light z-0" />

          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={0.15 * i}>
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm relative z-10 h-full">
                <span className="text-[72px] font-bold text-teal-light leading-none absolute top-4 right-6 select-none">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-bg flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-teal" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mt-4">{step.title}</h3>
                <p className="text-text-secondary text-base leading-[1.7] mt-3">{step.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
