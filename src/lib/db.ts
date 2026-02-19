import Dexie, { type EntityTable } from 'dexie';
import { type TradeEntry, type Settings } from './schemas';

const db = new Dexie('TradeGateLogDB') as Dexie & {
    trades: EntityTable<TradeEntry, 'id'>;
    settings: EntityTable<Settings & { id: string }, 'id'>;
};

db.version(2).stores({
    trades: 'id, createdAt, symbol, result',
    settings: 'id'
});

export { db };
