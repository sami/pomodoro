import { useRegisterSW } from 'virtual:pwa-register/react'

export const ReloadPrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setNeedRefresh(false)
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {needRefresh && (
                <div className="bg-surface-light dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 p-4 rounded-xl shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <div className="text-sm font-medium">
                        New update available.
                    </div>
                    <button
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Reload
                    </button>
                    <button
                        className="text-xs opacity-50 hover:opacity-100"
                        onClick={close}
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    )
}
