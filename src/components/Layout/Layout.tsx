import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface LayoutProps {
    timerSlot: ReactNode;
    settingsSlot: ReactNode;
    statsSlot: ReactNode;
}

const PANELS = ['Settings', 'Timer', 'Stats'] as const;

export const Layout: FC<LayoutProps> = ({ timerSlot, settingsSlot, statsSlot }) => {
    const [activeIndex, setActiveIndex] = useState(1);
    const snapRef = useRef<HTMLDivElement>(null);

    /* Scroll to Timer (center panel) on first mount */
    useEffect(() => {
        const el = snapRef.current;
        if (!el) return;
        requestAnimationFrame(() => {
            el.scrollTo({ left: el.clientWidth, behavior: 'instant' as ScrollBehavior });
        });
    }, []);

    /* Track active panel from scroll position */
    useEffect(() => {
        const el = snapRef.current;
        if (!el) return;
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const idx = Math.round(el.scrollLeft / el.clientWidth);
                    setActiveIndex(idx);
                    ticking = false;
                });
                ticking = true;
            }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = useCallback((index: number) => {
        const el = snapRef.current;
        if (!el) return;
        el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
    }, []);

    return (
        <div className="h-dvh w-screen overflow-hidden bg-background text-foreground font-sans">

            {/* ═══ Desktop · Bento Grid ═══ */}
            <div className="hidden md:grid md:grid-cols-[1fr_1.5fr_1fr] gap-5 p-5 h-full max-w-7xl mx-auto">
                <aside className="bg-surface rounded-3xl p-6 border border-border overflow-y-auto">
                    {settingsSlot}
                </aside>

                <main className="flex flex-col items-center justify-center">
                    {timerSlot}
                </main>

                <aside className="bg-surface rounded-3xl p-6 border border-border overflow-y-auto">
                    {statsSlot}
                </aside>
            </div>

            {/* ═══ Mobile · Snap Carousel ═══ */}
            <div className="md:hidden flex flex-col h-full">
                <div ref={snapRef} className="snap-container flex-1">
                    <section className="snap-panel p-5 pt-14 overflow-y-auto">
                        {settingsSlot}
                    </section>

                    <section className="snap-panel items-center justify-center p-5">
                        {timerSlot}
                    </section>

                    <section className="snap-panel p-5 pt-14 overflow-y-auto">
                        {statsSlot}
                    </section>
                </div>

                {/* Pagination Dots */}
                <nav
                    className="flex items-center justify-center gap-2.5 pb-8 pt-3"
                    aria-label="Panel navigation"
                >
                    {PANELS.map((label, i) => (
                        <button
                            key={label}
                            onClick={() => scrollTo(i)}
                            aria-label={label}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                activeIndex === i
                                    ? 'w-6 bg-primary'
                                    : 'w-2 bg-muted'
                            }`}
                        />
                    ))}
                </nav>
            </div>

            {/* Footer (Desktop only) */}
            <div className="hidden md:block fixed bottom-3 left-0 right-0 text-center pointer-events-none">
                <p className="text-xs font-medium text-muted pointer-events-auto">
                    Made by{' '}
                    <a
                        href="https://sami.codes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                    >
                        Sami
                    </a>
                </p>
            </div>
        </div>
    );
};
