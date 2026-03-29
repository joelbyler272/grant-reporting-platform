"use client";

import ScrollReveal from "./ScrollReveal";

export default function FinalCTA() {
  return (
    <section
      className="py-40 px-6 relative"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(13, 148, 136, 0.05), transparent)",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="heading-1 mb-6">
            Your next report
            <br />
            could take <span className="font-display italic text-teal">20 minutes.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-lg text-text-secondary max-w-md mx-auto leading-[1.65] mb-8">
            Join the development directors who&apos;ve stopped dreading reporting season.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div>
            <a
              href="#pricing"
              className="inline-block bg-teal text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-teal-dark shadow-sm hover:shadow-md transition-all"
            >
              Start free today
            </a>
            <p className="text-sm text-text-muted mt-4">
              No credit card needed &middot; Setup takes 10 minutes
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
