import { useEffect, useState, type FC } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTimerContext } from '../../context/TimerContext';
import { ThemePicker } from './ThemePicker';
import { SoundMixer } from '../Sound/SoundMixer';

export const Settings: FC = () => {
    const { settings, updateSettings } = useTimerContext();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial dark mode
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleChange = (key: string, minutes: number) => {
        updateSettings({ [key]: minutes * 60 });
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-primary font-display">Personalise</h2>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-8">

                {/* Visuals Section */}
                <section>
                    <ThemePicker />

                    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="font-bold text-sm">Dark Mode</span>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-cream dark:bg-white/10 text-primary hover:scale-105 transition-transform"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </section>

                {/* Sound Section */}
                <section>
                    <SoundMixer />
                </section>

                {/* Timer Settings */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-50">Timer Durations</h3>
                    <DurationSlider
                        label="Focus"
                        value={settings.work / 60}
                        onChange={(v: number) => handleChange('work', v)}
                        min={5} max={60} step={5}
                    />
                    <DurationSlider
                        label="Short Break"
                        value={settings.shortBreak / 60}
                        onChange={(v: number) => handleChange('shortBreak', v)}
                        min={1} max={15} step={1}
                    />
                    <DurationSlider
                        label="Long Break"
                        value={settings.longBreak / 60}
                        onChange={(v: number) => handleChange('longBreak', v)}
                        min={5} max={30} step={5}
                    />
                </section>

                <div className="pt-4 text-center text-xs opacity-50">
                    <p>Pomodoro PWA v2.1</p>
                </div>
            </div>
        </div>
    );
};

const DurationSlider = ({ label, value, onChange, min, max, step }: any) => (
    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex justify-between mb-2">
            <label className="text-sm font-bold">{label}</label>
            <span className="text-sm font-mono text-primary">{value} min</span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-cream dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
        />
    </div>
);
