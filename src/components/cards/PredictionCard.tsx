import { motion } from "framer-motion";
import type { PredictionSummary } from "../../types";

type PredictionCardProps = {
  summary: PredictionSummary;
};

export default function PredictionCard({ summary }: PredictionCardProps) {
  const trendColor = summary.changePct >= 0 ? "text-emerald-600" : "text-rose-600";
  const trendSymbol = summary.changePct >= 0 ? "+" : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
    >
      <p className="text-sm text-slate-500">{summary.days} Day Forecast</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">Rs {summary.value.toFixed(0)}</p>
      <p className="text-xs text-slate-500">per quintal</p>
      <p className={`mt-1 text-sm font-semibold ${trendColor}`}>
        {trendSymbol}
        {summary.changePct.toFixed(1)}%
      </p>
    </motion.article>
  );
}

