import { type FC } from 'react';
import { CloudRain, Coffee, Waves, Volume2, VolumeX } from 'lucide-react';
import { useSoundContext, type SoundType } from '../../context/SoundContext';

export const SoundMixer: FC = () => {
    const { volumes, playing, toggleSound, setVolume } = useSoundContext();

    return (
        <div className="w-full space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4">Focus Sounds</h3>

            <SoundRow
                type="rain"
                label="Rain"
                icon={<CloudRain size={20} />}
                volume={volumes.rain}
                isPlaying={playing.rain}
                onToggle={() => toggleSound('rain')}
                onVolumeChange={(v) => setVolume('rain', v)}
            />
            <SoundRow
                type="coffee"
                label="Coffee Shop"
                icon={<Coffee size={20} />}
                volume={volumes.coffee}
                isPlaying={playing.coffee}
                onToggle={() => toggleSound('coffee')}
                onVolumeChange={(v) => setVolume('coffee', v)}
            />
            <SoundRow
                type="whiteNoise"
                label="White Noise"
                icon={<Waves size={20} />}
                volume={volumes.whiteNoise}
                isPlaying={playing.whiteNoise}
                onToggle={() => toggleSound('whiteNoise')}
                onVolumeChange={(v) => setVolume('whiteNoise', v)}
            />
        </div>
    );
};

interface SoundRowProps {
    type: SoundType;
    label: string;
    icon: React.ReactNode;
    volume: number;
    isPlaying: boolean;
    onToggle: () => void;
    onVolumeChange: (vol: number) => void;
}

const SoundRow: FC<SoundRowProps> = ({ label, icon, volume, isPlaying, onToggle, onVolumeChange }) => (
    <div className={`
        p-4 rounded-2xl border transition-all
        ${isPlaying
            ? 'bg-primary/5 border-primary/20 shadow-sm'
            : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/5 opacity-80 hover:opacity-100'
        }
    `}>
        <div className="flex items-center gap-4">
            <button
                onClick={onToggle}
                className={`
                    p-3 rounded-xl transition-colors
                    ${isPlaying ? 'bg-primary text-white' : 'bg-surface-dark/10 dark:bg-white/10 text-text-light dark:text-text-dark'}
                `}
            >
                {icon}
            </button>

            <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm">{label}</span>
                    <span className="text-xs font-mono opacity-50">{volume}%</span>
                </div>
                <input
                    type="range"
                    min="0" max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                    disabled={!isPlaying}
                />
            </div>

            <button onClick={onToggle} className="opacity-50 hover:opacity-100">
                {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
        </div>
    </div>
);
