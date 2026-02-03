'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'

interface SpendingPieChartProps {
  data: { name: string; value: number }[]
}

const COLORS_DARK = ['#ffffff', '#cccccc', '#999999', '#666666', '#444444', '#222222']
const COLORS_LIGHT = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#eeeeee']

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      return (
        <div className={`rounded-lg px-3 py-2 shadow-xl border ${
          isDark
            ? 'bg-[#111111] border-[#222222]'
            : 'bg-white border-gray-300'
        }`}>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</p>
          <p className={`text-xs ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
            {formatAmount(item.value)} ({((item.value / total) * 100).toFixed(0)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-6 border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Spending by Category</h3>
      <p className={`text-xs mb-6 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Monthly breakdown</p>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className={`text-sm ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>No data available</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>{formatAmount(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
