import { type ReactNode, useEffect, useState } from 'react';
import { Settings2, History, X } from 'lucide-react';
import { UpdateToast } from './components/UpdateToast';
import { useKeyboardControls } from './hooks/useKeyboardControls';

interface LayoutProps {
    children: ReactNode;
    settingsContent: ReactNode;
    historyContent: ReactNode;
    onToggleTimer?: () => void;
    onResetTimer?: () => void;
    onMuteAll?: () => void;
}

type Drawer = 'settings' | 'history' | null;

export const Layout = ({ children, settingsContent, historyContent, onToggleTimer, onResetTimer, onMuteAll }: LayoutProps) => {
    const [drawer, setDrawer] = useState<Drawer>(null);

    useEffect(() => {
        document.body.style.overflow = drawer ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawer]);

    useKeyboardControls({
        onToggleTimer,
        onResetTimer,
        onMuteAll,
        onOpenSettings: () => setDrawer('settings'),
        onOpenHistory: () => setDrawer('history'),
    });

    const isOpen = drawer !== null;

    return (
        <div className="relative min-h-dvh bg-background text-text-main">
            {/* Corner Navigation */}
            <div className="absolute left-4 top-4 z-20">
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-text-main/60 transition-opacity hover:opacity-80 cursor-pointer"
                    aria-label="Open Settings"
                    onClick={() => setDrawer('settings')}
                >
                    <Settings2 size={24} strokeWidth={1.5} />
                </button>
            </div>
            <div className="absolute right-4 top-4 z-20">
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-text-main/60 transition-opacity hover:opacity-80 cursor-pointer"
                    aria-label="Open History"
                    onClick={() => setDrawer('history')}
                >
                    <History size={24} strokeWidth={1.5} />
                </button>
            </div>

            {/* Center Content */}
            <main className="flex min-h-dvh items-center justify-center">
                {children}
            </main>

            {/* Footer */}
            <footer className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
                <p className="text-[11px] text-text-main/40">
                    Made by{' '}
                    <a
                        href="https://sami.codes"
                        target="_blank"
                        rel="noreferrer"
                        className="pointer-events-auto underline decoration-transparent transition hover:decoration-text-main/60"
                    >
                        Sami
                    </a>
                </p>
            </footer>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={() => setDrawer(null)}
            />

            {/* Settings Drawer */}
            <aside
                className={`fixed left-0 top-0 z-40 h-full w-[85%] max-w-sm border-r border-white/10 bg-white/85 p-6 text-text-main shadow-xl backdrop-blur-xl transition-[transform,opacity] duration-300 dark:bg-[#3A3636]/90 dark:text-white ${
                    drawer === 'settings' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                }`}
                aria-hidden={drawer !== 'settings'}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <button
                        className="rounded-full p-2 text-text-main/60 transition-opacity hover:opacity-80 cursor-pointer dark:text-white/60"
                        onClick={() => setDrawer(null)}
                        aria-label="Close Settings"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                {settingsContent}
            </aside>

            {/* History Drawer */}
            <aside
                className={`fixed right-0 top-0 z-40 h-full w-[85%] max-w-sm border-l border-white/10 bg-white/85 p-6 text-text-main shadow-xl backdrop-blur-xl transition-[transform,opacity] duration-300 dark:bg-[#3A3636]/90 dark:text-white ${
                    drawer === 'history' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
                aria-hidden={drawer !== 'history'}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">History</h2>
                    <button
                        className="rounded-full p-2 text-text-main/60 transition-opacity hover:opacity-80 cursor-pointer dark:text-white/60"
                        onClick={() => setDrawer(null)}
                        aria-label="Close History"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                {historyContent}
            </aside>

            <UpdateToast />
        </div>
    );
};
