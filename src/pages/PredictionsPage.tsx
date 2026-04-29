import { useEffect, useMemo, useState } from "react";
import CropSelector from "../components/filters/CropSelector";
import StateSelector from "../components/filters/StateSelector";
import DateRangePicker, { type DateRange } from "../components/filters/DateRangePicker";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import PredictionCard from "../components/cards/PredictionCard";
import { cropPhotoMap, crops, defaultCropPhoto, getCropImage } from "../data/mockData";
import { getCrops, getHistoricalPrices, getPredictions, getStates } from "../services/api";
import type { PredictionPoint, PredictionSummary, PricePoint } from "../types";

const defaultDateRange: DateRange = {
  startDate: "01/04/2026",
  endDate: "30/04/2026"
};

function parseDdMmYyyy(dateText: string): Date | null {
  const trimmed = dateText.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) {
    return null;
  }
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPredictionDays(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
  return Math.min(Math.max(diffDays, 1), 30);
}

export default function PredictionsPage() {
  const [availableCrops, setAvailableCrops] = useState<string[]>(crops);
  const [selectedCrop, setSelectedCrop] = useState(crops[0]);
  const [selectedState, setSelectedState] = useState("All States");
  const [states, setStates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historical, setHistorical] = useState<PricePoint[]>([]);
  const [series, setSeries] = useState<PredictionPoint[]>([]);
  const [cards, setCards] = useState<PredictionSummary[]>([]);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [statesResponse, cropsResponse] = await Promise.all([getStates(), getCrops()]);
        setStates(statesResponse.map((state) => state.replace(/\b\w/g, (ch) => ch.toUpperCase())));
        const formattedCrops = cropsResponse.map((crop) => crop.replace(/\b\w/g, (ch) => ch.toUpperCase()));
        if (formattedCrops.length > 0) {
          setAvailableCrops(formattedCrops);
          if (!formattedCrops.includes(selectedCrop)) {
            setSelectedCrop(formattedCrops[0]);
          }
        }
      } catch (filterError) {
        console.error(filterError);
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function loadData() {
      const start = parseDdMmYyyy(dateRange.startDate);
      const end = parseDdMmYyyy(dateRange.endDate);
      if (!start || !end) {
        setError("Please enter valid dates in DD/MM/YYYY format.");
        setHistorical([]);
        setSeries([]);
        setCards([]);
        return;
      }
      if (end < start) {
        setError("End Date must be on or after Start Date.");
        setHistorical([]);
        setSeries([]);
        setCards([]);
        return;
      }

      const daysToPredict = getPredictionDays(start, end);
      setLoading(true);
      setError(null);
      try {
        const stateForApi = selectedState === "All States" ? undefined : selectedState;
        const [historyResponse, predictionResponse] = await Promise.all([
          getHistoricalPrices(selectedCrop, stateForApi),
          getPredictions(selectedCrop, daysToPredict, stateForApi)
        ]);

        const startKey = toDateKey(start);
        const endKey = toDateKey(end);
        const filteredHistory = historyResponse.filter(
          (point) => point.date >= startKey && point.date <= endKey
        );

        setHistorical(filteredHistory);
        setSeries(predictionResponse.series);
        setCards(predictionResponse.cards);
      } catch (loadError) {
        const fallbackMessage = "Unable to fetch data right now. Please try again.";
        setError(loadError instanceof Error ? loadError.message : fallbackMessage);
        console.error(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCrop, selectedState, dateRange.startDate, dateRange.endDate]);

  const headerLabel = useMemo(
    () => `${selectedCrop} • ${selectedState} • ${dateRange.startDate} to ${dateRange.endDate}`,
    [selectedCrop, selectedState, dateRange.startDate, dateRange.endDate]
  );
  const cropImage = useMemo(() => {
    if (photoFailed) {
      return getCropImage(selectedCrop);
    }
    return cropPhotoMap[selectedCrop] ?? defaultCropPhoto;
  }, [photoFailed, selectedCrop]);

  useEffect(() => {
    setPhotoFailed(false);
  }, [selectedCrop]);

  return (
    <section className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold">Predictions</h3>
        <p className="text-sm text-slate-500">{headerLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4">
          <CropSelector crops={availableCrops} value={selectedCrop} onChange={setSelectedCrop} />
          <StateSelector states={states} value={selectedState} onChange={setSelectedState} />
          <article className="card overflow-hidden p-0">
            <div className="relative">
              <img
                src={cropImage}
                alt={selectedCrop}
                onError={() => setPhotoFailed(true)}
                className="h-56 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/85">Selected Crop</p>
                <h4 className="text-xl font-semibold">{selectedCrop}</h4>
                <p className="text-sm text-white/90">Visual reference for your current prediction selection</p>
              </div>
            </div>
          </article>
        </div>
        <div className="xl:col-span-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {loading && <p className="card text-sm text-slate-600">Loading latest market insights...</p>}
      {error && <p className="card text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map((summary) => (
              <PredictionCard key={summary.days} summary={summary} />
            ))}
          </div>
          <PriceTrendChart historical={historical} forecast={series} />
        </>
      )}
    </section>
  );
}

