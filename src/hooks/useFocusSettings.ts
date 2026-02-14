import { useCallback, useState } from 'react';

export interface FocusSettings {
    autoLongBreak: boolean;
    longBreakEvery: number;
}

const DEFAULT_SETTINGS: FocusSettings = {
    autoLongBreak: true,
    longBreakEvery: 4,
};

const STORAGE_KEY = 'pomodoro:focusSettings';

export const useFocusSettings = () => {
    const [settings, setSettings] = useState<FocusSettings>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        try {
            return JSON.parse(raw) as FocusSettings;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const updateSettings = useCallback((next: Partial<FocusSettings>) => {
        setSettings((prev) => {
            const updated = {
                ...prev,
                ...next,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return {
        settings,
        updateSettings,
    };
};
