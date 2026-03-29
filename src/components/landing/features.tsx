"use client";

import {
  CalendarCheck,
  Sparkles,
  CloudUpload,
  Library,
  UsersRound,
  FolderOpen,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const features = [
  {
    icon: CalendarCheck,
    title: "Deadline Dashboard",
    body: "Every grant, every funder, every due date — visible the moment you log in. Color-coded by urgency. Reminders sent automatically two weeks, one week, and three days out.",
    subtitle: "Never miss a report again.",
  },
  {
    icon: CloudUpload,
    title: "Document Upload + AI Extraction",
    body: "Upload any document — a board update, a program summary, an internal report — and ClearGrant reads it and extracts your program data automatically. Review, confirm, and you're ready to generate.",
    subtitle: "Already have a board report? Use it.",
  },
  {
    icon: Library,
    title: "Community Funder Library",
    body: "Our growing library of funder templates means you don't have to build from scratch. Search for your foundation, click to add, done. Every nonprofit that uses ClearGrant makes it better for everyone else.",
    subtitle: "Your funder's template is probably already here.",
  },
  {
    icon: UsersRound,
    title: "Team Collaboration",
    body: 'Share a report draft for review, leave comments directly on sections, resolve feedback, and approve — without a single email chain or "final_FINAL_v3" document.',
    subtitle: "Review with your ED in the platform.",
  },
  {
    icon: FolderOpen,
    title: "Report Archive",
    body: "When a funder asks what you reported last year, you have it in three clicks. Complete history, version by version.",
    subtitle: "Every report, always findable.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <ScrollReveal>
            <p className="section-label mb-4">Everything You Need</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="heading-2">
              Built for the way
              <br />
              <span className="font-display italic">development directors actually work.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero feature — full width */}
          <ScrollReveal className="md:col-span-2">
            <div className="bg-teal-bg rounded-2xl p-8 md:p-10 border border-teal-light">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles className="w-5 h-5 text-teal" />
                  </div>
                  <p className="text-sm font-medium text-teal-dark mb-1">One data set. Every format.</p>
                  <h3 className="text-2xl font-semibold text-text-primary tracking-tight">
                    Multi-Funder Report Generator
                  </h3>
                  <p className="text-text-secondary text-base leading-[1.7] mt-3">
                    Your program data goes in once. ClearGrant generates a tailored report for each
                    funder — matching their template, their section structure, their word limits, their
                    emphasis areas. Not a mail merge. An actual report.
                  </p>
                </div>
                <div className="flex-shrink-0 w-full md:w-[280px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-primary shadow-sm w-full text-center">
                      Your Program Data
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-px h-4 bg-teal" />
                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-teal" />
                    </div>
                    <div className="space-y-2 w-full">
                      {["Meyer Foundation Report", "United Way Report", "Community Trust Report"].map(
                        (name) => (
                          <div
                            key={name}
                            className="bg-white rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-text-secondary flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                            {name}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Remaining features */}
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={0.1 * (i + 1)}>
              <div className="p-8 rounded-2xl hover:bg-off-white transition-colors h-full">
                <div className="w-10 h-10 rounded-xl bg-teal-bg flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-teal" />
                </div>
                <p className="text-sm font-medium text-teal-dark mt-4 mb-1">{f.subtitle}</p>
                <h3 className="text-lg font-semibold text-text-primary">{f.title}</h3>
                <p className="text-text-secondary text-base leading-[1.7] mt-2">{f.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
