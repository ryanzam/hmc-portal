import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import Application, { type IApplication } from "@/models/Application";
import StatusBadge from "@/components/StatusBadge";
import mongoose from "mongoose";
import type { ReactNode } from "react";
import connectDB from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();

    if (!mongoose.isValidObjectId(id)) notFound();

    await connectDB();
    const application = await Application.findById(id).lean<IApplication>();

    if (!application) notFound();
    if (application.userId.toString() !== (session!.user as any).id) {
        redirect("/dashboard");
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
                ← Back to dashboard
            </Link>

            <div className="mt-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900">
                    {application.serviceType} Application
                </h1>
                <div className="flex items-center gap-3">
                    <StatusBadge status={application.status} />
                    {application.status !== "completed" && (
                        <Link
                            href={`/dashboard/applications/${id}/update`}
                            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Update
                        </Link>
                    )}
                </div>
            </div>
            <p className="mt-1 text-sm text-slate-500">
                Submitted {new Date(application.submittedAt).toLocaleString()}
            </p>

            <div className="mt-8 flex flex-col gap-6">
                <Section title="Personal Details">
                    <Row label="Name" value={application.fullName} />
                    <Row label="Phone" value={application.phone} />
                    <Row
                        label="Address"
                        value={`${application.address.street}, ${application.address.city}, ${application.address.state} ${application.address.zip}`}
                    />
                </Section>

                <Section title="Service Details">
                    <Row label="Service Type" value={application.serviceType} />
                    <Row label="Notes" value={application.description || "—"} />
                </Section>

                <Section title="Documents">
                    {application.files.length === 0 ? (
                        <p className="text-sm text-slate-500">No files attached.</p>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {application.files.map((f, i) => (
                                <li key={i}>
                                    <a
                                        href={f.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
                                    >
                                        {f.fileName}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                {application.status !== "pending" && (
                    <Section title="Admin Review">
                        <Row
                            label="Status"
                            value={application.status[0].toUpperCase() + application.status.slice(1)}
                        />
                        <Row label="Remark" value={application.adminRemark || "—"} />
                    </Section>
                )}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <div className="mt-3 flex flex-col gap-2">{children}</div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{label}:</span> {value}
        </p>
    );
}
