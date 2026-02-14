import { useEffect } from 'react';

interface KeyboardControlsOptions {
    onToggleTimer?: () => void;
    onResetTimer?: () => void;
    onMuteAll?: () => void;
    onOpenSettings?: () => void;
    onOpenHistory?: () => void;
}

export const useKeyboardControls = ({
    onToggleTimer,
    onResetTimer,
    onMuteAll,
    onOpenSettings,
    onOpenHistory,
}: KeyboardControlsOptions) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts if user is typing in an input field
            const target = event.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (isTyping) return;

            switch (event.key.toLowerCase()) {
                case ' ':
                    event.preventDefault();
                    onToggleTimer?.();
                    break;
                case 'escape':
                    event.preventDefault();
                    onResetTimer?.();
                    break;
                case 'm':
                    event.preventDefault();
                    onMuteAll?.();
                    break;
                case 's':
                    event.preventDefault();
                    onOpenSettings?.();
                    break;
                case 'h':
                    event.preventDefault();
                    onOpenHistory?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onToggleTimer, onResetTimer, onMuteAll, onOpenSettings, onOpenHistory]);
};
