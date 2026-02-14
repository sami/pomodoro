export interface Quote {
    text: string;
    author: string;
}

const FOCUS_QUOTES: Quote[] = [
    { text: "Focus is the key to all success.", author: "Unknown" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Starve your distractions, feed your focus.", author: "Unknown" },
    { text: "It's not about having time. It's about making time.", author: "Unknown" },
    { text: "Do it with passion or not at all.", author: "Unknown" }
];

const BREAK_QUOTES: Quote[] = [
    { text: "Rest is not idleness.", author: "John Lubbock" },
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "Taking a break can lead to breakthroughs.", author: "Unknown" },
    { text: "Relax, recharge, and reflect.", author: "Unknown" }
];

export const getRandomQuote = (type: 'focus' | 'break'): Quote => {
    const list = type === 'focus' ? FOCUS_QUOTES : BREAK_QUOTES;
    return list[Math.floor(Math.random() * list.length)];
};
