import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode, type FC } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- Types ---

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
    work: number;
    shortBreak: number;
    longBreak: number;
}

export interface HistoryItem {
    id: string;
    taskName: string;
    type: TimerMode;
    startTime: string; // ISO String
    endTime: string;   // ISO String
    durationSeconds: number;
}

interface TimerContextType {
    // Timer State
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;

    // Timer Actions
    toggleTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: TimerMode) => void;

    // Task State
    activeTask: string | null;
    isTaskCompleted: boolean;
    setTask: (task: string) => void;
    completeTask: () => void;
    clearTask: () => void;

    // Settings State
    settings: TimerSettings;
    updateSettings: (newSettings: Partial<TimerSettings>) => void;

    // History State
    history: HistoryItem[];
    clearHistory: () => void;
    exportHistory: () => void;
}

// --- Defaults ---

const DEFAULT_SETTINGS: TimerSettings = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

// --- Context ---

const TimerContext = createContext<TimerContextType | null>(null);

export const useTimerContext = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
};

// --- Provider ---

export const TimerProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // --- State: Settings & History (Persisted) ---
    const [settings, setSettings] = useLocalStorage<TimerSettings>('pomodoro-settings', DEFAULT_SETTINGS);
    const [history, setHistory] = useLocalStorage<HistoryItem[]>('pomodoro-history', []);

    // --- State: Timer ---
    const [mode, setModeState] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(settings.work);
    const [isRunning, setIsRunning] = useState(false);

    const intervalRef = useRef<number | null>(null);

    // --- State: Task ---
    const [activeTask, setActiveTaskState] = useState<string | null>(null);
    const [isTaskCompleted, setIsTaskCompleted] = useState(false);

    // Helper to log history
    const logHistory = useCallback((completedFromZero: boolean) => {
        const duration = completedFromZero
            ? settings[mode]
            : settings[mode] - timeLeft; // If finished early (e.g. task done)

        // Don't log if duration is basically 0
        if (duration < 5) return;

        const now = new Date();
        const startTime = new Date(now.getTime() - duration * 1000);

        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            taskName: activeTask || (mode === 'work' ? 'Focus Session' : 'Break'),
            type: mode,
            startTime: startTime.toISOString(),
            endTime: now.toISOString(),
            durationSeconds: duration
        };

        setHistory((prev) => [newItem, ...prev]);
    }, [mode, settings, timeLeft, activeTask, setHistory]);

    // --- Logic: Timer Ticking ---
    const tick = useCallback(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                setIsRunning(false);
                logHistory(true); // Log full duration
                // Play sound here in future
                return 0;
            }
            return prev - 1;
        });
    }, [logHistory]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(tick, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, tick]);


    // --- Logic: Document Title ---
    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');

        let title = `${minutes}:${seconds}`;
        if (activeTask) title += ` - ${activeTask}`;
        else title += ` - ${mode === 'work' ? 'Focus' : 'Break'}`;

        document.title = title;

    }, [timeLeft, activeTask, mode]);


    // --- Actions: Timer ---
    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(settings[mode]);
    }, [settings, mode]);

    const setMode = (newMode: TimerMode) => {
        setModeState(newMode);
        setIsRunning(false);
        setTimeLeft(settings[newMode]);
    };

    // --- Actions: Settings ---
    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // If not running, update current time immediately to reflect change
        if (!isRunning && mode in newSettings) {
            const modeKey = mode as keyof TimerSettings;
            if (newSettings[modeKey]) {
                setTimeLeft(updated[modeKey]);
            }
        }
    };

    // --- Actions: Tasks ---
    const setTask = (task: string) => {
        setActiveTaskState(task);
        setIsTaskCompleted(false);
    };

    const completeTask = () => {
        setIsTaskCompleted(true);
        setIsRunning(false); // Stop timer when task is done? or keep running? Usually stop.
        logHistory(false); // Log partial duration
    };

    const clearTask = () => {
        setActiveTaskState(null);
        setIsTaskCompleted(false);
    };

    // --- Actions: History ---
    const clearHistory = () => setHistory([]);

    const exportHistory = () => {
        const headers = ['id', 'taskName', 'type', 'startTime', 'endTime', 'durationSeconds'];
        const csvContent = [
            headers.join(','),
            ...history.map(item => [
                item.id,
                `"${item.taskName.replace(/"/g, '""')}"`, // Escape quotes
                item.type,
                item.startTime,
                item.endTime,
                item.durationSeconds
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pomodoro_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <TimerContext.Provider value={{
            mode,
            timeLeft,
            isRunning,
            toggleTimer,
            resetTimer,
            setMode,
            activeTask,
            isTaskCompleted,
            setTask,
            completeTask,
            clearTask,
            settings,
            updateSettings,
            history,
            clearHistory,
            exportHistory
        }}>
            {children}
        </TimerContext.Provider>
    );
};
