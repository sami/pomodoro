import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

type FocusSound = 'none' | 'rain' | 'white-noise';

type SoundContextValue = {
    focusSound: FocusSound;
    setFocusSound: (sound: FocusSound) => void;
    focusVolume: number;
    setFocusVolume: (volume: number) => void;
    notificationVolume: number;
    setNotificationVolume: (volume: number) => void;
    playFocusSound: () => void;
    stopFocusSound: () => void;
    playNotification: () => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

const createNoiseNode = (context: AudioContext) => {
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [focusSound, setFocusSound] = useState<FocusSound>('none');
    const [focusVolume, setFocusVolume] = useState(0.35);
    const [notificationVolume, setNotificationVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);
    const focusNodeRef = useRef<AudioNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);

    const ensureContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    };

    const playFocusSound = useCallback(() => {
        if (focusSound === 'none') return;
        const context = ensureContext();
        const gain = context.createGain();
        gain.gain.value = focusVolume;
        gainRef.current = gain;

        const noise = createNoiseNode(context);
        let node: AudioNode = noise;

        if (focusSound === 'rain') {
            const filter = context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            noise.connect(filter);
            node = filter;
        }

        node.connect(gain);
        gain.connect(context.destination);
        noise.start();
        focusNodeRef.current = noise;
    }, [focusSound, focusVolume]);

    const stopFocusSound = useCallback(() => {
        const node = focusNodeRef.current as AudioBufferSourceNode | null;
        if (node) {
            node.stop();
            node.disconnect();
        }
        gainRef.current?.disconnect();
        focusNodeRef.current = null;
    }, []);

    const playNotification = useCallback(() => {
        const context = ensureContext();
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
            focusSound,
            setFocusSound,
            focusVolume,
            setFocusVolume,
            notificationVolume,
            setNotificationVolume,
            playFocusSound,
            stopFocusSound,
            playNotification,
        }),
        [
            focusSound,
            focusVolume,
            notificationVolume,
            playFocusSound,
            playNotification,
            stopFocusSound,
        ]
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
