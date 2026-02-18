import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    isPro: boolean;
    setIsPro: (isPro: boolean) => void;
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            isPro: false,
            setIsPro: (isPro) => set({ isPro }),
            geminiApiKey: '',
            setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
        }),
        {
            name: 'trade-gate-ui-storage',
        }
    )
);
