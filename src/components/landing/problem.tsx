"use client";

import ScrollReveal from "./ScrollReveal";

export default function Problem() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <p className="section-label mb-4">Sound Familiar?</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="heading-2 mb-8">
            You know your programs inside out.
            <br />
            You shouldn&apos;t have to prove it
            <br />
            <span className="font-display italic">twelve different ways.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="text-lg text-text-secondary leading-[1.75] max-w-2xl mx-auto space-y-6 mb-16">
            <p>
              If you manage grants, February looks like this: three reports due, three different
              templates, three different funder portals — and the same program data reformatted from
              scratch every single time.
            </p>
            <p>
              You copy last year&apos;s report. You hunt for the funder&apos;s template. You pull
              numbers from your case management system that doesn&apos;t export cleanly. You write the
              narrative. You send it to your ED for review. You reformat it. You log into yet another
              portal.
            </p>
            <p>And then you start the next one.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <blockquote className="max-w-2xl mx-auto">
            <div className="text-7xl leading-none font-serif text-teal mb-2">&ldquo;</div>
            <p className="text-[22px] font-medium text-text-primary italic leading-relaxed">
              The average nonprofit spends 40+ hours per quarter just on grant reporting. That&apos;s
              a full work week — every quarter — on paperwork.
            </p>
            <p className="text-sm text-text-muted mt-4">— Center for Effective Philanthropy</p>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}
