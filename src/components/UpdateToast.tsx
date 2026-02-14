import { useRegisterSW } from 'virtual:pwa-register/react';

export const UpdateToast = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border border-black/10 bg-white/90 p-4 text-sm text-text-main shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#3A3636]/90 dark:text-white">
            <p className="font-semibold">Update available</p>
            <p className="mt-1 text-xs text-text-main/60 dark:text-white/60">
                Reload to get the latest improvements.
            </p>
            <div className="mt-3 flex items-center gap-2">
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                >
                    Refresh
                </button>
                <button
                    onClick={() => setNeedRefresh(false)}
                    className="rounded-full px-3 py-1.5 text-xs text-text-main/70 transition hover:bg-black/10 dark:text-white/70 dark:hover:bg-white/10"
                >
                    Later
                </button>
            </div>
        </div>
    );
};
