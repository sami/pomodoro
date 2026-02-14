interface TaskInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
}

export const TaskInput = ({ value, onChange, onSubmit }: TaskInputProps) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onSubmit?.();
                }
            }}
            placeholder="What are you focusing on?"
            className="w-full bg-transparent text-center text-lg font-semibold text-text-main placeholder:text-text-main/50 focus:outline-none sm:text-xl md:text-2xl"
        />
    );
};
