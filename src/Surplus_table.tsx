"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./components/ui/table";
import { Badge } from "./components/ui/badge";

interface SurplusPrediction {
  drug: string;
  prediction: string;
  forecast_demand: number;
  features: {
    ForecastDemand: number;
    CurrentStock: number;
    Surplus: number;
    ShelfLifeDays: number;
    LeadTimeDays: number;
    UnitCost: number;
    WastageRate: number;
  };
}

export default function SurplusTable() {
  const [predictions, setPredictions] = useState<SurplusPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predict_surplus_auto")
      .then((res) => res.json())
      .then((json) => {
        if (json.predictions) {
          setPredictions(json.predictions);
        }
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading surplus predictions...</p>;

  const getBadgeStyle = (prediction: string) => {
    const lower = prediction.toLowerCase();
    if (lower.includes("surplus")) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (lower.includes("shortage")) {
      return "bg-red-100 text-red-800 border-red-300";
    } else if (lower.includes("balanced")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Drug</TableHead>
            <TableHead>Forecast Demand</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Surplus</TableHead>
            <TableHead>Shelf Life (days)</TableHead>
            <TableHead>Lead Time (days)</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Wastage Rate</TableHead>
            <TableHead>Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{item.drug}</TableCell>
              <TableCell>{item.features.ForecastDemand.toFixed(2)}</TableCell>
              <TableCell>{item.features.CurrentStock.toFixed(2)}</TableCell>
              <TableCell>{item.features.Surplus.toFixed(2)}</TableCell>
              <TableCell>{item.features.ShelfLifeDays}</TableCell>
              <TableCell>{item.features.LeadTimeDays}</TableCell>
              <TableCell>${item.features.UnitCost.toFixed(2)}</TableCell>
              <TableCell>
                {(item.features.WastageRate * 100).toFixed(1)}%
              </TableCell>
              <TableCell>
                <Badge className={getBadgeStyle(item.prediction)}>
                  {item.prediction}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {predictions.length === 0 && (
        <p className="text-gray-500 mt-4">No surplus predictions available.</p>
      )}
    </div>
  );
}
