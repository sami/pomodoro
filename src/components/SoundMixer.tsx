import { useSound, type AmbientSound } from '../context/SoundContext';

const SOUND_LABELS: Record<AmbientSound, string> = {
    rain: 'Rain',
    forest: 'Forest',
    lofi: 'Lo-Fi Music',
    cafe: 'Café Ambience',
};

export const SoundMixer = () => {
    const { sounds, toggleSound, setVolume } = useSound();

    return (
        <div className="space-y-4">
            {(Object.keys(SOUND_LABELS) as AmbientSound[]).map((key) => {
                const state = sounds[key];
                return (
                    <div
                        key={key}
                        className="space-y-2 rounded-xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text-main dark:text-white">
                                {SOUND_LABELS[key]}
                            </span>
                            <button
                                onClick={() => toggleSound(key)}
                                className={`relative h-6 w-11 rounded-full transition-colors ${
                                    state.enabled
                                        ? 'bg-primary'
                                        : 'bg-black/20 dark:bg-white/20'
                                }`}
                                aria-label={`Toggle ${SOUND_LABELS[key]}`}
                            >
                                <span
                                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                        state.enabled ? 'translate-x-5' : ''
                                    }`}
                                />
                            </button>
                        </div>
                        {state.enabled && (
                            <div className="space-y-1">
                                <label className="text-xs text-text-main/60 dark:text-white/60">
                                    Volume
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={state.volume}
                                    onChange={(e) => setVolume(key, Number(e.target.value))}
                                    className="w-full accent-primary"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
