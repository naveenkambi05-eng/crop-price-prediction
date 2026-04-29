import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-emerald-100 p-6 shadow-soft">
        <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              Smart Farming Assistant
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
              Predict crop prices with confidence before you sell
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Welcome to the Market Price Forecasting dashboard. This platform helps farmers track price trends, compare
              recent market movement, and make better selling decisions using model-based forecasting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                React Dashboard
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                FastAPI Backend
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                LSTM Forecasting
              </span>
            </div>
            <Link
              to="/predictions"
              className="mt-5 inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Predict the Price of Your Crops
            </Link>
          </div>

          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-100 backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-700">Quick Highlights</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>- Daily and historical crop price insights.</li>
              <li>- Easy comparison of market trends.</li>
              <li>- ML-powered prediction support.</li>
              <li>- Clean workflow from Home to Prediction.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}

