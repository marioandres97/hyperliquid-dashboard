import { z } from 'zod';

export const tradeSchema = z.object({
  asset: z.string().min(1, "Asset is required"),
  baseAsset: z.enum(['USDT', 'USDC', 'USD', 'BTC', 'ETH']),
  type: z.enum(['long', 'short']),
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive().optional().nullable(),
  size: z.number().positive("Size must be positive"),
  fees: z.number().nonnegative("Fees cannot be negative").default(0),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => !data.closedAt || !data.openedAt || data.closedAt > data.openedAt,
  { message: "Close date must be after open date", path: ["closedAt"] }
);

export type TradeInput = z.infer<typeof tradeSchema>;
