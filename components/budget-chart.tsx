"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ChartData {
  id: string
  name: string
  value: number
  color: string
}

interface BudgetChartProps {
  data: ChartData[]
}

export function BudgetChart({ data }: BudgetChartProps) {
  // Chart color palette
  const CHART_COLORS = [
    "#2563eb", // Primary blue
    "#3b82f6", // Blue-500
    "#60a5fa", // Blue-400
    "#93c5fd", // Blue-300
    "#f97316", // Orange-500
    "#fb923c", // Orange-400
    "#fdba74", // Orange-300
    "#4ade80", // Green-400 (for income)
    "#f87171", // Red-400 (for expenses)
  ]

  // Format the tooltip value
  const formatTooltipValue = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-2 border border-border/30 rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatTooltipValue(data.value)} ({((data.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // If no data or total is 0, show a message
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data available for this period
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={1}
            stroke="var(--background)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry, index) => {
              const item = data[index]
              return (
                <span className="text-xs">
                  {value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              )
            }}
            wrapperStyle={{ fontSize: "12px", paddingLeft: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

