"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";

interface DemandInsight {
  drug: string;
  trend: string;
  forecast: number;
}

export default function MarketDemandInsights() {
  const [insights, setInsights] = useState<DemandInsight[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/market_demand")
      .then((res) => res.json())
      .then((json) => {
        if (json.insights) setInsights(json.insights);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Market Demand Insights</CardTitle>
        <CardDescription>
          Real-time demand analysis based on forecasted sales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{item.drug}</span>
                <Badge
                  className={
                    item.trend === "High"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }
                >
                  {item.trend}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">{item.forecast.toFixed(0)} units</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
