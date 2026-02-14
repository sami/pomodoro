import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Play, Pause, Pencil, Volume2, VolumeX } from 'lucide-react';
import { TaskInput } from './TaskInput';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../context/SoundContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { useTimerSettings, type TimerMode } from '../hooks/useTimerSettings';

export interface TimerControls {
    toggleTimer: () => void;
    resetTimer: () => void;
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

export const Timer = forwardRef<TimerControls>((_, ref) => {
    const [mode, setMode] = useState<TimerMode>('Focus');
    const [task, setTask] = useState('');
    const [quote, setQuote] = useState(QUOTES[0]);
    const [editingMode, setEditingMode] = useState<TimerMode | null>(null);
    const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
    const { addSession } = useSessionHistory();
    const { playNotification, setTimerRunning, muteAll, isMuted } = useSound();
    const { settings, updateDuration } = useTimerSettings();

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
                task: task.trim() || undefined,
            });
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
    const stroke = 12;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const dashOffset = useMemo(() => {
        return circumference * (1 - progress);
    }, [circumference, progress]);

    const showQuote = !isRunning || mode !== 'Focus';

    useEffect(() => {
        if (showQuote) {
            const next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            setQuote(next);
        }
    }, [showQuote, mode]);

    const confirmSwitch = () => {
        if (!pendingMode) return;
        pause();
        setMode(pendingMode);
        setPendingMode(null);
    };

    const cancelSwitch = () => {
        setPendingMode(null);
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
        <div className="flex w-[80%] max-w-[600px] flex-col items-center gap-8">
            <div className="relative flex w-full items-center justify-center">
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
                        strokeOpacity="0.2"
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="var(--primary)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        fill="transparent"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                    <TaskInput value={task} onChange={setTask} />

                    <div key={mode} className="animate-fade-slide text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
                        {formatTime(remainingMs)}
                    </div>

                    <div key={`${mode}-pills`} className="animate-fade-slide flex flex-wrap justify-center gap-2">
                        {MODES.map((label) => (
                            <div
                                key={label}
                                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                    mode === label
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-text-main cursor-pointer hover:bg-primary/20'
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
                                <span>{label}</span>
                                <span className="opacity-60">·</span>
                                {editingMode === label ? (
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={settings[label]}
                                        onChange={(e) => updateDuration(label, Number(e.target.value))}
                                        onBlur={() => setEditingMode(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                setEditingMode(null);
                                            }
                                        }}
                                        autoFocus
                                        className="w-8 bg-transparent text-center outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.currentTarget.select();
                                        }}
                                    />
                                ) : (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingMode(label);
                                        }}
                                        className="group flex items-center gap-1 cursor-text"
                                    >
                                        <span className="opacity-80 group-hover:opacity-100 underline decoration-dotted decoration-1 underline-offset-2">
                                            {settings[label]}
                                        </span>
                                        <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" strokeWidth={2} />
                                    </div>
                                )}
                                <span className="opacity-60">min</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
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
                <button
                    onClick={muteAll}
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold text-text-main/80 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                >
                    {isMuted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
                    {isMuted ? 'Muted' : 'Mute'}
                </button>
            </div>

            {showQuote && (
                <p className="max-w-md text-center text-xs text-text-main/60 animate-fade-slide">
                    “{quote}”
                </p>
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
        </div>
    );
});

Timer.displayName = 'Timer';
