import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <>
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/80">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            {offlineReady ? (
                                <p className="text-sm text-text-main dark:text-white">
                                    App ready to work offline
                                </p>
                            ) : (
                                <div>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">
                                        New version available
                                    </p>
                                    <p className="mt-1 text-xs text-text-main/70 dark:text-white/70">
                                        Reload to update
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {needRefresh && (
                                <button
                                    onClick={() => updateServiceWorker(true)}
                                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                                >
                                    Reload
                                </button>
                            )}
                            <button
                                onClick={close}
                                className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-text-main/80 transition hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
