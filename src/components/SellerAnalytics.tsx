"use client";
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Calendar,
  Download,
  Recycle,
  DollarSign,
  Brain,
  Target,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { User } from "../App";
import SurplusTable from "../Surplus_table";

interface SellerAnalyticsProps {
  user: User;
}

// 🔹 ForecastChart Component
function ForecastChart() {
  const [selectedMonth, setSelectedMonth] = useState<string>("Month+1");
  const [data, setData] = useState<any[]>([]);
  const [monthKeys, setMonthKeys] = useState<string[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, Record<string, number>>>({});
  const [yMax, setYMax] = useState<number>(10000);

  // Fetch forecast once
  useEffect(() => {
    fetch("http://127.0.0.1:8000/forecast_monthly")
      .then((res) => res.json())
      .then((json) => {
        if (!json || !json.forecasts) return;

        let fc: Record<string, Record<string, number>> = json.forecasts;
        if ((fc as any).forecasts) {
          fc = (fc as any).forecasts;
        }

        const sample = Object.values(fc)[0] as Record<string, number> | undefined;
        if (!sample) return;

        const keys = Object.keys(sample);
        setMonthKeys(keys);

        const initialMonth = keys.includes("Month+1") ? "Month+1" : keys[0];
        setSelectedMonth(initialMonth);
        setForecasts(fc);

        // 🔹 Compute global max across all drugs & months
        let globalMax = 0;
        Object.values(fc).forEach((drugMonths) => {
          Object.values(drugMonths).forEach((val) => {
            if (val > globalMax) globalMax = val;
          });
        });

        setYMax(Math.ceil(globalMax * 1.1)); // add 10% padding
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  // Recompute chart when month changes
  useEffect(() => {
    if (!selectedMonth || !forecasts || Object.keys(forecasts).length === 0) return;

    const chartData = Object.keys(forecasts).map((drug) => ({
      drug,
      forecast: Number(forecasts[drug]?.[selectedMonth] ?? 0),
    }));
    setData(chartData);
  }, [selectedMonth, forecasts]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthKeys.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="drug" />
          {/* 🔹 Fixed Y-axis with auto-detected global max + padding */}
          <YAxis domain={[0, yMax]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#6366F1"
            strokeWidth={2}
            dot
            name="Forecast (units)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 🔹 Main SellerAnalytics Page
export function SellerAnalytics({ user }: SellerAnalyticsProps) {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Seller Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights for your pharmaceutical surplus business
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Brain className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Real-time Data
            </Badge>
          </div>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="12m">
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$847,200</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +23.8% from last year
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Waste Prevented</CardTitle>
            <Recycle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">52.8 Tons</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Surplus Predicted</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$43,500</div>
            <div className="flex items-center text-xs text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Next quarter forecast
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">87%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section (only LineChart now) */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Monthly Sales</CardTitle>
            <CardDescription>
              AI forecasted sales across pharmaceutical materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart />
          </CardContent>
        </Card>
      </div>

      {/* Surplus Prediction Table */}
      <Card>
        <CardHeader>
          <CardTitle>AI Surplus Predictions</CardTitle>
          <CardDescription>
            Surplus / shortage risk assessment for each drug
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurplusTable />
        </CardContent>
      </Card>
    </div>
  );
}
