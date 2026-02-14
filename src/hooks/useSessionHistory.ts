import { useCallback, useMemo, useState } from 'react';

export interface SessionEntry {
    id: string;
    mode: string;
    durationMs: number;
    completedAt: string;
    task?: string;
}

const STORAGE_KEY = 'pomodoro:sessions';

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();


export const useSessionHistory = () => {
    const [sessions, setSessions] = useState<SessionEntry[]>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) as SessionEntry[];
        } catch {
            return [];
        }
    });

    const focusCount = useMemo(() => {
        return sessions.filter((session) => session.mode === 'Focus').length;
    }, [sessions]);

    const addSession = useCallback((entry: SessionEntry) => {
        setSessions((prev) => {
            const next = [entry, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const todaySessions = useMemo(() => {
        const today = new Date();
        return sessions.filter((session) => isSameDay(new Date(session.completedAt), today));
    }, [sessions]);

    const todayFocusCount = useMemo(() => {
        return todaySessions.filter((session) => session.mode === 'Focus').length;
    }, [todaySessions]);

    const todayFocusMinutes = useMemo(() => {
        return todaySessions
            .filter((session) => session.mode === 'Focus')
            .reduce((total, session) => total + Math.round(session.durationMs / 60000), 0);
    }, [todaySessions]);


    const downloadCsv = useCallback(() => {
        const header = ['completedAt', 'mode', 'durationMinutes', 'task'];
        const rows = sessions.map((session) => {
            const minutes = Math.round(session.durationMs / 60000);
            return [session.completedAt, session.mode, `${minutes}`, session.task ?? ''];
        });
        const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pomodoro-sessions.csv';
        link.click();
        URL.revokeObjectURL(url);
    }, [sessions]);

    return { sessions, todaySessions, addSession, downloadCsv, focusCount, todayFocusCount, todayFocusMinutes };
};
