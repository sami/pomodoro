import { useMemo, useRef, useState } from 'react';
import { Layout } from './Layout';
import { Timer, type TimerControls } from './components/Timer';
import { SoundMixer } from './components/SoundMixer';
import { useSound } from './context/SoundContext';
import { useSessionHistory } from './hooks/useSessionHistory';

const App = () => {
    const [isDark, setIsDark] = useState(false);
    const timerRef = useRef<TimerControls>(null);
    const { notificationVolume, setNotificationVolume, playNotification, muteAll } = useSound();
    const { todaySessions, downloadCsv } = useSessionHistory();

    const todayLabel = useMemo(() => {
        return new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    }, []);

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark((prev) => !prev);
    };

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
                        <SoundMixer />
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
                            <h2 className="text-lg font-semibold">Today</h2>
                            <p className="text-xs text-text-main/60 dark:text-white/60">{todayLabel}</p>
                        </div>
                        <button
                            onClick={downloadCsv}
                            className="rounded-full border border-black/15 px-3 py-1 text-xs text-text-main/80 transition hover:bg-black/10 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                        >
                            Download CSV
                        </button>
                    </div>

                    {todaySessions.length === 0 && (
                        <p className="rounded-xl border border-black/10 bg-black/5 p-4 text-xs text-text-main/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                            No sessions yet. Start a focus block to see it here.
                        </p>
                    )}

                    <div className="space-y-2">
                        {todaySessions.map((session) => (
                            <div
                                key={session.id}
                                className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm text-text-main/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">{session.mode}</span>
                                    <span className="text-xs text-text-main/60 dark:text-white/60">
                                        {new Date(session.completedAt).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                {session.task && (
                                    <p className="mt-1 text-xs text-text-main/70 dark:text-white/70">{session.task}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <Timer ref={timerRef} />
        </Layout>
    );
};

export default App;
