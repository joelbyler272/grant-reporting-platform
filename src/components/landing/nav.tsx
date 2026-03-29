"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [heroCTAVisible, setHeroCTAVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const target = document.getElementById("hero-cta")
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroCTAVisible(entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-[68px] z-50 transition-all duration-200 ${
          scrolled
            ? "backdrop-blur-sm bg-white/95 border-b border-gray-200 shadow-sm"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-teal-600 font-semibold text-lg">Clear</span>
            <span className="text-gray-900 font-semibold text-lg">Grant</span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={`bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors transition-opacity duration-300 ${
                heroCTAVisible
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
            >
              Start free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 pt-[68px]">
          <a
            href="#how-it-works"
            className="text-lg text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-lg text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-lg text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="text-lg text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-teal-600 text-white text-lg font-semibold px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Start free
          </Link>
        </div>
      )}
    </>
  )
}
