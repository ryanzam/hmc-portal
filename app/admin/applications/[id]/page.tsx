import { notFound } from "next/navigation";
import Link from "next/link";
import Application, { type IApplication } from "@/models/Application";
import StatusBadge from "@/components/StatusBadge";
import mongoose from "mongoose";
import type { PopulatedUserRef } from "@/types";
import type { ReactNode } from "react";
import connectDB from "@/lib/db";
import AdminReviewActions from "@/components/AdminReviewActions";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

type PopulatedApplication = Omit<IApplication, "userId"> & {
    _id: unknown;
    userId: PopulatedUserRef;
};

export default async function AdminApplicationDetailPage({ params }: PageProps) {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) notFound();

    await connectDB();
    const application = await Application.findById(id)
        .populate<{ userId: PopulatedUserRef }>("userId", "name email")
        .lean<PopulatedApplication>();

    if (!application) notFound();

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
                ← Back to all applications
            </Link>

            <div className="mt-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900">
                    {application.serviceType} Application
                </h1>
                <StatusBadge status={application.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
                Submitted {new Date(application.submittedAt).toLocaleString()}
            </p>

            <div className="mt-8 flex flex-col gap-6">
                <Section title="Applicant Account">
                    <Row label="Account Name" value={application.userId?.name} />
                    <Row label="Account Email" value={application.userId?.email} />
                </Section>

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

                <AdminReviewActions
                    applicationId={String(application._id)}
                    currentStatus={application.status}
                    currentRemark={application.adminRemark}
                />
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
