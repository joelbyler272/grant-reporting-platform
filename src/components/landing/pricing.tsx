"use client";

import { Check, ShieldCheck, Lock, DollarSign } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const freeFeatures = [
  "1 program",
  "Up to 3 funders",
  "Unlimited report generation",
  "Deadline dashboard",
  "Community funder library",
  "Email deadline reminders",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Unlimited programs",
  "Unlimited funders",
  "Full report archive",
  "Team collaboration (up to 5 users)",
  "Export to Word and PDF",
  "Funder notes and relationship history",
  "Priority support",
];

const trustSignals = [
  { icon: ShieldCheck, label: "No investor pressure", desc: "pricing stays stable" },
  { icon: Lock, label: "No training on your data", desc: "your program data is yours" },
  { icon: DollarSign, label: "No surprise price increases", desc: "what you see is what you pay" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="section-label mb-4">Pricing</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="heading-2 mb-4">
              Straightforward pricing.
              <br />
              <span className="font-display italic">No surprises.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-[1.7]">
              ClearGrant runs at cost. We charge $20/month — enough to keep the lights on. No
              investors, no pressure to raise prices, no risk of the tool you depend on tripling in
              cost next year.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <ScrollReveal>
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm h-full">
              <p className="text-sm font-semibold text-text-primary">Free</p>
              <p className="text-text-muted text-sm">forever</p>
              <p className="text-5xl font-bold text-text-primary mt-4 mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block text-center border border-teal text-teal font-semibold px-6 py-3 rounded-xl hover:bg-teal-bg transition-colors"
              >
                Start free
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-teal rounded-2xl p-8 shadow-sm ring-4 ring-teal-light ring-offset-2 relative h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Pro</p>
                  <p className="text-teal-light text-sm">Most popular</p>
                </div>
              </div>
              <p className="text-5xl font-bold text-white mt-4 mb-6">
                $20<span className="text-lg font-normal text-teal-light">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((f, i) => (
                  <li
                    key={f}
                    className={`flex items-start gap-3 text-sm ${
                      i === 0 ? "text-teal-light font-medium" : "text-white"
                    }`}
                  >
                    {i > 0 && <Check className="w-4 h-4 text-teal-light mt-0.5 flex-shrink-0" />}
                    {i === 0 ? <span className="ml-7">{f}</span> : f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block text-center bg-white text-teal-dark font-semibold px-6 py-3 rounded-xl hover:bg-teal-bg transition-colors"
              >
                Start Pro free for 14 days
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="text-sm text-text-muted text-center mb-16">
            No credit card required to start. Cancel anytime. We&apos;ll never charge you without
            warning.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-teal-bg border border-teal-light rounded-2xl p-8 max-w-2xl mx-auto text-center">
            <div className="text-4xl text-teal mb-3">&ldquo;</div>
            <p className="text-teal-dark leading-[1.7]">
              Most software companies that serve nonprofits are backed by investors who need a return.
              That means prices that rise, features that get paywalled, and tools that eventually get
              acquired and shut down. ClearGrant is different. We charge $20/month — enough to cover
              our infrastructure and keep improving the product. That&apos;s it.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {trustSignals.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <s.icon className="w-4 h-4 text-teal" />
                  <span className="font-medium text-teal-dark">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
