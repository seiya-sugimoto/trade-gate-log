"use client";

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { TradeEntry } from '@/lib/schemas';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    FileDown,
    FileText,
    Edit,
    Search,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MinusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { json2csv } from 'json-2-csv';

export function TradeTable() {
    const trades = useLiveQuery(() => db.trades.reverse().toArray()) || [];
    const [filter, setFilter] = useState({ symbol: '', result: 'ALL' });
    const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);

    const filteredTrades = useMemo(() => {
        return trades.filter(t => {
            const matchSymbol = t.symbol.toLowerCase().includes(filter.symbol.toLowerCase());
            const matchResult = filter.result === 'ALL' || t.postTrade?.result === filter.result;
            return matchSymbol && matchResult;
        });
    }, [trades, filter]);

    const handleExport = () => {
        const csv = json2csv(filteredTrades);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `trades_export_${format(new Date(), 'yyyyMMdd')}.csv`;
        link.click();
    };

    const handleExportMarkdown = () => {
        let md = `# Trade Log Export - ${format(new Date(), 'yyyy/MM/dd HH:mm')}\n\n`;

        filteredTrades.forEach((t, i) => {
            md += `## ${i + 1}. ${t.symbol} (${t.side}) - ${format(t.createdAt, 'yyyy/MM/dd HH:mm')}\n`;
            md += `- **Result**: ${t.postTrade?.result || 'PENDING'}\n`;
            md += `- **Entry Type**: ${t.entryType}\n`;
            md += `- **Reasons**: ${t.reasons.join(', ')}\n`;
            md += `- **Stop Reason**: ${t.stopReason}\n`;
            md += `- **RR**: ${t.rrCategory}\n`;
            if (t.gateInternal.warnings.length > 0) {
                md += `- **Warnings**:\n  - ${t.gateInternal.warnings.join('\n  - ')}\n`;
                md += `- **Friction Note**: ${t.frictionNote || 'N/A'}\n`;
            }
            md += `- **Entry Reason**: ${t.entryReasonOneLine}\n`;
            md += `- **Learnings**: ${t.postTrade?.learnOneLine || 'None'}\n\n`;
            md += `---\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `trades_export_${format(new Date(), 'yyyyMMdd')}.md`;
        link.click();
    };

    const updateResult = async () => {
        if (!editingTrade) return;
        await db.trades.update(editingTrade.id, { postTrade: editingTrade.postTrade });
        setEditingTrade(null);
    };

    const getResultIcon = (result: string) => {
        switch (result) {
            case 'WIN': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'LOSS': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'BE': return <MinusCircle className="w-4 h-4 text-gray-400" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Trade Log</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search symbol..."
                            className="pl-8"
                            value={filter.symbol}
                            onChange={e => setFilter(prev => ({ ...prev, symbol: e.target.value }))}
                        />
                    </div>
                    <Select value={filter.result} onValueChange={v => setFilter(prev => ({ ...prev, result: v }))}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Results</SelectItem>
                            <SelectItem value="WIN">WIN</SelectItem>
                            <SelectItem value="LOSS">LOSS</SelectItem>
                            <SelectItem value="BE">BE</SelectItem>
                            <SelectItem value="NONE">Unfinished</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                            <FileDown className="w-4 h-4" /> CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="gap-2">
                            <FileText className="w-4 h-4" /> Markdown
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead>Reasons</TableHead>
                            <TableHead>Warnings</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTrades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">トレード記録がありません</TableCell>
                            </TableRow>
                        ) : (
                            filteredTrades.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="text-xs">{format(t.createdAt, 'MM/dd HH:mm')}</TableCell>
                                    <TableCell className="font-bold">{t.symbol}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full font-bold",
                                            t.side === 'BUY' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {t.side}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[150px] truncate space-x-1">
                                        {t.reasons.map(r => <span key={r} className="text-[10px] text-muted-foreground bg-secondary px-1 py-0.5 rounded">{r}</span>)}
                                    </TableCell>
                                    <TableCell>
                                        {t.gateInternal.warnings.length > 0 && (
                                            <Badge variant="destructive" className="h-5 px-1 bg-red-500/20 text-red-400 hover:bg-red-500/20 border-none">
                                                {t.gateInternal.warnings.length} 警告
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getResultIcon(t.postTrade?.result || 'NONE')}
                                            <span className="text-xs font-medium">{t.postTrade?.result || 'PENDING'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setEditingTrade(t)} className="gap-2">
                                            <Edit className="w-3.5 h-3.5" /> Result
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Post-Trade Result Dialog */}
            <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>結果の入力: {editingTrade?.symbol}</DialogTitle>
                        <DialogDescription>{editingTrade?.entryReasonOneLine}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>トレード結果</Label>
                            <Select
                                value={editingTrade?.postTrade?.result}
                                onValueChange={v => setEditingTrade(prev => prev ? ({ ...prev, postTrade: { ...prev.postTrade!, result: v as any } }) : null)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WIN">WIN (利確)</SelectItem>
                                    <SelectItem value="LOSS">LOSS (損切)</SelectItem>
                                    <SelectItem value="BE">BE (建値/微損益)</SelectItem>
                                    <SelectItem value="NONE">未完結</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>ルールを守れたか？</Label>
                            <Select
                                value={editingTrade?.postTrade?.followedRules}
                                onValueChange={v => setEditingTrade(prev => prev ? ({ ...prev, postTrade: { ...prev.postTrade!, followedRules: v as any } }) : null)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="YES">YES</SelectItem>
                                    <SelectItem value="NO">NO</SelectItem>
                                    <SelectItem value="NONE">-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>今回の学び・反省 (一言)</Label>
                            <Textarea
                                placeholder="次回のトレードに活かすポイント"
                                value={editingTrade?.postTrade?.learnOneLine}
                                onChange={e => setEditingTrade(prev => prev ? ({ ...prev, postTrade: { ...prev.postTrade!, learnOneLine: e.target.value } }) : null)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingTrade(null)}>キャンセル</Button>
                        <Button onClick={updateResult}>結果を保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
