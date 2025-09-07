import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

type ForecastPoint = {
  date: string
  value: number
}

type ForecastData = {
  [medicine: string]: ForecastPoint[]
}

type ForecastResponse = {
  forecasts: {
    "1_month": ForecastData
    "3_months": ForecastData
    "6_months": ForecastData
    "12_months": ForecastData
  }
}

const ProjectedSales: React.FC = () => {
  const [data, setData] = useState<ForecastResponse["forecasts"] | null>(null)
  const [period, setPeriod] = useState<keyof ForecastResponse["forecasts"]>("1_month")

  useEffect(() => {
    fetch("http://127.0.0.1:8000/forecast_periods")
      .then((res) => res.json())
      .then((res) => {
        setData(res.forecasts)
      })
      .catch((err) => console.error(err))
  }, [])

  if (!data) return <p>Loading forecast...</p>

  // Build chart data (merge all drugs by date)
  const chartData = (data[period]["M01AB"] || []).map((point, i) => {
    const row: any = { date: point.date }
    Object.keys(data[period]).forEach((drug) => {
      row[drug] = data[period][drug][i]?.value
    })
    return row
  })

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Projected Sales ({period.replace("_", " ")})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Period selector */}
        <div className="mb-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as keyof ForecastResponse["forecasts"])}
            className="p-2 border rounded"
          >
            <option value="1_month">1 Month</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
            <option value="12_months">12 Months</option>
          </select>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(data[period]).map((drug, idx) => (
              <Line
                key={drug}
                type="monotone"
                dataKey={drug}
                stroke={`hsl(${(idx * 50) % 360}, 70%, 50%)`} // different color per drug
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ProjectedSales
