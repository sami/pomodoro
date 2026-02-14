import { useCallback, useState } from 'react';

interface TaskState {
    title: string;
}

const STORAGE_KEY = 'pomodoro:tasks';

const defaultState: TaskState = {
    title: '',
};

export const useTasks = () => {
    const [state, setState] = useState<TaskState>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState;
        try {
            const parsed = JSON.parse(raw) as Partial<TaskState> | null;
            if (parsed && typeof parsed.title === 'string') {
                return { title: parsed.title };
            }
            return defaultState;
        } catch {
            return defaultState;
        }
    });

    const persist = useCallback((next: TaskState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState(next);
    }, []);

    const setTaskTitle = useCallback((title: string) => {
        persist({ title: title ?? '' });
    }, [persist]);

    const clearTask = useCallback(() => {
        persist({ title: '' });
    }, [persist]);

    return {
        taskTitle: state.title,
        setTaskTitle,
        clearTask,
    };
};
