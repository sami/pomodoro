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
    lofi: '/sounds/lofi.mp3',
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

    // Preload and setup audio elements
    useEffect(() => {
        Object.entries(SOUND_FILES).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.loop = true;
            audio.preload = 'auto';
            audioRefs.current[key as AmbientSound] = audio;
        });

        return () => {
            Object.values(audioRefs.current).forEach((audio) => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    // Sync audio playback with state
    useEffect(() => {
        Object.entries(sounds).forEach(([key, state]) => {
            const audio = audioRefs.current[key as AmbientSound];
            if (!audio) return;

            audio.volume = state.volume;

            if (state.enabled && audio.paused) {
                audio.play().catch(() => {
                    // Auto-play blocked, user needs to interact first
                });
            } else if (!state.enabled && !audio.paused) {
                audio.pause();
            }
        });
    }, [sounds]);

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
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.value = notificationVolume;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.15);
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
