import { useCallback, useState } from 'react';

export type TimerMode = 'Focus' | 'Short Break' | 'Long Break';

export type TimerSettings = Record<TimerMode, number>;

const DEFAULT_SETTINGS: TimerSettings = {
    Focus: 25,
    'Short Break': 5,
    'Long Break': 15,
};

const STORAGE_KEY = 'pomodoro:timerSettings';

export const useTimerSettings = () => {
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        try {
            return JSON.parse(raw) as TimerSettings;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const updateDuration = useCallback((mode: TimerMode, minutes: number) => {
        setSettings((prev) => {
            const next = {
                ...prev,
                [mode]: Math.max(1, Math.min(60, minutes)), // Clamp between 1-60 minutes
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }, []);

    return {
        settings,
        updateDuration,
        resetToDefaults,
    };
};
