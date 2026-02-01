'use client'

export function DashboardPreview() {
  const subscriptions = [
    { name: 'Spotify', price: '$12.99', renewalDate: 'Mar 15' },
    { name: 'Netflix', price: '$19.99', renewalDate: 'Mar 20' },
    { name: 'Adobe Creative', price: '$59.99', renewalDate: 'Mar 10' },
    { name: 'ChatGPT Pro', price: '$20.00', renewalDate: 'Mar 25' },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Your Dashboard Awaits
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Get a complete overview of all your subscriptions and spending at a glance
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="group relative">
          <div className="p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="mb-8 pb-8 border-b border-[#1a1a1a]">
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                My Subscriptions
              </h3>
              <p className="text-gray-500">
                Total monthly: <span className="text-foreground font-semibold">$112.97</span>
              </p>
            </div>

            {/* Subscription List */}
            <div className="space-y-4 mb-12">
              {subscriptions.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black rounded-xl border border-[#222222] hover:border-[#333333] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-semibold">
                        {sub.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{sub.name}</p>
                      <p className="text-xs text-gray-500">Renews {sub.renewalDate}</p>
                    </div>
                  </div>
                  <p className="text-foreground font-semibold">{sub.price}</p>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-black rounded-2xl border border-[#1a1a1a]">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Annual</p>
                <p className="text-xl font-bold text-foreground">$1,355.64</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Subs</p>
                <p className="text-xl font-bold text-foreground">12</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
                <p className="text-xl font-bold text-foreground">$248</p>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>
    </section>
  )
}
