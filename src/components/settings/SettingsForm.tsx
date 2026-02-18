"use client";

import { useUIStore } from '@/lib/store';
import { db } from '@/lib/db';
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

    const handleExportData = async () => {
        const trades = await db.trades.toArray();
        const data = JSON.stringify({ trades, settings: { isPro } }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trade_gate_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
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
                    if (data.trades) {
                        await db.trades.clear();
                        await db.trades.bulkAdd(data.trades.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })));
                        alert('Data imported successfully.');
                        window.location.reload();
                    }
                } catch (err) {
                    alert('Failed to import data.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const clearAllData = async () => {
        if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
            await db.trades.clear();
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
                    <Button variant="outline" className="gap-2" onClick={handleExportData}>
                        <Download className="w-4 h-4" /> JSON バックアップ
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleImportData}>
                        <Upload className="w-4 h-4" /> データを復元
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={clearAllData}>
                        <Trash2 className="w-4 h-4" /> 全削除
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
