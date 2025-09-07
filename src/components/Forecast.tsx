import React, { useState } from 'react';
// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define the structure of our chart data
interface ChartData {
  day: string;
  sales: number;
}

export function Forecast() {
  const [forecast, setForecast] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(30);

  const getForecast = async () => {
    setLoading(true);
    setError(null);
    setForecast(null); // Clear previous forecast
    try {
      const response = await fetch('http://127.0.0.1:8000/forecast_all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horizon }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setForecast(data.forecast);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Transform the forecast data for the chart
  const chartData: ChartData[] | null = forecast
    ? forecast.map((value, index) => ({
        day: `Day ${index + 1}`, // X-axis label
        sales: value, // Y-axis value
      }))
    : null;

  return (
    <div>
      <h2>Sales Forecast</h2>
      <div>
        <label>
          Forecast Horizon (days):
          <input
            type="number"
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value))}
            style={{ marginLeft: '8px', marginRight: '8px' }}
          />
        </label>
        <button onClick={getForecast} disabled={loading}>
          {loading ? 'Loading...' : 'Get Forecast'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Render the chart when data is available */}
      {chartData && (
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}