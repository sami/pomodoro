import { useEffect, useMemo, useState } from 'react';
import { TaskInput } from './TaskInput';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../context/SoundContext';
import { useSessionHistory } from '../hooks/useSessionHistory';

const MODES = ['Focus', 'Short Break', 'Long Break'] as const;
const MODE_MINUTES: Record<(typeof MODES)[number], number> = {
    Focus: 25,
    'Short Break': 5,
    'Long Break': 15,
};

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

export const Timer = () => {
    const [mode, setMode] = useState<(typeof MODES)[number]>('Focus');
    const [task, setTask] = useState('');
    const [quote, setQuote] = useState(QUOTES[0]);
    const { addSession } = useSessionHistory();
    const { focusSound, playFocusSound, stopFocusSound, playNotification } = useSound();

    const durationMs = MODE_MINUTES[mode] * 60 * 1000;
    const { remainingMs, isRunning, start, pause, reset } = useTimer({
        initialMs: durationMs,
        onComplete: () => {
            stopFocusSound();
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
        const label = mode === 'Focus' ? 'Work' : mode;
        document.title = `${formatTime(remainingMs)} - ${label}`;
    }, [remainingMs, mode]);

    useEffect(() => {
        if (isRunning) {
            stopFocusSound();
            playFocusSound();
        } else {
            stopFocusSound();
        }
    }, [isRunning, focusSound, playFocusSound, stopFocusSound]);

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
                            <button
                                key={label}
                                onClick={() => setMode(label)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                    mode === label
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-text-main'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => (isRunning ? pause() : start())}
                className="rounded-full bg-primary px-10 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
            >
                {isRunning ? 'Pause' : 'Start'}
            </button>

            {showQuote && (
                <p className="max-w-md text-center text-xs text-text-main/60 animate-fade-slide">
                    “{quote}”
                </p>
            )}
        </div>
    );
};
