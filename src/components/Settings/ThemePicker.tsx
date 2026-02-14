import { type FC, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const THEMES = [
    { name: 'Pastel Red', color: '#ff6b6b' },
    { name: 'Pastel Blue', color: '#4dabf7' },
    { name: 'Pastel Green', color: '#69db7c' },
    { name: 'Pastel Yellow', color: '#ffd43b' },
    { name: 'Pastel Purple', color: '#da77f2' },
    { name: 'Pastel Orange', color: '#ffa94d' },
];

export const ThemePicker: FC = () => {
    const [activeColor, setActiveColor] = useLocalStorage<string>('pomodoro-theme-color', '#ff6b6b');

    useEffect(() => {
        // Update CSS variable
        document.documentElement.style.setProperty('--color-primary', activeColor);

        // Also update the 'work' color variables if we want a complete theme shift, 
        // but typically 'primary' is enough for UI elements.
        // Let's update the --color-work too for consistency if desired, or just keep primary.
        // For now, let's map primary to the main accent color.

        // Actually, looking at variables.css, we use --color-work for background gradients.
        // The user asked for "Primary Colour". 
        // Let's assume this affects buttons and highlights (which use bg-primary).
        // Tailwind config maps 'primary' to 'var(--color-primary)'.

    }, [activeColor]);

    return (
        <div className="w-full mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">Theme Color</h3>
            <div className="flex flex-wrap gap-3">
                {THEMES.map((theme) => (
                    <button
                        key={theme.name}
                        onClick={() => setActiveColor(theme.color)}
                        className={`
                            w-10 h-10 rounded-full border-2 transition-transform hover:scale-110
                            ${activeColor === theme.color ? 'border-text-light dark:border-text-dark scale-110' : 'border-transparent'}
                        `}
                        style={{ backgroundColor: theme.color }}
                        title={theme.name}
                    />
                ))}
            </div>
        </div>
    );
};
