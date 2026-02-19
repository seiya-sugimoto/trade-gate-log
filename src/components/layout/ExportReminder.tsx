"use client";

import { useState, useEffect } from 'react';
import { repo } from '@/lib/tradesRepo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, X } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';

export function ExportReminder() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkReminder = async () => {
            const settings = await repo.getSettings();
            const trades = await repo.getAllTrades();

            if (!settings || !settings.reminderEnabled) return;

            const lastExported = settings.lastExportedAt ? new Date(settings.lastExportedAt) : null;
            const daysSinceExport = lastExported ? differenceInDays(new Date(), lastExported) : 999;

            // Show if 7+ days pass AND we have 10+ trades
            if (daysSinceExport >= 7 && trades.length >= 10) {
                // Check if snoozed for this specific week (session check or custom flag)
                const isSnoozed = sessionStorage.getItem('export-reminder-snoozed');
                if (!isSnoozed) {
                    setIsVisible(true);
                }
            }
        };

        checkReminder();
    }, []);

    const handleSnooze = () => {
        sessionStorage.setItem('export-reminder-snoozed', 'true');
        setIsVisible(false);
    };

    const handleDisable = async () => {
        if (confirm('バックアップのリマインダーを無効にしますか？（設定画面から再度有効にできます）')) {
            await repo.saveSettings({ reminderEnabled: false });
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <Card className="w-80 shadow-2xl border-primary/20 bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        週次バックアップの推奨
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSnooze}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        最後のエクスポートから1週間が経過しました。不測の事態に備え、JSON形式でデータをバックアップしておくことをお勧めします。
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-0">
                    <Button className="w-full text-xs h-8" onClick={() => { setIsVisible(false); router.push('/settings'); }}>
                        設定画面へ
                    </Button>
                    <div className="flex justify-between w-full">
                        <Button variant="ghost" className="text-[10px] h-6 px-2 text-muted-foreground" onClick={handleSnooze}>
                            今週は表示しない
                        </Button>
                        <Button variant="ghost" className="text-[10px] h-6 px-2 text-muted-foreground" onClick={handleDisable}>
                            リマインダーを無効化
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
