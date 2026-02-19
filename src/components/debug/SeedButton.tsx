"use client";

import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { TradeEntry } from '@/lib/schemas';

export function SeedButton() {
    const seedData = async () => {
        const demoTrades: TradeEntry[] = [
            {
                id: uuidv4(),
                createdAt: new Date(Date.now() - 86400000 * 2),
                symbol: 'USDJPY',
                side: 'BUY',
                higherTF: { month: 'UP', week: 'UP', day: 'UP' },
                execTF: 'M15',
                ema25State: 'ABOVE',
                structure: 'HH',
                reasons: ['SR', 'EMA_REJECT'],
                entryType: 'PULLBACK',
                wavePosition: 'MID',
                emaDistance: 'SMALL',
                dango: 'NO',
                stopReason: '直近安値の少し下',
                tpCandidates: ['NEXT_TF_SR'],
                rrCategory: 'GE_2',
                forbiddenTags: [],
                entryReasonOneLine: '上昇トレンド中の押し目、25EMAでの反発を確認。',
                gateInternal: { warnings: [], gateScore: 80 },
                postTrade: {
                    result: 'WIN',
                    followedRules: 'YES',
                    deviationTags: [],
                    learnOneLine: 'セオリー通りの良いトレード。'
                },
                schemaVersion: 1
            },
            {
                id: uuidv4(),
                createdAt: new Date(Date.now() - 86400000),
                symbol: 'EURUSD',
                side: 'SELL',
                higherTF: { month: 'DOWN', week: 'DOWN', day: 'UP' },
                execTF: 'H1',
                ema25State: 'BELOW',
                structure: 'LL',
                reasons: ['BREAK_RETEST'],
                entryType: 'BREAKOUT',
                wavePosition: 'END',
                emaDistance: 'LARGE',
                dango: 'YES',
                stopReason: '戻り高値',
                tpCandidates: ['SWING_HL'],
                rrCategory: 'LT_1',
                forbiddenTags: ['STRETCHED', 'DANGO'],
                entryReasonOneLine: '無理やりエントリー。伸び切りだがブレイクを狙った。',
                frictionNote: 'どうしてもチャンスに見えてしまった。',
                gateInternal: {
                    warnings: [
                        '「団子」状態でのエントリーは禁止（優位性が低い）',
                        '伸び切り（波動終焉）かつ 25EMA乖離 は高リスク',
                        'リスクリワードが 1:1 未満のエントリーは禁止'
                    ],
                    gateScore: 20
                },
                postTrade: {
                    result: 'LOSS',
                    followedRules: 'NO',
                    deviationTags: [],
                    learnOneLine: '警告を無視した結果。団子でのエントリーはやめる。'
                },
                schemaVersion: 1
            }
        ];

        try {
            await db.trades.bulkAdd(demoTrades);
            alert('Demo data seeded. Refresh the log page.');
            window.location.reload();
        } catch (error) {
            console.error('Seed failed:', error);
            alert('Seed failed. Check console for details.');
        }
    };

    return (
        <Button variant="ghost" size="sm" onClick={seedData} className="text-muted-foreground">
            <Database className="w-3 h-3 mr-1" /> Seed Demo Data
        </Button>
    );
}
