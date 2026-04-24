"use client"

export function Marquee() {
  const items = [
    "✦ CUIR PREMIUM",
    "✦ FAIT MAIN AU SÉNÉGAL",
    "✦ LIVRAISON EXPRESS",
    "✦ SATISFAIT OU REMBOURSÉ",
  ]

  const duplicatedItems = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-accent/20 bg-accent py-3 text-white">
      <div className="inline-block animate-marquee-scroll">
        {duplicatedItems.map((item, i) => (
          <span
            key={i}
            className="mx-8 font-serif text-sm uppercase tracking-widest"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
