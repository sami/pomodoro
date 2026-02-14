import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerOptions {
    initialMs: number;
    onComplete?: () => void;
}

export const useTimer = ({ initialMs, onComplete }: UseTimerOptions) => {
    const [remainingMs, setRemainingMs] = useState(initialMs);
    const [isRunning, setIsRunning] = useState(false);

    const remainingRef = useRef(remainingMs);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        remainingRef.current = remainingMs;
    }, [remainingMs]);

    const stopRaf = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback((nextMs: number) => {
        stopRaf();
        setIsRunning(false);
        remainingRef.current = nextMs;
        setRemainingMs(nextMs);
    }, [stopRaf]);

    useEffect(() => {
        if (!isRunning) {
            stopRaf();
            return;
        }

        let last = performance.now();

        const tick = (now: number) => {
            const delta = now - last;
            last = now;
            const next = Math.max(0, remainingRef.current - delta);
            remainingRef.current = next;
            setRemainingMs(next);

            if (next <= 0) {
                setIsRunning(false);
                stopRaf();
                onComplete?.();
                return;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => stopRaf();
    }, [isRunning, onComplete, stopRaf]);

    return {
        remainingMs,
        isRunning,
        start,
        pause,
        reset,
        setIsRunning,
    };
};
