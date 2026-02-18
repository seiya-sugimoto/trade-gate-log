"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    BrainCircuit,
    Settings,
    ShieldCheck
} from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { SeedButton } from '../debug/SeedButton';

const navItems = [
    { name: '新規エントリー', href: '/', icon: PlusCircle },
    { name: 'トレード一覧', href: '/log', icon: History },
    { name: 'AI分析', href: '/analysis', icon: BrainCircuit },
    { name: '設定', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isPro } = useUIStore();

    return (
        <aside className="w-64 border-r bg-slate-50/50 flex flex-col h-full">
            <div className="p-6 flex items-center gap-2 border-b">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl tracking-tight">Trade Gate</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t space-y-4">
                <div className={cn(
                    "p-3 rounded-lg border flex flex-col gap-1 items-center text-center",
                    isPro ? "bg-primary/5 border-primary/20" : "bg-white"
                )}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</span>
                    <span className="font-bold">{isPro ? 'Pro Member' : 'Free Plan'}</span>
                    {!isPro && (
                        <div className="mt-2 w-full">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Usage</span>
                                <span>0 / 15</span>
                            </div>
                            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-0" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center">
                    <SeedButton />
                </div>
            </div>
        </aside>
    );
}
