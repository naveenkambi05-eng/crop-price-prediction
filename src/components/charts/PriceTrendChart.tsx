import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { PredictionPoint, PricePoint } from "../../types";

type PriceTrendChartProps = {
  historical: PricePoint[];
  forecast: PredictionPoint[];
};

export default function PriceTrendChart({ historical, forecast }: PriceTrendChartProps) {
  const transformedHistorical = historical.map((row) => ({
    label: row.date,
    actual: row.price,
    forecast: null as number | null
  }));

  const transformedForecast = forecast.map((row) => ({
    label: row.day,
    actual: null as number | null,
    forecast: row.predictedPrice
  }));

  const chartData = [...transformedHistorical, ...transformedForecast];

  return (
    <section className="card">
      <h3 className="mb-3 text-base font-semibold">Price Trend and Forecast</h3>
      <p className="mb-2 text-xs text-slate-500">Values shown in Rs per quintal</p>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Historical" stroke="#0f172a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

