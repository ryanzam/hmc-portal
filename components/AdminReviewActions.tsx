"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "@/types";

interface AdminReviewActionsProps {
    applicationId: string;
    currentStatus: ApplicationStatus;
    currentRemark: string;
}

export default function AdminReviewActions({
    applicationId,
    currentStatus,
    currentRemark,
}: AdminReviewActionsProps) {
    const router = useRouter();
    const [remark, setRemark] = useState(currentRemark || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function updateStatus(status: ApplicationStatus) {
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, adminRemark: remark }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update status.");

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Review Decision</h2>
            <p className="mt-1 text-xs text-slate-500">
                Current status:{" "}
                <span className="font-medium capitalize text-slate-700">{currentStatus}</span>
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700">
                Remark (optional)
            </label>
            <textarea
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add a note for the applicant..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex gap-3">
                <button
                    type="button"
                    onClick={() => updateStatus("completed")}
                    disabled={loading}
                    className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                    Completed
                </button>
                <button
                    type="button"
                    onClick={() => updateStatus("incomplete submission")}
                    disabled={loading}
                    className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                    Incomplete Submission
                </button>
                {currentStatus !== "pending" && (
                    <button
                        type="button"
                        onClick={() => updateStatus("pending")}
                        disabled={loading}
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Reset to Pending
                    </button>
                )}
            </div>
        </div>
    );
}
