"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { repo } from '@/lib/tradesRepo';
import { checkHardStops } from '@/lib/gate-logic';
import { TradeEntry, TradeEntrySchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Save, Info } from 'lucide-react';

const REASONS = ['SR', 'CHANNEL', 'NECKLINE', 'EMA_REJECT', 'BREAK_RETEST'];
const TP_CANDIDATES = ['NEXT_TF_SR', 'CHANNEL_EDGE', 'SWING_HL'];
const FORBIDDEN_TAGS = ['STRETCHED', 'DANGO', 'AGAINST_HTF', 'PREMATURE_REVERSAL', 'HOPE_HOLD'];

export function EntryForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<TradeEntry>>({
        side: 'BUY',
        higherTF: { month: 'UP', week: 'UP', day: 'UP' },
        execTF: 'M15',
        ema25State: 'ABOVE',
        structure: 'HH',
        reasons: [],
        entryType: 'PULLBACK',
        wavePosition: 'MID',
        emaDistance: 'MID',
        dango: 'NO',
        tpCandidates: [],
        rrCategory: 'BTW_1_2',
        forbiddenTags: [],
        entryReasonOneLine: '',
        stopReason: '',
        schemaVersion: 1,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const warnings = useMemo(() => checkHardStops(formData as TradeEntry), [formData]);

    const handleInputChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...(prev[parent as keyof TradeEntry] as any), [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCheckboxChange = (field: 'reasons' | 'tpCandidates' | 'forbiddenTags', value: string) => {
        const list = formData[field] || [];
        const newList = list.includes(value)
            ? list.filter(i => i !== value)
            : [...list, value];
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const handleSave = async () => {
        try {
            const fullData = {
                ...formData,
                id: uuidv4(),
                createdAt: new Date(),
                gateInternal: { warnings, gateScore: 0 },
                postTrade: { result: 'NONE', followedRules: 'NONE', deviationTags: [], learnOneLine: '' },
                schemaVersion: 1
            };

            // Validation
            const result = TradeEntrySchema.safeParse(fullData);
            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                result.error.issues.forEach(issue => {
                    fieldErrors[issue.path.join('.')] = issue.message;
                });
                setErrors(fieldErrors);
                return;
            }

            if (warnings.length > 0 && !formData.frictionNote) {
                setErrors({ frictionNote: '警告を承知でエントリーする理由（Friction Note）を入力してください' });
                return;
            }

            await repo.saveTrade(fullData as TradeEntry);
            router.push('/log');
        } catch (error) {
            console.error('Failed to save trade:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">New Entry Gate</h1>
                <Button onClick={handleSave} size="lg" className="gap-2">
                    <Save className="w-4 h-4" />
                    保存してエントリー
                </Button>
            </div>

            {warnings.length > 0 && (
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader className="flex flex-row items-center gap-2 py-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <CardTitle className="text-destructive text-lg">エントリー警告</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                        <ul className="list-disc list-inside text-sm text-destructive font-medium space-y-1">
                            {warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>1. 環境認識 (HTF)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>売買方向</Label>
                                <Select value={formData.side} onValueChange={(v) => handleInputChange('side', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUY">BUY</SelectItem>
                                        <SelectItem value="SELL">SELL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Symbol</Label>
                                <Input placeholder="EURUSD, Gold..." value={formData.symbol} onChange={e => handleInputChange('symbol', e.target.value)} />
                                {errors.symbol && <p className="text-xs text-destructive">{errors.symbol}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {['month', 'week', 'day'].map((tf) => (
                                <div key={tf} className="space-y-2">
                                    <Label className="capitalize">{tf}</Label>
                                    <Select
                                        value={(formData.higherTF as any)?.[tf]}
                                        onValueChange={(v) => handleInputChange(`higherTF.${tf}`, v)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UP">UP</SelectItem>
                                            <SelectItem value="DOWN">DOWN</SelectItem>
                                            <SelectItem value="RANGE">RANGE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>2. エントリー詳細</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>執行足</Label>
                                <Input value={formData.execTF} onChange={e => handleInputChange('execTF', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>EMA 25 状態</Label>
                                <Select value={formData.ema25State} onValueChange={v => handleInputChange('ema25State', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ABOVE">ABOVE</SelectItem>
                                        <SelectItem value="BELOW">BELOW</SelectItem>
                                        <SelectItem value="ON">ON</SelectItem>
                                        <SelectItem value="OFF">OFF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>構造 (Structure)</Label>
                            <Select value={formData.structure} onValueChange={v => handleInputChange('structure', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HH">HH (High High)</SelectItem>
                                    <SelectItem value="LL">LL (Low Low)</SelectItem>
                                    <SelectItem value="RANGE">RANGE</SelectItem>
                                    <SelectItem value="REVERSAL_CANDIDATE">逆張り候補</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>3. チェックリスト & 根拠</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <Label>エントリー根拠 (Reasons)</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {REASONS.map(r => (
                                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <Checkbox checked={formData.reasons?.includes(r)} onCheckedChange={() => handleCheckboxChange('reasons', r)} />
                                        {r}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>波の位置</Label>
                                <Select value={formData.wavePosition} onValueChange={v => handleInputChange('wavePosition', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="START">START</SelectItem>
                                        <SelectItem value="MID">MID</SelectItem>
                                        <SelectItem value="END">END (伸び切り)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>EMA乖離</Label>
                                <Select value={formData.emaDistance} onValueChange={v => handleInputChange('emaDistance', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SMALL">SMALL (引きつけ済)</SelectItem>
                                        <SelectItem value="MID">MID</SelectItem>
                                        <SelectItem value="LARGE">LARGE (乖離大)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>団子 (Dango)</Label>
                                <Select value={formData.dango} onValueChange={v => handleInputChange('dango', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="YES">YES</SelectItem>
                                        <SelectItem value="NO">NO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>リスクリワード (RR)</Label>
                                <Select value={formData.rrCategory} onValueChange={v => handleInputChange('rrCategory', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LT_1">1:1 未満 (NG)</SelectItem>
                                        <SelectItem value="BTW_1_2">1:1 〜 1:2</SelectItem>
                                        <SelectItem value="GE_2">1:2 以上</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>TP 候補</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {TP_CANDIDATES.map(r => (
                                        <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <Checkbox checked={formData.tpCandidates?.includes(r)} onCheckedChange={() => handleCheckboxChange('tpCandidates', r)} />
                                            {r}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader><CardTitle>4. 言語化 (必須)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>損切りを置くべき明確な根拠</Label>
                            <Input placeholder="なぜそこで切るのか？（8文字以上）" value={formData.stopReason} onChange={e => handleInputChange('stopReason', e.target.value)} />
                            {errors.stopReason && <p className="text-xs text-destructive">{errors.stopReason}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>一言エントリー根拠 (20-60字)</Label>
                            <Textarea
                                placeholder="今回のトレードで最も重要なポイントは？"
                                value={formData.entryReasonOneLine}
                                onChange={e => handleInputChange('entryReasonOneLine', e.target.value)}
                                className="h-20"
                            />
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                <span>{formData.entryReasonOneLine?.length || 0} / 60</span>
                                {errors.entryReasonOneLine && <span className="text-destructive font-medium">{errors.entryReasonOneLine}</span>}
                            </div>
                        </div>

                        {warnings.length > 0 && (
                            <div className="space-y-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Friction Note (警告無視エントリーの理由)</span>
                                </div>
                                <Input
                                    placeholder="警告が出ているが、あえて入る積極的な理由は？"
                                    value={formData.frictionNote}
                                    onChange={e => handleInputChange('frictionNote', e.target.value)}
                                    className="bg-white border-destructive/30 focus-visible:ring-destructive"
                                />
                                {errors.frictionNote && <p className="text-xs text-destructive">{errors.frictionNote}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pb-12">
                <Button onClick={handleSave} size="lg" className="w-full md:w-auto px-12 gap-2">
                    <Save className="w-5 h-5" />
                    保存してエントリー
                </Button>
            </div>
        </div>
    );
}
