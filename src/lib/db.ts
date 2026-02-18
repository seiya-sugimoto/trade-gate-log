import Dexie, { type EntityTable } from 'dexie';
import { type TradeEntry, type Settings } from './schemas';

const db = new Dexie('TradeGateLogDB') as Dexie & {
    trades: EntityTable<TradeEntry, 'id'>;
    settings: EntityTable<Settings & { id: number }, 'id'>;
};

db.version(1).stores({
    trades: 'id, createdAt, symbol, result',
    settings: 'id'
});

export { db };
