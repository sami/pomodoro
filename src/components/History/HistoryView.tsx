import { type FC } from 'react';
import { Download, Trash2, Clock, Calendar } from 'lucide-react';
import { useTimerContext, type HistoryItem } from '../../context/TimerContext';

export const HistoryView: FC = () => {
    const { history, clearHistory, exportHistory } = useTimerContext();

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary font-display">History</h2>
                <div className="flex gap-2">
                    <button
                        onClick={exportHistory}
                        className="p-2 rounded-xl bg-surface-light dark:bg-white/10 hover:text-primary transition-colors"
                        title="Download CSV"
                        disabled={history.length === 0}
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to clear history?')) clearHistory();
                        }}
                        className="p-2 rounded-xl bg-surface-light dark:bg-white/10 hover:text-red-500 transition-colors"
                        title="Clear History"
                        disabled={history.length === 0}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                {history.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-50">
                        <Clock size={48} className="mb-2 opacity-20" />
                        <p className="text-sm">No sessions yet.</p>
                        <p className="text-xs">Complete a timer to see it here.</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <HistoryCard
                            key={item.id}
                            item={item}
                            formatDate={formatDate}
                            formatDuration={formatDuration}
                        />
                    ))
                )}
            </div>

            {history.length > 0 && (
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between text-xs font-bold opacity-50">
                    <span>Total Sessions</span>
                    <span>{history.length}</span>
                </div>
            )}
        </div>
    );
};

const HistoryCard = ({ item, formatDate, formatDuration }: { item: HistoryItem, formatDate: (s: string) => string, formatDuration: (n: number) => string }) => (
    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-1">
        <div className="flex justify-between items-start">
            <span className="font-bold text-sm truncate pr-2">{item.taskName}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.type === 'work' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'
                }`}>
                {item.type === 'work' ? 'Focus' : 'Break'}
            </span>
        </div>
        <div className="flex justify-between items-end mt-1 opacity-60">
            <div className="flex items-center gap-1 text-xs">
                <Calendar size={12} />
                {formatDate(item.endTime)}
            </div>
            <div className="text-xs font-mono font-bold">
                {formatDuration(item.durationSeconds)}
            </div>
        </div>
    </div>
);
