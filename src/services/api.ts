import type { PredictionPoint, PredictionSummary, PricePoint } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 20000;

type PricesApiResponse = {
  crop: string;
  state?: string | null;
  count: number;
  data: Array<{ date: string; price: number }>;
};

type PredictApiResponse = {
  crop: string;
  state?: string | null;
  days: number;
  predictions: Array<{ date: string; predicted_price: number }>;
};

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    const data = (await response.json()) as T | { message?: string; detail?: string };
    if (!response.ok) {
      const message =
        (data as { message?: string; detail?: string }).message ??
        (data as { message?: string; detail?: string }).detail ??
        `Request failed with ${response.status}`;
      throw new Error(message);
    }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getStates(): Promise<string[]> {
  const response = await fetchJson<{ states: string[] }>("/states");
  return response.states;
}

export async function getCrops(): Promise<string[]> {
  const response = await fetchJson<{ crops: string[] }>("/crops");
  return response.crops;
}

export async function getHistoricalPrices(crop: string, state?: string): Promise<PricePoint[]> {
  const cropParam = encodeURIComponent(crop.toLowerCase());
  const stateQuery = state ? `&state=${encodeURIComponent(state.toLowerCase())}` : "";
  const response = await fetchJson<PricesApiResponse>(`/prices?crop=${cropParam}${stateQuery}`);
  return response.data.map((row) => ({ date: row.date, price: row.price }));
}

export async function getPredictions(
  crop: string,
  days: number,
  state?: string
): Promise<{ cards: PredictionSummary[]; series: PredictionPoint[] }> {
  const cropParam = encodeURIComponent(crop.toLowerCase());
  const stateQuery = state ? `&state=${encodeURIComponent(state.toLowerCase())}` : "";
  const response = await fetchJson<PredictApiResponse>(`/predict?crop=${cropParam}&days=${days}${stateQuery}`);
  const series: PredictionPoint[] = response.predictions.map((item, index) => ({
    day: `Day ${index + 1}`,
    predictedPrice: item.predicted_price
  }));

  const pickValue = (day: 7 | 15 | 30): number => {
    const idx = day - 1;
    if (series[idx]) {
      return series[idx].predictedPrice;
    }
    return series[series.length - 1]?.predictedPrice ?? 0;
  };

  const firstValue = series[0]?.predictedPrice ?? 0;
  const makeChangePct = (target: number): number => {
    if (firstValue <= 0) {
      return 0;
    }
    return ((target - firstValue) / firstValue) * 100;
  };

  const cardValues: PredictionSummary[] = [7, 15, 30].map((day) => {
    const targetValue = pickValue(day as 7 | 15 | 30);
    return {
      days: day as 7 | 15 | 30,
      value: Number(targetValue.toFixed(2)),
      changePct: Number(makeChangePct(targetValue).toFixed(2))
    };
  });

  return {
    cards: cardValues,
    series
  };
}

export { API_BASE_URL };

