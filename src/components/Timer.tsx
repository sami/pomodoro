import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../context/SoundContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { useTimerSettings, type TimerMode } from '../hooks/useTimerSettings';
import { useFocusSettings } from '../hooks/useFocusSettings';
import { useTasks } from '../hooks/useTasks';

export interface TimerControls {
    toggleTimer: () => void;
    resetTimer: () => void;
}

interface TimerProps {
    minimalMode?: boolean;
}

const MODES: TimerMode[] = ['Focus', 'Short Break', 'Long Break'];

const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const QUOTES = [
    'One task. One breath. Begin.',
    'Let the timer do the remembering.',
    'Small steps, steady focus.',
    'A calm mind finishes the task.',
    'Deep work, gentle pace.',
    'Stay with the task you chose.',
];

export const Timer = forwardRef<TimerControls, TimerProps>(({ minimalMode = false }, ref) => {
    const [mode, setMode] = useState<TimerMode>('Focus');
    const [quote, setQuote] = useState(QUOTES[0]);
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
    const [pendingReset, setPendingReset] = useState(false);
    const { addSession, focusCount, todayFocusCount } = useSessionHistory();
    const { playNotification, setTimerRunning, muteAll, isMuted } = useSound();
    const { settings, updateDuration } = useTimerSettings();
    const { settings: focusSettings } = useFocusSettings();
    const [sessionToast, setSessionToast] = useState<null | { task?: string; minutes: number; pomos: number }>(null);
    const { activeTask, upsertTask, logFocusForActiveTask } = useTasks();

    const durationMs = settings[mode] * 60 * 1000;
    const { remainingMs, isRunning, start, pause, reset } = useTimer({
        initialMs: durationMs,
        onComplete: () => {
            playNotification();
            addSession({
                id: crypto.randomUUID(),
                mode,
                durationMs,
                completedAt: new Date().toISOString(),
                task: activeTask?.title ?? undefined,
            });
            if (mode === 'Focus' && activeTask) {
                logFocusForActiveTask(durationMs / 1000, 1);
            }
            setSessionToast({
                task: activeTask?.title,
                minutes: Math.round(durationMs / 60000),
                pomos: mode === 'Focus' ? 1 : 0,
            });
            if (mode === 'Focus') {
                const nextFocusCount = focusCount + 1;
                const shouldLong = focusSettings.autoLongBreak && nextFocusCount % focusSettings.longBreakEvery === 0;
                if (shouldLong) {
                    setMode('Long Break');
                    reset(settings['Long Break'] * 60 * 1000);
                    start();
                } else if (focusSettings.autoShortBreak) {
                    setMode('Short Break');
                    reset(settings['Short Break'] * 60 * 1000);
                    start();
                }
            }
        },
    });

    useEffect(() => {
        reset(durationMs);
    }, [durationMs, reset]);

    useEffect(() => {
        setTimerRunning(isRunning);
    }, [isRunning, setTimerRunning]);

    useEffect(() => {
        const label = mode === 'Focus' ? 'Work' : mode;
        document.title = `${formatTime(remainingMs)} - ${label}`;
    }, [remainingMs, mode]);

    const progress = 1 - remainingMs / durationMs;
    const size = 320;
    const stroke = 8;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const dashOffset = useMemo(() => {
        return circumference * (1 - progress);
    }, [circumference, progress]);

    const [taskDraft, setTaskDraft] = useState('');
    const showQuote = !minimalMode && (!isRunning || mode !== 'Focus');
    const hasStarted = remainingMs < durationMs;

    useEffect(() => {
        if (showQuote) {
            const next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            setQuote(next);
        }
    }, [showQuote, mode]);

    useEffect(() => {
        if (!sessionToast) return;
        const timeout = window.setTimeout(() => setSessionToast(null), 3500);
        return () => window.clearTimeout(timeout);
    }, [sessionToast]);

    useEffect(() => {
        setTaskDraft(activeTask?.title ?? '');
    }, [activeTask?.title]);

    const confirmSwitch = () => {
        if (!pendingMode) return;
        pause();
        setMode(pendingMode);
        setPendingMode(null);
    };

    const cancelSwitch = () => {
        setPendingMode(null);
    };

    const confirmReset = () => {
        reset(durationMs);
        setPendingReset(false);
    };

    const cancelReset = () => {
        setPendingReset(false);
    };



    const getSwitchPrompt = () => {
        if (!pendingMode) return null;
        if (mode === 'Focus') {
            return {
                title: `Start ${pendingMode}?`,
                description: 'This will stop your current focus session and begin a break.',
                confirmLabel: `Start ${pendingMode}`,
            };
        }
        if (pendingMode === 'Focus') {
            return {
                title: 'Back to Focus?',
                description: `This will end your ${mode.toLowerCase()} and start a focus session.`,
                confirmLabel: 'Start Focus',
            };
        }
        return {
            title: `Switch to ${pendingMode}?`,
            description: 'This will end your current break and start the next one.',
            confirmLabel: `Start ${pendingMode}`,
        };
    };

    useImperativeHandle(ref, () => ({
        toggleTimer: () => {
            if (isRunning) {
                pause();
            } else {
                start();
            }
        },
        resetTimer: () => reset(durationMs),
    }), [isRunning, pause, start, reset, durationMs]);

    return (
        <div className="timer-stack flex flex-col items-center gap-8">
            <div className="timer-content flex flex-col items-center gap-6">
            <div className="timer-ring relative flex items-center justify-center">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${size} ${size}`}
                    className="aspect-square"
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="var(--primary)"
                        strokeWidth={stroke}
                        strokeOpacity="0.12"
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="var(--primary)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeOpacity="0.85"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        fill="transparent"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                    <input
                        value={taskDraft}
                        onChange={(event) => setTaskDraft(event.target.value)}
                        onBlur={() => upsertTask(taskDraft)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                upsertTask(taskDraft);
                                (event.target as HTMLInputElement).blur();
                            }
                            if (event.key === 'Escape') {
                                setTaskDraft(activeTask?.title ?? '');
                                (event.target as HTMLInputElement).blur();
                            }
                        }}
                        placeholder="What are you focusing on now?"
                        className="timer-task w-full max-w-[380px] bg-transparent text-center text-lg font-semibold text-text-main/80 placeholder:text-text-main/40 focus:outline-none dark:text-white/80 dark:placeholder:text-white/40 sm:text-xl md:text-2xl"
                    />
                    <div className="flex flex-col items-center gap-1">
                        {isEditingTime ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={settings[mode]}
                                    onChange={(e) => updateDuration(mode, Number(e.target.value))}
                                    onBlur={() => setIsEditingTime(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                            setIsEditingTime(false);
                                        }
                                    }}
                                    autoFocus
                                    className="w-16 bg-transparent text-center text-4xl font-semibold outline-none [-moz-appearance:textfield] sm:text-5xl md:text-6xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.select();
                                    }}
                                />
                                <span className="text-sm text-text-main/60 dark:text-white/60">min</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingTime(true)}
                                className="timer-time group text-5xl font-semibold tracking-tight transition sm:text-6xl md:text-7xl"
                            >
                                <span className="underline decoration-dotted decoration-1 underline-offset-4 opacity-90 group-hover:opacity-100">
                                    {formatTime(remainingMs)}
                                </span>
                            </button>
                        )}
                        {!minimalMode && (
                            <span className="text-[11px] text-text-main/50 dark:text-white/50">Click time to edit</span>
                        )}
                    </div>

                    <div key={`${mode}-pills`} className="timer-mode-pills animate-fade-slide flex flex-wrap justify-center gap-2">
                        {MODES.map((label) => (
                            <button
                                key={label}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                    mode === label
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-text-main hover:bg-primary/20'
                                }`}
                                onClick={() => {
                                    if (mode === label) return;
                                    if (isRunning) {
                                        setPendingMode(label);
                                        return;
                                    }
                                    setMode(label);
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            <div className="timer-controls flex flex-wrap items-center justify-center gap-3">
                <div key={`${mode}-pills-landscape`} className="timer-mode-pills-landscape hidden w-full animate-fade-slide flex-wrap justify-center gap-2">
                    {MODES.map((label) => (
                        <button
                            key={label}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                mode === label
                                    ? 'bg-primary text-white'
                                    : 'bg-primary/10 text-text-main hover:bg-primary/20'
                            }`}
                            onClick={() => {
                                if (mode === label) return;
                                if (isRunning) {
                                    setPendingMode(label);
                                    return;
                                }
                                setMode(label);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {hasStarted && (
                    <button
                        onClick={() => setPendingReset(true)}
                        className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold text-text-main/80 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                    >
                        <RotateCcw size={16} strokeWidth={1.5} />
                        Reset
                    </button>
                )}
                <button
                    onClick={() => (isRunning ? pause() : start())}
                    className="flex items-center gap-2 rounded-full bg-primary px-10 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
                >
                    {isRunning ? (
                        <>
                            <Pause size={18} strokeWidth={1.5} />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play size={18} strokeWidth={1.5} />
                            Start
                        </>
                    )}
                </button>
                {hasStarted && (
                    <button
                        onClick={muteAll}
                        className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold text-text-main/80 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                    >
                        {isMuted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
                        {isMuted ? 'Muted' : 'Mute'}
                    </button>
                )}
            </div>
            </div>

            {showQuote && (
                <p className="max-w-md text-center text-xs text-text-main/60 animate-fade-slide">
                    “{quote}”
                </p>
            )}

            {!minimalMode && (
                <div className="text-[11px] text-text-main/50 dark:text-white/50">
                    Pomos today: {todayFocusCount}
                </div>
            )}

            {sessionToast && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs text-text-main/80 shadow-md backdrop-blur dark:border-white/10 dark:bg-black/70 dark:text-white/80">
                    Session complete · {sessionToast.minutes} min
                    {sessionToast.task ? ` · ${sessionToast.task}` : ''}
                    {sessionToast.pomos ? ` · ${sessionToast.pomos} pomo` : ''}
                </div>
            )}


            {pendingMode && (() => {
                const prompt = getSwitchPrompt();
                if (!prompt) return null;
                return (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm rounded-2xl border border-white/30 bg-white/95 p-6 text-text-main shadow-xl dark:border-white/10 dark:bg-black/80 dark:text-white">
                            <h3 className="text-base font-semibold">{prompt.title}</h3>
                            <p className="mt-2 text-xs text-text-main/70 dark:text-white/70">
                                {prompt.description}
                            </p>
                            <div className="mt-5 flex items-center justify-end gap-2">
                                <button
                                    onClick={cancelSwitch}
                                    className="rounded-full border border-black/10 px-4 py-2 text-xs text-text-main/80 transition hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                                >
                                    Keep {mode}
                                </button>
                                <button
                                    onClick={confirmSwitch}
                                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                >
                                    {prompt.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}


            {pendingReset && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-white/30 bg-white/95 p-6 text-text-main shadow-xl dark:border-white/10 dark:bg-black/80 dark:text-white">
                        <h3 className="text-base font-semibold">Reset timer?</h3>
                        <p className="mt-2 text-xs text-text-main/70 dark:text-white/70">
                            This will stop the current session and reset the timer for {mode}.
                        </p>
                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                onClick={cancelReset}
                                className="rounded-full border border-black/10 px-4 py-2 text-xs text-text-main/80 transition hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                            >
                                Keep going
                            </button>
                            <button
                                onClick={confirmReset}
                                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
});

Timer.displayName = 'Timer';
