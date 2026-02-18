"use client";

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Loader2, AlertTriangle, TrendingUp, BarChart3, ListChecks } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export function AnalysisDashboard() {
    const trades = useLiveQuery(() => db.trades.toArray()) || [];
    const { geminiApiKey } = useUIStore();
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    const stats = useMemo(() => {
        const finished = trades.filter(t => t.postTrade?.result && t.postTrade.result !== 'NONE');
        const wins = finished.filter(t => t.postTrade?.result === 'WIN').length;
        const losses = finished.filter(t => t.postTrade?.result === 'LOSS').length;
        const be = finished.filter(t => t.postTrade?.result === 'BE').length;
        const warningCount = trades.filter(t => t.gateInternal.warnings.length > 0).length;

        const winRate = finished.length > 0 ? (wins / finished.length) * 100 : 0;
        const warningRate = trades.length > 0 ? (warningCount / trades.length) * 100 : 0;

        const pieData = [
            { name: 'WIN', value: wins, color: '#22c55e' },
            { name: 'LOSS', value: losses, color: '#ef4444' },
            { name: 'BE', value: be, color: '#94a3b8' },
        ];

        return { total: trades.length, finished: finished.length, winRate, warningRate, pieData, wins, losses, be };
    }, [trades]);

    const runAIAnalysis = async () => {
        if (!geminiApiKey) {
            alert('Settings画面で Gemini API Key を設定してください。');
            return;
        }

        setAnalyzing(true);
        try {
            const filteredTrades = trades.map(t => ({
                symbol: t.symbol,
                side: t.side,
                reasons: t.reasons,
                warnings: t.gateInternal.warnings,
                result: t.postTrade?.result,
                learn: t.postTrade?.learnOneLine,
                friction: t.frictionNote
            }));

            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: geminiApiKey, trades: filteredTrades }),
            });

            const data = await res.json();
            if (data.report) {
                setReport(data.report);
            } else {
                alert('Analysis failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Failed to connect to analysis server.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
                <Button onClick={runAIAnalysis} disabled={analyzing || trades.length === 0} className="gap-2">
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                    AI分析を実行
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardDescription className="text-xs uppercase">Total Trades</CardDescription><CardTitle className="text-2xl">{stats.total}</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardDescription className="text-xs uppercase">Win Rate</CardDescription><CardTitle className="text-2xl text-green-500">{stats.winRate.toFixed(1)}%</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardDescription className="text-xs uppercase">Warning Rate</CardDescription><CardTitle className="text-2xl text-yellow-500">{stats.warningRate.toFixed(1)}%</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardDescription className="text-xs uppercase">Finished</CardDescription><CardTitle className="text-2xl">{stats.finished}</CardTitle></CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle className="text-lg">Result Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {stats.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-medium">
                            <span className="text-green-500">WIN: {stats.wins}</span>
                            <span className="text-red-500">LOSS: {stats.losses}</span>
                            <span className="text-slate-400">BE: {stats.be}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">AI 診断レポート</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[250px]">
                        {!geminiApiKey ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <AlertTriangle className="w-8 h-8 opacity-20" />
                                <p>Settingsで Gemini API Key を設定してください</p>
                            </div>
                        ) : !report ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <p>「AI分析を実行」をクリックして診断を開始してください</p>
                                <p className="text-[10px]">※トレード件数が多いほど精度が上がります</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none text-sm whitespace-pre-line leading-relaxed pb-4">
                                {report}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
