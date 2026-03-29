export default function Footer() {
  return (
    <footer className="bg-gray-900 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <span className="text-teal-400 font-semibold text-lg">Clear</span>
            <span className="text-white font-semibold text-lg">Grant</span>
          </div>
          <div className="flex gap-8">
            <a
              href="#how-it-works"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="/login"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            Built for nonprofits, by people who get it.
          </p>
          <p className="text-gray-600 text-sm">
            &copy; 2026 ClearGrant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
