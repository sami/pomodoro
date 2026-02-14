import { createContext, useContext, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- Types ---

export type SoundType = 'rain' | 'coffee' | 'whiteNoise';



interface SoundContextType {
    volumes: Record<SoundType, number>;
    playing: Record<SoundType, boolean>;
    toggleSound: (type: SoundType) => void;
    setVolume: (type: SoundType, volume: number) => void;
}

// --- Context ---

const SoundContext = createContext<SoundContextType | null>(null);

export const useSoundContext = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error('useSoundContext must be used within a SoundProvider');
    return context;
};

// --- Provider ---

const SOUND_URLS: Record<SoundType, string> = {
    rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3', // Placeholder, ideally specific files
    coffee: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-442.mp3',
    whiteNoise: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-1279.mp3', // Placeholder
};

export const SoundProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [volumes, setVolumes] = useLocalStorage<Record<SoundType, number>>('pomodoro-sounds-volume', {
        rain: 50,
        coffee: 50,
        whiteNoise: 50
    });

    // We don't persist playing state usually, or maybe we do? 
    // Let's reset playing to false on reload to avoid sudden noise.
    const [playing, setPlaying] = useState<Record<SoundType, boolean>>({
        rain: false,
        coffee: false,
        whiteNoise: false
    });

    const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
        rain: null,
        coffee: null,
        whiteNoise: null
    });

    // Initialize Audio Objects
    useEffect(() => {
        (Object.keys(SOUND_URLS) as SoundType[]).forEach(type => {
            if (!audioRefs.current[type]) {
                const audio = new Audio(SOUND_URLS[type]);
                audio.loop = true;
                audioRefs.current[type] = audio;
            }
        });
    }, []);

    // Sync Audio State
    useEffect(() => {
        (Object.keys(SOUND_URLS) as SoundType[]).forEach(type => {
            const audio = audioRefs.current[type];
            if (audio) {
                audio.volume = volumes[type] / 100;
                if (playing[type] && audio.paused) {
                    audio.play().catch(e => console.error("Audio play failed", e));
                } else if (!playing[type] && !audio.paused) {
                    audio.pause();
                }
            }
        });
    }, [volumes, playing]);

    const toggleSound = (type: SoundType) => {
        setPlaying(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const setVolume = (type: SoundType, volume: number) => {
        setVolumes(prev => ({ ...prev, [type]: volume }));
    };

    return (
        <SoundContext.Provider value={{ volumes, playing, toggleSound, setVolume }}>
            {children}
        </SoundContext.Provider>
    );
};
