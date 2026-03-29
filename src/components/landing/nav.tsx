"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNavCTA, setShowNavCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const heroCTA = document.querySelector("#hero-cta");
    if (!heroCTA) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowNavCTA(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(heroCTA);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav
        className={`anim-fade-in fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center border-b transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-border shadow-sm"
            : "bg-white border-border"
        }`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="text-xl font-semibold tracking-tight">
            <span className="text-teal">Clear</span>
            <span className="text-text-primary">Grant</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="#"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="bg-teal text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-teal-dark transition-all duration-300"
              style={{
                opacity: showNavCTA ? 1 : 0,
                pointerEvents: showNavCTA ? "auto" : "none",
                transform: showNavCTA ? "translateY(0)" : "translateY(-4px)",
              }}
            >
              Start free
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-medium text-text-primary hover:text-teal transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col items-center gap-4 mt-8">
              <a href="#" className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors">
                Sign in
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="bg-teal text-white text-base font-medium px-7 py-3 rounded-lg hover:bg-teal-dark transition-colors"
              >
                Start free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
