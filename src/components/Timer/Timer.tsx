
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Briefcase, CheckCircle, XCircle, Quote as QuoteIcon } from 'lucide-react';
import { useTimerContext } from '../../context/TimerContext';
import { getRandomQuote, type Quote } from '../../data/quotes';

export const Timer = () => {
    const {
        timeLeft,
        isRunning,
        mode,
        toggleTimer,
        resetTimer,
        setMode,
        activeTask,
        setTask,
        completeTask,
        clearTask,
        isTaskCompleted
    } = useTimerContext();

    const [quote, setQuote] = useState<Quote | null>(null);

    // Effect to trigger quote when timer hits 0 or task is completed
    useEffect(() => {
        if (timeLeft === 0 && !quote) {
            setQuote(getRandomQuote(mode === 'work' ? 'focus' : 'break'));
        }
    }, [timeLeft, mode, quote]);

    // Also trigger quote when task is manually completed
    useEffect(() => {
        if (isTaskCompleted && !quote) {
            setQuote(getRandomQuote('focus'));
        }
    }, [isTaskCompleted, quote]);

    // Clear quote when timer resets or starts
    useEffect(() => {
        if (isRunning || timeLeft === (mode === 'work' ? 25 * 60 : (mode === 'shortBreak' ? 5 * 60 : 15 * 60))) {
            setQuote(null);
        }
    }, [isRunning, timeLeft, mode]);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md relative">

            {/* Quote Overlay */}
            {quote && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cream/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-3xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <QuoteIcon size={32} className="text-primary mb-4 opacity-50" />
                    <p className="text-xl md:text-2xl font-display font-medium mb-4 leading-relaxed">
                        "{quote.text}"
                    </p>
                    <p className="text-sm uppercase tracking-widest opacity-50 font-bold">
                        — {quote.author}
                    </p>
                    <button
                        onClick={() => setQuote(null)}
                        className="mt-8 px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:scale-105 transition-transform"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Task Focus Input */}
            <div className="w-full mb-8 relative z-10">
                {!activeTask ? (
                    <input
                        type="text"
                        placeholder="What are you focusing on?"
                        className="w-full text-center bg-transparent text-xl md:text-2xl font-medium placeholder:text-black/20 dark:placeholder:text-white/20 outline-none pb-2 border-b-2 border-transparent focus:border-primary/20 transition-all font-display"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setTask(e.currentTarget.value);
                            }
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">Current Task</div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xl md:text-2xl font-medium font-display ${isTaskCompleted ? 'line-through opacity-50' : ''}`}>
                                {activeTask}
                            </span>
                            {!isTaskCompleted ? (
                                <button
                                    onClick={completeTask}
                                    className="p-1 hover:text-green-500 transition-colors"
                                    title="Complete Task"
                                >
                                    <CheckCircle size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={clearTask}
                                    className="p-1 hover:text-red-500 transition-colors"
                                    title="Clear Task"
                                >
                                    <XCircle size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-surface-light dark:bg-white/5 p-1.5 rounded-2xl mb-12 shadow-sm border border-black/5 dark:border-white/5">
                <ModeButton
                    active={mode === 'work'}
                    onClick={() => setMode('work')}
                    icon={<Briefcase size={16} />}
                    label="Work"
                />
                <ModeButton
                    active={mode === 'shortBreak'}
                    onClick={() => setMode('shortBreak')}
                    icon={<Coffee size={16} />}
                    label="Short"
                />
                <ModeButton
                    active={mode === 'longBreak'}
                    onClick={() => setMode('longBreak')}
                    icon={<Coffee size={16} />}
                    label="Long"
                />
            </div>

            {/* Timer Display */}
            <div className="relative mb-12 group cursor-default select-none">
                <div className="text-[8rem] md:text-[10rem] font-bold leading-none tracking-tighter text-text-light dark:text-text-dark drop-shadow-sm font-display transition-all tabular-nums">
                    {formatTime(timeLeft)}
                </div>
                <div className="absolute -bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-40 transition-opacity uppercase tracking-widest text-sm font-bold">
                    {isRunning ? 'Focusing...' : 'Paused'}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTimer}
                    className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-hover active:scale-95 transition-all"
                >
                    {isRunning ? <Pause size={42} fill="currentColor" /> : <Play size={42} fill="currentColor" className="ml-2" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="h-16 w-16 rounded-full bg-surface-light dark:bg-white/10 text-text-light dark:text-text-dark flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20 active:scale-95 transition-all"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

        </div>
    );
};

const ModeButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
            ${active
                ? 'bg-cream text-primary shadow-sm'
                : 'text-text-light/50 dark:text-text-dark/50 hover:text-primary'
            }
        `}
    >
        {icon}
        {label}
    </button>
);
