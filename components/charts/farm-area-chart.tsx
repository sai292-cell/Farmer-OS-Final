'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export function FarmAreaChart({ data }: { data: { name: string; area: number }[] }) {
  return <div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="area" fill="#2f7d32" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
}
