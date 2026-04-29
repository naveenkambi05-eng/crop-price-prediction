export type NavItem = {
  label: string;
  path: string;
};

export type PricePoint = {
  date: string;
  price: number;
};

export type PredictionPoint = {
  day: string;
  predictedPrice: number;
};

export type PredictionSummary = {
  days: 7 | 15 | 30;
  value: number;
  changePct: number;
};

