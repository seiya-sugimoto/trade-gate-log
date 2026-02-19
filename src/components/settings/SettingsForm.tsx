"use client";

import { useUIStore } from '@/lib/store';
import { repo } from '@/lib/tradesRepo';
import { format } from 'date-fns';
import { json2csv } from 'json-2-csv';
import { TradeEntry } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Download, Upload, Trash2, Key, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function SettingsForm() {
    const { geminiApiKey, setGeminiApiKey, isPro, setIsPro } = useUIStore();
    const [localKey, setLocalKey] = useState(geminiApiKey);

    const handleSaveKey = () => {
        setGeminiApiKey(localKey);
        alert('API Key saved locally.');
    };

    const handleExportJSON = async () => {
        const trades = await repo.getAllTrades();
        const settings = await repo.getSettings();
        const data = JSON.stringify({ trades, settings, exportedAt: new Date().toISOString() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trade-gate-backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();

        await repo.saveSettings({ lastExportedAt: new Date().toISOString() });
    };

    const handleExportCSV = async () => {
        const trades = await repo.getAllTrades();

        // Flatten trades for CSV
        const flattened = trades.map(t => ({
            id: t.id,
            date: format(t.createdAt, 'yyyy-MM-dd HH:mm'),
            symbol: t.symbol,
            side: t.side,
            entryType: t.entryType,
            reasons: t.reasons.join(';'),
            stopReason: t.stopReason,
            entryReason: t.entryReasonOneLine,
            rr: t.rrCategory,
            warnings: t.gateInternal.warnings.join(';'),
            frictionNote: t.frictionNote || '',
            result: t.postTrade?.result || 'PENDING',
            followedRules: t.postTrade?.followedRules || '',
            learnings: t.postTrade?.learnOneLine || ''
        }));

        const csv = json2csv(flattened);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `trade-log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();

        await repo.saveSettings({ lastExportedAt: new Date().toISOString() });
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (re: any) => {
                try {
                    const data = JSON.parse(re.target.result);
                    if (data.trades && Array.isArray(data.trades)) {
                        if (confirm('既存のデータはすべて上書きされます。よろしいですか？')) {
                            // Ensure dates are parsed
                            const sanitizedTrades = data.trades.map((t: any) => ({
                                ...t,
                                createdAt: new Date(t.createdAt)
                            }));
                            await repo.importData({ trades: sanitizedTrades, settings: data.settings });
                            alert('Data imported successfully.');
                            window.location.reload();
                        }
                    } else {
                        alert('Invalid backup file format.');
                    }
                } catch (err) {
                    alert('Failed to import data: ' + (err as Error).message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const clearAllData = async () => {
        if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
            await repo.clearAllData();
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        <CardTitle>AI 設定 (Gemini API)</CardTitle>
                    </div>
                    <CardDescription>
                        AI分析機能を使用するための API Key を設定します。Key はブラウザにのみ保存され、サーバーには送信されません。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Gemini API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="api-key"
                                type="password"
                                placeholder="AIza..."
                                value={localKey}
                                onChange={e => setLocalKey(e.target.value)}
                            />
                            <Button onClick={handleSaveKey}>保存</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-primary">
                                Google AI Studio
                            </a> で無料で取得可能です。
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        <CardTitle>データ管理</CardTitle>
                    </div>
                    <CardDescription>すべてのデータはブラウザの IndexedDB に保存されています。</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                        <Download className="w-4 h-4" /> CSV エクスポート
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleExportJSON}>
                        <Download className="w-4 h-4" /> JSON バックアップ
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleImportData}>
                        <Upload className="w-4 h-4" /> データを復元
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={clearAllData}>
                        <Trash2 className="w-4 h-4" /> 全データ削除
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <CardTitle>プラン設定</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold">{isPro ? 'Pro Member' : 'Free Plan'}</p>
                            <p className="text-sm text-muted-foreground">
                                {isPro ? '無制限にトレードを記録できます。' : '月15件まで記録可能です。'}
                            </p>
                        </div>
                        <Button variant={isPro ? "outline" : "default"} onClick={() => setIsPro(!isPro)}>
                            {isPro ? "Freeに戻す(デバッグ用)" : "Proにアップグレード"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
