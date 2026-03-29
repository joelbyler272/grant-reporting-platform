"use client";

import ScrollReveal from "./ScrollReveal";

const categories = [
  "Homeless Shelters",
  "Veteran Services",
  "Food Pantries",
  "Workforce Programs",
  "Domestic Violence Services",
  "Early Childhood Programs",
  "Community Health Centers",
  "Re-entry Programs",
];

export default function SocialProof() {
  return (
    <section className="w-full bg-off-white border-y border-border py-10">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-widest text-text-muted text-center mb-6">
            Trusted by organizations serving:
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 max-md:overflow-x-auto max-md:flex-nowrap max-md:justify-start max-md:pb-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="bg-white border border-border text-text-secondary text-sm rounded-full px-4 py-1.5 shadow-sm whitespace-nowrap flex-shrink-0"
              >
                {cat}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
