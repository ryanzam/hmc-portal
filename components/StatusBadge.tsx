import type { ApplicationStatus } from "@/types";

const STYLES: Record<ApplicationStatus, string> = {
    pending: "bg-amber-100 text-amber-800 ring-amber-600/20",
    reviewed: "bg-red-100 text-red-800 ring-red-600/20",
    completed: "bg-green-100 text-green-800 ring-green-600/20",
};

interface StatusBadgeProps {
    status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const style = STYLES[status] ?? STYLES.pending;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${style}`}
        >
            {status}
        </span>
    );
}
