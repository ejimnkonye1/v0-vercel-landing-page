'use client'

export function Stats() {
  const stats = [
    {
      number: '10,000+',
      label: 'Subscriptions Tracked',
    },
    {
      number: '$500,000',
      label: 'Users Saved',
    },
    {
      number: '$48',
      label: 'Average Monthly Savings',
    },
  ]

  return (
    <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {/* Large Number */}
              <div className="text-5xl sm:text-6xl font-bold text-foreground mb-3">
                {stat.number}
              </div>

              {/* Label */}
              <p className="text-base sm:text-lg text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
