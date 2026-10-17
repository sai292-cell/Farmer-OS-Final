'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export function FarmAreaChart({ data }: { data: { name: string; area: number }[] }) {
  return (
    <div className="h-52 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#526056', fontWeight: 600 }}
            axisLine={{ stroke: '#E0E4DF' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#78877D' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E0E4DF',
              borderRadius: '16px',
              boxShadow: '0 4px 20px -2px rgba(27, 94, 32, 0.08)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            formatter={(value: any) => [`${value ?? 0} m²`, 'Area']}
          />
          <Bar dataKey="area" fill="#2E7D32" radius={[10, 10, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
