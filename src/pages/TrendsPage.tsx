import { historicalPrices } from "../data/mockData";

export default function TrendsPage() {
  const average =
    historicalPrices.reduce((sum, row) => sum + row.price, 0) / Math.max(1, historicalPrices.length);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <article className="card">
        <h3 className="text-base font-semibold">Average Price</h3>
        <p className="mt-2 text-2xl font-bold text-slate-800">Rs {average.toFixed(0)}</p>
        <p className="mt-1 text-sm text-slate-500">Based on recent selected period.</p>
      </article>
      <article className="card">
        <h3 className="text-base font-semibold">Trend Insight</h3>
        <p className="mt-2 text-sm text-slate-600">
          Current trend is positive. If storage is available, waiting for a short period may improve selling price.
        </p>
      </article>
    </section>
  );
}

