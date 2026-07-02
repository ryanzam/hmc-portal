const STEPS = ["Personal Details", "Service Details", "Documents", "Review"] as const;

interface StepIndicatorProps {
    current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
    return (
        <ol className="flex w-full items-center">
            {STEPS.map((label, index) => {
                const step = index + 1;
                const isActive = step === current;
                const isDone = step < current;

                return (
                    <li key={label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${isDone
                                        ? "bg-slate-900 text-white"
                                        : isActive
                                            ? "border-2 border-[#d0a43a] text-[#d0a43a]"
                                            : "border-2 border-slate-300 text-slate-400"
                                    }`}
                            >
                                {isDone ? "✓" : step}
                            </div>
                            <span
                                className={`mt-1 hidden text-xs sm:block ${isActive ? "font-medium text-slate-900" : "text-slate-400"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {step !== STEPS.length && (
                            <div
                                className={`mx-2 h-0.5 flex-1 ${isDone ? "bg-slate-900" : "bg-slate-200"
                                    }`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
