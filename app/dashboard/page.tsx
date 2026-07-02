import Link from "next/link";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Application, { IApplication } from "@/models/Application";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {

    const session = await auth();

    await connectDB();
    const applications = await Application.find({ userId: (session!.user as any).id })
        .sort({ createdAt: -1 })
        .lean<IApplication[]>();

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        My Applications
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Track the status of your submitted service applications.
                    </p>
                </div>
                <Link
                    href="/dashboard/apply"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    + New Application
                </Link>
            </div>

            <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {applications.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-500">
                        You haven&apos;t submitted any applications yet.
                    </p>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
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
                                <tr key={app._id.toString()}>
                                    <td className="px-4 py-3 text-sm text-slate-800">
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
                                            href={`/dashboard/applications/${app._id.toString()}`}
                                            className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
                                        >
                                            View
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
