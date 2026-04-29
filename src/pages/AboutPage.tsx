export default function AboutPage() {
  return (
    <section className="card space-y-3">
      <h3 className="text-lg font-semibold">About This Project</h3>
      <p className="text-sm text-slate-600">
        This app helps farmers view historical crop prices and expected future prices so they can choose a better
        selling time.
      </p>
      <p className="text-sm text-slate-600">
        Forecasts are generated using machine learning models trained on market price history.
      </p>
    </section>
  );
}

