import { z } from 'zod';

export const TradeEntrySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  symbol: z.string().min(1, '銘柄を入力してください'),
  side: z.enum(['BUY', 'SELL']),
  higherTF: z.object({
    month: z.enum(['UP', 'DOWN', 'RANGE']),
    week: z.enum(['UP', 'DOWN', 'RANGE']),
    day: z.enum(['UP', 'DOWN', 'RANGE']),
  }),
  execTF: z.string(),
  ema25State: z.enum(['ABOVE', 'BELOW', 'ON', 'OFF']),
  structure: z.enum(['HH', 'LL', 'RANGE', 'REVERSAL_CANDIDATE']),
  reasons: z.array(z.string()),
  entryType: z.enum(['PULLBACK', 'RETRACE', 'BREAKOUT', 'REVERSAL_DB_DT']),
  wavePosition: z.enum(['START', 'MID', 'END']),
  emaDistance: z.enum(['SMALL', 'MID', 'LARGE']),
  dango: z.enum(['YES', 'NO']),
  stopReason: z.string().min(1, '損切り根拠を入力してください'),
  tpCandidates: z.array(z.string()),
  rrCategory: z.enum(['LT_1', 'BTW_1_2', 'GE_2']),
  forbiddenTags: z.array(z.string()),
  entryReasonOneLine: z.string().min(20, '20文字以上で入力してください').max(60, '60文字以内で入力してください'),
  skipConditionOneLine: z.string().optional(),
  chartUrl: z.string().url().optional().or(z.literal('')),
  frictionNote: z.string().optional(),
  gateInternal: z.object({
    warnings: z.array(z.string()),
    gateScore: z.number(),
  }),
  postTrade: z.object({
    result: z.enum(['WIN', 'LOSS', 'BE', 'NONE']).default('NONE'),
    followedRules: z.enum(['YES', 'NO', 'NONE']).default('NONE'),
    deviationTags: z.array(z.string()).default([]),
    learnOneLine: z.string().default(''),
  }).optional(),
  schemaVersion: z.number().default(1),
});

export type TradeEntry = z.infer<typeof TradeEntrySchema>;

export const SettingsSchema = z.object({
  geminiApiKey: z.string().optional(),
  isPro: z.boolean().default(false),
  theme: z.enum(['light', 'dark']).default('light'),
  lastExportedAt: z.string().optional(), // ISO String
  reminderEnabled: z.boolean().default(true),
  schemaVersion: z.number().default(1),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type AppSettings = Settings; // Alias for repository
