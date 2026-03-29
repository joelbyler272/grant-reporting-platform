const footerLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <a href="#" className="text-xl font-semibold tracking-tight">
            <span className="text-teal">Clear</span>
            <span className="text-white">Grant</span>
          </a>
          <div className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm text-gray-400 max-w-lg">
            Built for the nonprofit sector, by someone who believes your time should be spent on
            mission — not paperwork.
          </p>
          <p className="text-sm text-gray-500">
            &copy; 2026 ClearGrant. Made with purpose.
          </p>
        </div>
      </div>
    </footer>
  );
}
