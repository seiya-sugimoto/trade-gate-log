import { db } from './db';
import { TradeEntry, Settings, SettingsSchema } from './schemas';

/**
 * TradeRepository
 * データベース（IndexedDB）へのアクセスをカプセル化するクラス。
 * 将来の Supabase などの外部 DB への移行を容易にするための抽象化レイヤー。
 */
export class TradeRepository {
    private static instance: TradeRepository;

    private constructor() { }

    public static getInstance(): TradeRepository {
        if (!TradeRepository.instance) {
            TradeRepository.instance = new TradeRepository();
        }
        return TradeRepository.instance;
    }

    // --- Trade CRUD ---

    async getAllTrades(): Promise<TradeEntry[]> {
        return await db.trades.reverse().sortBy('createdAt');
    }

    async saveTrade(trade: TradeEntry): Promise<string> {
        return await db.trades.add({
            ...trade,
            schemaVersion: 1 // 現在のスキーマバージョン
        });
    }

    async updateTrade(id: string, data: Partial<TradeEntry>): Promise<number> {
        return await db.trades.update(id, data);
    }

    async deleteTrade(id: string): Promise<void> {
        await db.trades.delete(id);
    }

    // --- Settings CRUD ---

    async getSettings(): Promise<Settings | null> {
        const settings = await db.settings.get('app-settings' as any);
        if (!settings) return null;
        const result = SettingsSchema.safeParse(settings);
        return result.success ? result.data : null;
    }

    async saveSettings(settings: Partial<Settings>): Promise<void> {
        const current = await this.getSettings();
        const updated: Settings & { id: string } = {
            theme: current?.theme || 'light',
            isPro: current?.isPro ?? false,
            reminderEnabled: current?.reminderEnabled ?? true,
            schemaVersion: current?.schemaVersion ?? 1,
            ...settings,
            id: 'app-settings'
        };
        await db.settings.put(updated as any);
    }

    // --- Maintenance ---

    async clearAllData(): Promise<void> {
        await db.trades.clear();
        await db.settings.delete('app-settings' as any);
    }

    async importData(data: { trades: TradeEntry[], settings?: Settings }): Promise<void> {
        await db.transaction('rw', db.trades, db.settings, async () => {
            await db.trades.clear();
            await db.trades.bulkAdd(data.trades);
            if (data.settings) {
                await db.settings.put({ ...data.settings, id: 'app-settings' } as any);
            }
        });
    }
}

export const repo = TradeRepository.getInstance();
