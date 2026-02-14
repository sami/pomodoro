import { useMemo, useState } from 'react';
import { TaskInput } from './TaskInput';

const MODES = ['Focus', 'Short Break', 'Long Break'] as const;

export const Timer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<(typeof MODES)[number]>('Focus');
    const [task, setTask] = useState('');

    const progress = 0.42;
    const size = 320;
    const stroke = 12;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const dashOffset = useMemo(
        () => circumference * (1 - progress),
        [circumference, progress]
    );

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

                    <div className="text-5xl font-semibold tracking-tight sm:text-6xl">
                        25:00
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
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
                onClick={() => setIsRunning((prev) => !prev)}
                className="rounded-full bg-primary px-10 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
            >
                {isRunning ? 'Pause' : 'Start'}
            </button>
        </div>
    );
};
