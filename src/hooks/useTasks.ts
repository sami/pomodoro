import { createContext, createElement, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface TaskItem {
    id: string;
    title: string;
    createdAt: string;
    completedAt?: string;
    pomoUnits: number;
    focusSeconds: number;
}

interface TaskState {
    tasks: TaskItem[];
    activeTaskId: string | null;
}

type TasksContextValue = {
    tasks: TaskItem[];
    activeTaskId: string | null;
    activeTask: TaskItem | null;
    addTask: (title: string) => void;
    setActiveTask: (id: string) => void;
    upsertTask: (title: string) => void;
    abandonActiveTask: () => void;
    completeActiveTask: (options?: { addPomoUnits?: number; addFocusSeconds?: number }) => void;
    completeTask: (id: string) => void;
    logFocusForActiveTask: (focusSeconds: number, pomoUnits: number) => void;
    exportTasks: () => string;
    importTasks: (payload: string) => boolean;
    deleteTask: (id: string) => void;
    clearAllTasks: () => void;
};

const STORAGE_KEY = 'pomodoro:tasks';

const defaultState: TaskState = {
    tasks: [],
    activeTaskId: null,
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const normalizeState = (raw: unknown): TaskState => {
    if (!raw || typeof raw !== 'object') return defaultState;
    const parsed = raw as Partial<TaskState> & { title?: string; completed?: { title: string; completedAt: string }[] };
    if (!Array.isArray(parsed.tasks)) {
        const migratedTasks: TaskItem[] = [];
        if (typeof parsed.title === 'string' && parsed.title.trim().length > 0) {
            migratedTasks.push({
                id: crypto.randomUUID(),
                title: parsed.title,
                createdAt: new Date().toISOString(),
                pomoUnits: 0,
                focusSeconds: 0,
            });
        }
        if (Array.isArray(parsed.completed)) {
            parsed.completed.forEach((item) => {
                if (!item || typeof item.title !== 'string') return;
                migratedTasks.push({
                    id: crypto.randomUUID(),
                    title: item.title,
                    createdAt: item.completedAt ?? new Date().toISOString(),
                    completedAt: item.completedAt ?? new Date().toISOString(),
                    pomoUnits: 0,
                    focusSeconds: 0,
                });
            });
        }
        return {
            tasks: migratedTasks,
            activeTaskId: migratedTasks.length > 0 && typeof parsed.title === 'string' ? migratedTasks[0].id : null,
        };
    }
    const tasks = parsed.tasks;
    return {
        tasks: tasks.filter((task) => task && typeof task.title === 'string').map((task) => ({
            id: typeof task.id === 'string' ? task.id : crypto.randomUUID(),
            title: task.title,
            createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
            completedAt: typeof task.completedAt === 'string' ? task.completedAt : undefined,
            pomoUnits: typeof task.pomoUnits === 'number' ? task.pomoUnits : 0,
            focusSeconds: typeof task.focusSeconds === 'number' ? task.focusSeconds : 0,
        })),
        activeTaskId: typeof parsed.activeTaskId === 'string' ? parsed.activeTaskId : null,
    };
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<TaskState>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState;
        try {
            return normalizeState(JSON.parse(raw));
        } catch {
            return defaultState;
        }
    });

    const persist = useCallback((next: TaskState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState(next);
    }, []);

    const addTask = useCallback((title: string) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const newTask: TaskItem = {
            id: crypto.randomUUID(),
            title: trimmed,
            createdAt: new Date().toISOString(),
            pomoUnits: 0,
            focusSeconds: 0,
        };
        persist({
            tasks: [newTask, ...state.tasks],
            activeTaskId: newTask.id,
        });
    }, [persist, state.tasks]);

    const setActiveTask = useCallback((id: string) => {
        persist({
            ...state,
            activeTaskId: id,
        });
    }, [persist, state]);

    const upsertTask = useCallback((title: string) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const existing = state.tasks.find((task) =>
            !task.completedAt && task.title.toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) {
            persist({
                ...state,
                activeTaskId: existing.id,
            });
            return;
        }
        const newTask: TaskItem = {
            id: crypto.randomUUID(),
            title: trimmed,
            createdAt: new Date().toISOString(),
            pomoUnits: 0,
            focusSeconds: 0,
        };
        persist({
            tasks: [newTask, ...state.tasks],
            activeTaskId: newTask.id,
        });
    }, [persist, state]);

    const abandonActiveTask = useCallback(() => {
        persist({
            ...state,
            activeTaskId: null,
        });
    }, [persist, state]);

    const completeActiveTask = useCallback((options?: { addPomoUnits?: number; addFocusSeconds?: number }) => {
        if (!state.activeTaskId) return;
        const { addPomoUnits = 0, addFocusSeconds = 0 } = options ?? {};
        const nextTasks = state.tasks.map((task) => {
            if (task.id !== state.activeTaskId) return task;
            return {
                ...task,
                completedAt: new Date().toISOString(),
                pomoUnits: task.pomoUnits + addPomoUnits,
                focusSeconds: task.focusSeconds + addFocusSeconds,
            };
        });
        persist({
            tasks: nextTasks,
            activeTaskId: null,
        });
    }, [persist, state]);

    const completeTask = useCallback((id: string) => {
        const nextTasks = state.tasks.map((task) => {
            if (task.id !== id) return task;
            return {
                ...task,
                completedAt: task.completedAt ?? new Date().toISOString(),
            };
        });
        persist({
            tasks: nextTasks,
            activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        });
    }, [persist, state]);

    const logFocusForActiveTask = useCallback((focusSeconds: number, pomoUnits: number) => {
        if (!state.activeTaskId) return;
        const nextTasks = state.tasks.map((task) => {
            if (task.id !== state.activeTaskId) return task;
            return {
                ...task,
                pomoUnits: task.pomoUnits + pomoUnits,
                focusSeconds: task.focusSeconds + focusSeconds,
            };
        });
        persist({
            ...state,
            tasks: nextTasks,
        });
    }, [persist, state]);

    const deleteTask = useCallback((id: string) => {
        const nextTasks = state.tasks.filter((task) => task.id !== id);
        persist({
            tasks: nextTasks,
            activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        });
    }, [persist, state]);

    const clearAllTasks = useCallback(() => {
        persist(defaultState);
    }, [persist]);

    const exportTasks = useCallback(() => {
        return JSON.stringify(state, null, 2);
    }, [state]);

    const importTasks = useCallback((payload: string) => {
        try {
            const parsed = JSON.parse(payload);
            const next = normalizeState(parsed);
            persist(next);
            return true;
        } catch {
            return false;
        }
    }, [persist]);

    const activeTask = useMemo(() => {
        return state.tasks.find((task) => task.id === state.activeTaskId) ?? null;
    }, [state]);

    const value = useMemo(() => ({
        tasks: state.tasks,
        activeTaskId: state.activeTaskId,
        activeTask,
        addTask,
        setActiveTask,
        upsertTask,
        abandonActiveTask,
        completeActiveTask,
        completeTask,
        logFocusForActiveTask,
        exportTasks,
        importTasks,
        deleteTask,
        clearAllTasks,
    }), [state, activeTask, addTask, setActiveTask, upsertTask, abandonActiveTask, completeActiveTask, completeTask, logFocusForActiveTask, exportTasks, importTasks, deleteTask, clearAllTasks]);

    return createElement(TasksContext.Provider, { value }, children);
};

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within TasksProvider');
    }
    return context;
};
