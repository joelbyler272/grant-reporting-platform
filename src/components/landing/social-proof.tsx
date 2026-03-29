const categories = [
  "Homeless Shelters",
  "Veteran Services",
  "Food Pantries",
  "Workforce Programs",
  "Domestic Violence Services",
  "Early Childhood Programs",
  "Community Health Centers",
  "Re-entry Programs",
]

export function SocialProof() {
  return (
    <section className="w-full bg-gray-50 border-y border-gray-100 py-10">
      <p className="text-xs uppercase tracking-widest text-gray-400 text-center mb-6">
        Trusted by organizations serving:
      </p>
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto px-6">
        {categories.map((category) => (
          <span
            key={category}
            className="bg-white border border-gray-200 text-gray-600 text-sm rounded-full px-4 py-1.5 shadow-sm"
          >
            {category}
          </span>
        ))}
      </div>
    </section>
  )
}
