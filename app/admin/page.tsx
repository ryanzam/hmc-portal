import Link from "next/link";
import { APPLICATION_STATUSES, type ApplicationStatus, type PopulatedUserRef } from "@/types";
import connectDB from "@/lib/db";
import Application, { IApplication } from "@/models/Application";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ status?: string }>;
}

type PopulatedApplication = Omit<IApplication, "userId"> & {
    _id: unknown;
    userId: PopulatedUserRef;
};

export default async function AdminPage({ searchParams }: PageProps) {
    const { status } = await searchParams;

    await connectDB();
    const query: Record<string, ApplicationStatus> = {};
    if (status && APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
        query.status = status as ApplicationStatus;
    }

    const applications = await Application.find(query)
        .sort({ createdAt: -1 })
        .populate<{ userId: PopulatedUserRef }>("userId", "name email")
        .lean<PopulatedApplication[]>();

    const filters: { label: string; value: string }[] = [
        { label: "All", value: "" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <h1 className="text-2xl font-semibold text-slate-900">All Applications</h1>
            <p className="mt-1 text-sm text-slate-500">
                Review submitted applications and update their status.
            </p>

            <div className="mt-6 flex gap-2">
                {filters.map((f) => (
                    <Link
                        key={f.value}
                        href={f.value ? `/admin?status=${f.value}` : "/admin"}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${(status || "") === f.value
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                            }`}
                    >
                        {f.label}
                    </Link>
                ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {applications.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-500">
                        No applications found.
                    </p>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Applicant
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Service Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Submitted
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {applications.map((app) => (
                                <tr key={String(app._id)}>
                                    <td className="px-4 py-3 text-sm text-slate-800">
                                        {app.userId?.name || app.fullName}
                                        <div className="text-xs text-slate-400">{app.userId?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {app.serviceType}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        {new Date(app.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/applications/${String(app._id)}`}
                                            className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
                                        >
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
