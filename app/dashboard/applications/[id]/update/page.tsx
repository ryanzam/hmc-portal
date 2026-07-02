import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import Application, { type IApplication } from "@/models/Application";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import UpdateApplicationForm from "@/components/UpdateApplicationForm";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();

    if (!mongoose.isValidObjectId(id)) notFound();

    await connectDB();
    const application = await Application.findById(id).lean<IApplication>();

    if (!application) notFound();
    if (application.userId.toString() !== (session!.user as any).id) {
        redirect("/dashboard");
    }
    if (application.status === "completed") {
        redirect(`/dashboard/applications/${id}`);
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Link
                href={`/dashboard/applications/${id}`}
                className="text-sm text-slate-500 hover:underline"
            >
                ← Back to application
            </Link>

            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
                Edit Application
            </h1>
            <p className="mt-1 text-sm text-slate-500">
                Update your details or add additional documents. Saving will move
                this application back to pending review.
            </p>

            <div className="mt-8">
                <UpdateApplicationForm
                    applicationId={id}
                    initialData={{
                        fullName: application.fullName,
                        phone: application.phone,
                        address: application.address,
                        serviceType: application.serviceType,
                        description: application.description,
                        files: application.files.map((f) => ({
                            fileName: f.fileName,
                            fileUrl: f.fileUrl,
                            fileType: f.fileType,
                        })),
                    }}
                />
            </div>
        </div>
    );
}
