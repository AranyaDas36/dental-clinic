export const PRICE_TYPES = ['fixed', 'starting_at', 'range', 'quote'] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const DEFAULT_CURRENCY = 'INR' as const;
