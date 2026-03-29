"use client";

function DashboardMockup() {
  const reports = [
    { funder: "Meyer Foundation", due: "Feb 15", urgency: "bg-red-100 text-red-700" },
    { funder: "United Way of Metro", due: "Feb 28", urgency: "bg-amber-100 text-amber-700" },
    { funder: "Community First Trust", due: "Mar 10", urgency: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white max-w-[900px] mx-auto">
      <div className="bg-gray-100 border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md border border-border px-4 py-1.5 text-xs text-text-muted flex items-center gap-2 max-w-md w-full">
            <div className="w-3.5 h-3.5 rounded-sm bg-teal flex-shrink-0" />
            <span>app.cleargrant.org/dashboard</span>
          </div>
        </div>
        <div className="w-16" />
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Dashboard</h3>
            <p className="text-sm text-text-muted">Welcome back, Sarah</p>
          </div>
          <button className="bg-teal text-white text-sm font-medium px-4 py-2 rounded-lg">
            + New Report
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Reports Due", value: "3", sub: "this quarter" },
            { label: "Active Grants", value: "8", sub: "across 6 funders" },
            { label: "Submitted", value: "24", sub: "all time" },
          ].map((stat) => (
            <div key={stat.label} className="bg-off-white rounded-xl p-4 border border-border">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Upcoming Reports</h4>
          <div className="space-y-2">
            {reports.map((r) => (
              <div
                key={r.funder}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-off-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-bg flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.funder}</p>
                    <p className="text-xs text-text-muted">Annual Narrative Report</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.urgency}`}>
                  Due {r.due}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-[68px] px-6">
      <div className="max-w-5xl mx-auto w-full text-center pt-16 md:pt-24 pb-16">
        {/* Badge */}
        <div className="anim-fade-up inline-flex mb-6" style={{ animationDelay: "0s" }}>
          <span className="bg-teal-bg border border-teal-light text-teal-dark text-xs font-medium px-4 py-1.5 rounded-full">
            AI-powered grant reporting for nonprofits
          </span>
        </div>

        {/* H1 */}
        <h1 className="anim-fade-up heading-1 mb-6" style={{ animationDelay: "0.1s" }}>
          Grant reporting,
          <br />
          finally <span className="font-display italic text-teal">done right.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="anim-fade-up text-[19px] text-text-secondary max-w-[520px] mx-auto leading-[1.65] mb-8"
          style={{ animationDelay: "0.2s" }}
        >
          ClearGrant connects your program data to every funder&apos;s format — and generates
          polished, submission-ready reports automatically. One input. Twelve reports. Zero Friday
          nights lost.
        </p>

        {/* CTAs */}
        <div
          className="anim-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            id="hero-cta"
            href="#pricing"
            className="bg-teal text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-teal-dark shadow-sm hover:shadow-md transition-all"
          >
            Start for free
          </a>
          <a
            href="#how-it-works"
            className="text-text-secondary hover:text-text-primary font-medium underline-offset-2 hover:underline transition-colors"
          >
            See how it works &rarr;
          </a>
        </div>

        {/* Trust line */}
        <p className="anim-fade-up text-sm text-text-muted" style={{ animationDelay: "0.4s" }}>
          Free for up to 3 funders &middot; No credit card required &middot; $20/month after that
        </p>

        {/* Product mockup */}
        <div className="anim-scale-in mt-16 relative" style={{ animationDelay: "0.5s" }}>
          <div
            style={{
              transform: "perspective(1200px) rotateX(4deg)",
              boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.05)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <DashboardMockup />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          />
        </div>
      </div>
    </section>
  );
}
