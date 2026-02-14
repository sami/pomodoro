import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type AmbientSound = 'rain' | 'forest' | 'lofi' | 'cafe';

type SoundState = Record<AmbientSound, { enabled: boolean; volume: number }>;

type SoundContextValue = {
    sounds: SoundState;
    toggleSound: (sound: AmbientSound) => void;
    setVolume: (sound: AmbientSound, volume: number) => void;
    notificationVolume: number;
    setNotificationVolume: (volume: number) => void;
    playNotification: () => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

const SOUND_FILES: Record<AmbientSound, string> = {
    rain: '/sounds/rain.mp3',
    forest: '/sounds/forest.mp3',
    lofi: '/sounds/brown-noise.mp3',
    cafe: '/sounds/cafe.mp3',
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [sounds, setSounds] = useState<SoundState>({
        rain: { enabled: false, volume: 0.5 },
        forest: { enabled: false, volume: 0.5 },
        lofi: { enabled: false, volume: 0.5 },
        cafe: { enabled: false, volume: 0.5 },
    });
    const [notificationVolume, setNotificationVolume] = useState(0.5);
    const audioRefs = useRef<Record<AmbientSound, HTMLAudioElement>>({} as Record<AmbientSound, HTMLAudioElement>);
    const audioContextRef = useRef<AudioContext | null>(null);
    const fadeIntervalsRef = useRef<Record<AmbientSound, NodeJS.Timeout | null>>({} as Record<AmbientSound, NodeJS.Timeout | null>);

    // Preload and setup audio elements
    useEffect(() => {
        Object.entries(SOUND_FILES).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.loop = true;
            audio.preload = 'auto';
            audioRefs.current[key as AmbientSound] = audio;
            fadeIntervalsRef.current[key as AmbientSound] = null;
        });

        return () => {
            Object.values(audioRefs.current).forEach((audio) => {
                audio.pause();
                audio.src = '';
            });
            Object.values(fadeIntervalsRef.current).forEach((interval) => {
                if (interval) clearInterval(interval);
            });
        };
    }, []);

    // Fade in audio from 0 to target volume over 1.5 seconds
    const fadeIn = useCallback((sound: AmbientSound, targetVolume: number) => {
        const audio = audioRefs.current[sound];
        if (!audio) return;

        // Clear any existing fade
        if (fadeIntervalsRef.current[sound]) {
            clearInterval(fadeIntervalsRef.current[sound]!);
        }

        audio.volume = 0;
        audio.play().catch(() => {
            // Auto-play blocked
        });

        const fadeDuration = 1500; // 1.5 seconds
        const steps = 30;
        const stepTime = fadeDuration / steps;
        const volumeIncrement = targetVolume / steps;
        let currentStep = 0;

        fadeIntervalsRef.current[sound] = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeIncrement * currentStep, targetVolume);
            audio.volume = newVolume;

            if (currentStep >= steps) {
                clearInterval(fadeIntervalsRef.current[sound]!);
                fadeIntervalsRef.current[sound] = null;
            }
        }, stepTime);
    }, []);

    // Fade out audio from current volume to 0 over 1 second
    const fadeOut = useCallback((sound: AmbientSound) => {
        const audio = audioRefs.current[sound];
        if (!audio) return;

        // Clear any existing fade
        if (fadeIntervalsRef.current[sound]) {
            clearInterval(fadeIntervalsRef.current[sound]!);
        }

        const startVolume = audio.volume;
        const fadeDuration = 1000; // 1 second
        const steps = 20;
        const stepTime = fadeDuration / steps;
        const volumeDecrement = startVolume / steps;
        let currentStep = 0;

        fadeIntervalsRef.current[sound] = setInterval(() => {
            currentStep++;
            const newVolume = Math.max(startVolume - volumeDecrement * currentStep, 0);
            audio.volume = newVolume;

            if (currentStep >= steps) {
                audio.pause();
                clearInterval(fadeIntervalsRef.current[sound]!);
                fadeIntervalsRef.current[sound] = null;
            }
        }, stepTime);
    }, []);

    // Sync audio playback with state
    useEffect(() => {
        Object.entries(sounds).forEach(([key, state]) => {
            const audio = audioRefs.current[key as AmbientSound];
            if (!audio) return;

            if (state.enabled && audio.paused) {
                fadeIn(key as AmbientSound, state.volume);
            } else if (!state.enabled && !audio.paused) {
                fadeOut(key as AmbientSound);
            } else if (state.enabled && !audio.paused) {
                // Update volume for already playing audio (no fade)
                audio.volume = state.volume;
            }
        });
    }, [sounds, fadeIn, fadeOut]);

    const toggleSound = useCallback((sound: AmbientSound) => {
        setSounds((prev) => ({
            ...prev,
            [sound]: { ...prev[sound], enabled: !prev[sound].enabled },
        }));
    }, []);

    const setVolume = useCallback((sound: AmbientSound, volume: number) => {
        setSounds((prev) => ({
            ...prev,
            [sound]: { ...prev[sound], volume },
        }));
    }, []);

    const playNotification = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        const context = audioContextRef.current;
        if (context.state === 'suspended') {
            context.resume();
        }
        
        // Create a bell-like ding with multiple harmonics
        const now = context.currentTime;
        const duration = 0.8;
        
        // Fundamental frequency and harmonics for a pleasant bell sound
        const frequencies = [800, 1000, 1200];
        const gains = [0.4, 0.3, 0.2];
        
        frequencies.forEach((freq, i) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            // Exponential decay envelope for natural bell sound
            gain.gain.setValueAtTime(notificationVolume * gains[i], now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.connect(gain);
            gain.connect(context.destination);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        });
    }, [notificationVolume]);

    const value = useMemo(
        () => ({
            sounds,
            toggleSound,
            setVolume,
            notificationVolume,
            setNotificationVolume,
            playNotification,
        }),
        [sounds, toggleSound, setVolume, notificationVolume, playNotification]
    );

    return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within SoundProvider');
    }
    return context;
};
