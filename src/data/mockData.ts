import type { PredictionPoint, PredictionSummary, PricePoint } from "../types";

export const crops = [
  "Rice",
  "Wheat",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Barley",
  "Millet",
  "Sorghum",
  "Soybean",
  "Groundnut",
  "Mustard",
  "Sunflower",
  "Pulses",
  "Potato",
  "Onion",
  "Tomato"
];

export const cropPhotoMap: Record<string, string> = {
  Rice: "https://loremflickr.com/1200/700/rice,field,agriculture?lock=11",
  Wheat: "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=1200",
  Maize: "https://loremflickr.com/1200/700/maize,corn,field?lock=13",
  Cotton: "https://loremflickr.com/1200/700/cotton,farm,field?lock=14",
  Sugarcane: "https://loremflickr.com/1200/700/sugarcane,field,agriculture?lock=15",
  Barley: "https://loremflickr.com/1200/700/barley,grain,field?lock=16",
  Millet: "https://loremflickr.com/1200/700/millet,grain,farm?lock=17",
  Sorghum: "https://loremflickr.com/1200/700/sorghum,grain,field?lock=18",
  Soybean: "https://loremflickr.com/1200/700/soybean,farm,field?lock=19",
  Groundnut: "https://loremflickr.com/1200/700/peanut,groundnut,farm?lock=20",
  Mustard: "https://loremflickr.com/1200/700/mustard,field,flowers?lock=21",
  Sunflower: "https://loremflickr.com/1200/700/sunflower,field,farm?lock=22",
  Pulses: "https://loremflickr.com/1200/700/lentils,pulses,grain?lock=23",
  Potato: "https://loremflickr.com/1200/700/potato,harvest,farm?lock=24",
  Onion: "https://loremflickr.com/1200/700/onion,vegetable,farm?lock=25",
  Tomato: "https://loremflickr.com/1200/700/tomato,vegetable,farm?lock=26"
};

export const defaultCropPhoto =
  "https://loremflickr.com/1200/700/agriculture,farm,field?lock=99";

const cropPaletteMap: Record<string, { top: string; bottom: string; accent: string }> = {
  Rice: { top: "#E8F5E9", bottom: "#A5D6A7", accent: "#2E7D32" },
  Wheat: { top: "#FFF8E1", bottom: "#FFE082", accent: "#F9A825" },
  Maize: { top: "#FFFDE7", bottom: "#FFF176", accent: "#FBC02D" },
  Cotton: { top: "#F3E5F5", bottom: "#CE93D8", accent: "#8E24AA" },
  Sugarcane: { top: "#E0F7FA", bottom: "#80DEEA", accent: "#00838F" },
  Barley: { top: "#FFF3E0", bottom: "#FFCC80", accent: "#EF6C00" },
  Millet: { top: "#F1F8E9", bottom: "#C5E1A5", accent: "#558B2F" },
  Sorghum: { top: "#E8EAF6", bottom: "#9FA8DA", accent: "#3949AB" },
  Soybean: { top: "#F9FBE7", bottom: "#DCE775", accent: "#827717" },
  Groundnut: { top: "#EFEBE9", bottom: "#BCAAA4", accent: "#6D4C41" },
  Mustard: { top: "#FFFDE7", bottom: "#FFF59D", accent: "#FDD835" },
  Sunflower: { top: "#FFF8E1", bottom: "#FFD54F", accent: "#FB8C00" },
  Pulses: { top: "#EDE7F6", bottom: "#B39DDB", accent: "#5E35B1" },
  Potato: { top: "#ECEFF1", bottom: "#B0BEC5", accent: "#455A64" },
  Onion: { top: "#FCE4EC", bottom: "#F48FB1", accent: "#C2185B" },
  Tomato: { top: "#FFEBEE", bottom: "#EF9A9A", accent: "#C62828" }
};

const defaultPalette = { top: "#E8F5E9", bottom: "#B2DFDB", accent: "#2E7D32" };

function toDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCropImage(crop: string): string {
  const palette = cropPaletteMap[crop] ?? defaultPalette;
  const safeCrop = crop.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.top}" />
      <stop offset="100%" stop-color="${palette.bottom}" />
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.20" />
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.45" />
    </linearGradient>
  </defs>

  <rect width="1200" height="700" fill="url(#bg)" />
  <circle cx="980" cy="130" r="72" fill="#ffffff" fill-opacity="0.60" />
  <path d="M0 460 C220 390, 420 520, 620 450 C840 375, 980 490, 1200 420 L1200 700 L0 700 Z" fill="url(#ground)" />
  <path d="M0 520 C230 455, 410 575, 620 505 C825 440, 980 560, 1200 490 L1200 700 L0 700 Z" fill="${palette.accent}" fill-opacity="0.16" />

  <g transform="translate(150,130)">
    <line x1="0" y1="280" x2="0" y2="80" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round"/>
    <path d="M0 230 C-45 215,-60 180,-40 145 C-5 155,15 190,0 230 Z" fill="${palette.accent}" fill-opacity="0.55"/>
    <path d="M0 200 C40 182,62 150,52 118 C15 126,-8 160,0 200 Z" fill="${palette.accent}" fill-opacity="0.45"/>
    <path d="M0 160 C-34 150,-45 122,-30 98 C-3 105,10 130,0 160 Z" fill="${palette.accent}" fill-opacity="0.70"/>
  </g>

  <rect x="80" y="70" width="620" height="180" rx="24" fill="#ffffff" fill-opacity="0.70" />
  <text x="120" y="145" font-size="34" font-weight="700" fill="#1f2937" font-family="Inter, Arial, sans-serif">Selected Crop</text>
  <text x="120" y="205" font-size="58" font-weight="800" fill="#0f172a" font-family="Inter, Arial, sans-serif">${safeCrop}</text>
  <text x="120" y="238" font-size="22" fill="#334155" font-family="Inter, Arial, sans-serif">Prediction visual for market price forecasting</text>
</svg>`;

  return toDataUri(svg);
}

export const historicalPrices: PricePoint[] = [
  { date: "2026-04-01", price: 2140 },
  { date: "2026-04-02", price: 2160 },
  { date: "2026-04-03", price: 2135 },
  { date: "2026-04-04", price: 2188 },
  { date: "2026-04-05", price: 2205 },
  { date: "2026-04-06", price: 2222 },
  { date: "2026-04-07", price: 2216 }
];

export const forecastSeries: PredictionPoint[] = [
  { day: "Day 1", predictedPrice: 2230 },
  { day: "Day 2", predictedPrice: 2248 },
  { day: "Day 3", predictedPrice: 2255 },
  { day: "Day 4", predictedPrice: 2270 },
  { day: "Day 5", predictedPrice: 2264 },
  { day: "Day 6", predictedPrice: 2282 },
  { day: "Day 7", predictedPrice: 2296 }
];

export const predictionCards: PredictionSummary[] = [
  { days: 7, value: 2296, changePct: 3.6 },
  { days: 15, value: 2355, changePct: 6.2 },
  { days: 30, value: 2434, changePct: 9.9 }
];

