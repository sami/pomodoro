import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from './Layout';
import { Eraser, Plus, Target, Trash2 } from 'lucide-react';
import { Timer, type TimerControls } from './components/Timer';
import { SoundMixer } from './components/SoundMixer';
import { ReloadPrompt } from './components/ReloadPrompt';
import { useSound } from './context/SoundContext';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useFocusSettings } from './hooks/useFocusSettings';
import { useTasks } from './hooks/useTasks';

const App = () => {
    const [isDark, setIsDark] = useState(() => {
        const raw = localStorage.getItem('pomodoro:isDark');
        return raw ? raw === 'true' : false;
    });
    const timerRef = useRef<TimerControls>(null);
    const { notificationVolume, setNotificationVolume, playNotification, muteAll, autoPlaySounds, setAutoPlaySounds } = useSound();
    useSessionHistory();
    const { settings: focusSettings, updateSettings: updateFocusSettings } = useFocusSettings();
    const { tasks, activeTask, addTask, setActiveTask, completeTask, deleteTask, clearAllTasks } = useTasks();
    const [taskDraft, setTaskDraft] = useState('');
    const [minimalMode, setMinimalMode] = useState(() => {
        const raw = localStorage.getItem('pomodoro:minimalMode');
        return raw ? raw === 'true' : false;
    });

    const todayLabel = useMemo(() => {
        return new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    }, []);

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark((prev) => {
            const next = !prev;
            localStorage.setItem('pomodoro:isDark', String(next));
            return next;
        });
    };

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        localStorage.setItem('pomodoro:minimalMode', String(minimalMode));
    }, [minimalMode]);

    return (
        <Layout
            onToggleTimer={() => timerRef.current?.toggleTimer()}
            onResetTimer={() => timerRef.current?.resetTimer()}
            onMuteAll={muteAll}
            settingsContent={
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Settings</h2>
                        <p className="text-xs text-text-main/60 dark:text-white/60">
                            Keep the room quiet, focus on one thing.
                        </p>
                    </div>

                    <button
                        onClick={toggleDark}
                        className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-2 text-sm text-text-main/90 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20"
                    >
                        Toggle {isDark ? 'Light' : 'Dark'} Mode
                    </button>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-text-main/80 dark:text-white/80">Ambient Sounds</h3>
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                            <span>Auto-play with timer</span>
                            <button
                                onClick={() => setAutoPlaySounds(!autoPlaySounds)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                    autoPlaySounds
                                        ? 'bg-primary text-white'
                                        : 'bg-black/10 text-text-main/70 dark:bg-white/10 dark:text-white/70'
                                }`}
                            >
                                {autoPlaySounds ? 'On' : 'Off'}
                            </button>
                        </div>
                        <SoundMixer />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-text-main/80 dark:text-white/80">Breaks</h3>
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                            <span>Auto-switch to short break</span>
                            <button
                                onClick={() => updateFocusSettings({ autoShortBreak: !focusSettings.autoShortBreak })}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                    focusSettings.autoShortBreak
                                        ? 'bg-primary text-white'
                                        : 'bg-black/10 text-text-main/70 dark:bg-white/10 dark:text-white/70'
                                }`}
                            >
                                {focusSettings.autoShortBreak ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                            <span>Auto-switch to long break</span>
                            <button
                                onClick={() => updateFocusSettings({ autoLongBreak: !focusSettings.autoLongBreak })}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                    focusSettings.autoLongBreak
                                        ? 'bg-primary text-white'
                                        : 'bg-black/10 text-text-main/70 dark:bg-white/10 dark:text-white/70'
                                }`}
                            >
                                {focusSettings.autoLongBreak ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                            <span>Every</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="2"
                                    max="8"
                                    value={focusSettings.longBreakEvery}
                                    onChange={(event) => updateFocusSettings({ longBreakEvery: Math.max(2, Math.min(8, Number(event.target.value))) })}
                                    className="w-14 rounded-md bg-transparent text-center text-xs outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="text-text-main/60 dark:text-white/60">focus sessions</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-text-main/80 dark:text-white/80">Notification</h3>
                            <button
                                onClick={playNotification}
                                className="rounded-full border border-black/15 px-3 py-1 text-xs text-text-main/80 transition hover:bg-black/10 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                            >
                                Test Ding
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-text-main/60 dark:text-white/60">Volume</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={notificationVolume}
                                onChange={(event) => setNotificationVolume(Number(event.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-text-main/80 dark:text-white/80">Appearance</h3>
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                            <span>Minimal mode</span>
                            <button
                                onClick={() => setMinimalMode(!minimalMode)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                    minimalMode
                                        ? 'bg-primary text-white'
                                        : 'bg-black/10 text-text-main/70 dark:bg-white/10 dark:text-white/70'
                                }`}
                            >
                                {minimalMode ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-text-main/80 dark:text-white/80">Keyboard Shortcuts</h3>
                        <div className="space-y-2 rounded-xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-main/70 dark:text-white/70">Start/Pause</span>
                                <kbd className="rounded bg-black/10 px-2 py-1 font-mono text-text-main/80 dark:bg-white/10 dark:text-white/80">Space</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-main/70 dark:text-white/70">Reset Timer</span>
                                <kbd className="rounded bg-black/10 px-2 py-1 font-mono text-text-main/80 dark:bg-white/10 dark:text-white/80">Esc</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-main/70 dark:text-white/70">Mute/Unmute All</span>
                                <kbd className="rounded bg-black/10 px-2 py-1 font-mono text-text-main/80 dark:bg-white/10 dark:text-white/80">M</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-main/70 dark:text-white/70">Open Settings</span>
                                <kbd className="rounded bg-black/10 px-2 py-1 font-mono text-text-main/80 dark:bg-white/10 dark:text-white/80">S</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-main/70 dark:text-white/70">Open History</span>
                                <kbd className="rounded bg-black/10 px-2 py-1 font-mono text-text-main/80 dark:bg-white/10 dark:text-white/80">H</kbd>
                            </div>
                        </div>
                    </div>

                </div>
            }
            historyContent={
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Tasks</h2>
                            <p className="text-xs text-text-main/60 dark:text-white/60">{todayLabel}</p>
                        </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-text-main/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                        <div className="flex items-center justify-between">
                            <span>Tasks</span>
                            <span>
                                {tasks.filter((task) => task.completedAt).length}/{tasks.length} done
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${tasks.length === 0 ? 0 : Math.min(100, (tasks.filter((task) => task.completedAt).length / tasks.length) * 100)}%` }}
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <input
                            type="text"
                            value={taskDraft}
                            onChange={(event) => setTaskDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && taskDraft.trim()) {
                                    addTask(taskDraft.trim());
                                    setTaskDraft('');
                                }
                            }}
                            autoFocus
                            placeholder="Add a task"
                            className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-2 text-sm text-text-main/80 outline-none transition focus:border-primary/50 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                        />
                        <button
                            onClick={() => {
                                if (!taskDraft.trim()) return;
                                addTask(taskDraft.trim());
                                setTaskDraft('');
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                            <Plus size={14} strokeWidth={1.5} />
                            Add task
                        </button>
                    </div>

                    {tasks.length === 0 && (
                        <p className="rounded-xl border border-black/10 bg-black/5 p-4 text-xs text-text-main/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                            No tasks yet. Add one from the main screen to begin.
                        </p>
                    )}

                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`rounded-xl border p-3 text-xs transition ${
                                    task.completedAt
                                        ? 'border-transparent bg-black/5 text-text-main/50 line-through dark:bg-white/5 dark:text-white/50'
                                        : task.id === activeTask?.id
                                            ? 'border-primary/40 bg-primary/10 text-text-main dark:text-white'
                                            : 'border-black/10 bg-black/5 text-text-main/80 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (task.completedAt) return;
                                                completeTask(task.id);
                                            }}
                                            className={`h-4 w-4 rounded border ${task.completedAt ? 'bg-primary border-primary' : 'border-black/30 dark:border-white/30'}`}
                                            aria-label="Toggle task complete"
                                        />
                                        <span className="text-left font-semibold">
                                            {task.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[10px] text-text-main/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                                            {task.pomoUnits.toFixed(1)} pomos
                                        </span>
                                        {!task.completedAt && task.id !== activeTask?.id && (
                                            <button
                                                onClick={() => setActiveTask(task.id)}
                                                className="flex items-center gap-1 text-[11px] text-text-main/60 transition hover:text-text-main/80 dark:text-white/60 dark:hover:text-white/80"
                                                aria-label="Focus this task"
                                            >
                                                <Target size={12} strokeWidth={1.5} />
                                                Focus
                                            </button>
                                        )}
                                        {!task.completedAt && task.id === activeTask?.id && (
                                            <span className="text-[11px] text-primary">Active</span>
                                        )}
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="flex items-center gap-1 text-[11px] text-text-main/50 transition hover:text-text-main/80 dark:text-white/50 dark:hover:text-white/80"
                                            aria-label="Delete task"
                                        >
                                            <Trash2 size={12} strokeWidth={1.5} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {tasks.length > 0 && (
                        <button
                            onClick={clearAllTasks}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-black/5 px-4 py-2 text-xs text-text-main/70 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                        >
                            <Eraser size={14} strokeWidth={1.5} />
                            Clear all tasks
                        </button>
                    )}

                </div>
            }
        >
            <Timer ref={timerRef} minimalMode={minimalMode} />
            <ReloadPrompt />
        </Layout>
    );
};

export default App;
