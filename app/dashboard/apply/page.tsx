"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SERVICE_TYPES, type Address, type ServiceType, type UploadedFile } from "@/types";
import StepIndicator from "@/components/StepIndicator";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 5 * 1024 * 1024;

interface ApplyFormState {
    fullName: string;
    phone: string;
    address: Address;
    serviceType: ServiceType | "";
    description: string;
}

interface SelectedFile {
    file: File;
    error: string | null;
}

type FormErrors = Partial<
    Record<
        "fullName" | "phone" | "street" | "city" | "state" | "zip" | "serviceType",
        string
    >
>;

const initialState: ApplyFormState = {
    fullName: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "" },
    serviceType: "",
    description: "",
};

export default function ApplyPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<ApplyFormState>({
        ...initialState,
        fullName: session?.user?.name || "",
    });
    const [files, setFiles] = useState<SelectedFile[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function updateField<K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function updateAddress<K extends keyof Address>(field: K, value: Address[K]) {
        setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    }

    function validateStep1(): boolean {
        const next: FormErrors = {};
        if (!form.fullName.trim()) next.fullName = "Full name is required.";
        if (!form.phone.trim()) next.phone = "Phone number is required.";
        if (!form.address.street.trim()) next.street = "Street address is required.";
        if (!form.address.city.trim()) next.city = "City is required.";
        if (!form.address.state.trim()) next.state = "State is required.";
        if (!form.address.zip.trim()) next.zip = "Zip code is required.";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function validateStep2(): boolean {
        const next: FormErrors = {};
        if (!form.serviceType) next.serviceType = "Please select a service type.";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const selected = Array.from(e.target.files ?? []);
        const validated: SelectedFile[] = selected.map((file) => {
            const ext = "." + file.name.split(".").pop()!.toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return { file, error: "Only PDF, DOC, or DOCX files are allowed." };
            }
            if (file.size > MAX_SIZE) {
                return { file, error: "File must be smaller than 5MB." };
            }
            return { file, error: null };
        });
        setFiles((prev) => [...prev, ...validated]);
        e.target.value = "";
    }

    function removeFile(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function goNext() {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep((s) => Math.min(s + 1, 4));
    }

    function goBack() {
        setStep((s) => Math.max(s - 1, 1));
    }

    async function handleSubmit() {
        setSubmitError("");

        const hasFileErrors = files.some((f) => f.error);
        if (hasFileErrors) {
            setSubmitError("Please remove invalid files before submitting.");
            return;
        }

        if (!form.serviceType) {
            setSubmitError("Please select a service type.");
            return;
        }

        setSubmitting(true);
        try {
            const uploadedFiles: UploadedFile[] = [];
            for (const { file } of files) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || `Failed to upload ${file.name}`);
                }
                uploadedFiles.push(data as UploadedFile);
            }

            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, files: uploadedFiles }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit application.");
            }

            router.push(`/dashboard/applications/${data.application._id}`);

        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="text-2xl font-semibold text-slate-900">New Application</h1>
            <p className="mt-1 text-sm text-slate-500">
                Complete all steps to submit your service application.
            </p>

            <div className="mt-8">
                <StepIndicator current={step} />
            </div>

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium text-slate-900">Personal Details</h2>

                        <Field label="Full Name" error={errors.fullName}>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={(e) => updateField("fullName", e.target.value)}
                                className={inputClass(errors.fullName)}
                            />
                        </Field>

                        <Field label="Phone Number" error={errors.phone}>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                className={inputClass(errors.phone)}
                            />
                        </Field>

                        <Field label="Email">
                            <input
                                type="email"
                                value={session?.user?.email ?? ""}
                                disabled
                                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                            />
                        </Field>

                        <Field label="Street Address" error={errors.street}>
                            <input
                                type="text"
                                value={form.address.street}
                                onChange={(e) => updateAddress("street", e.target.value)}
                                className={inputClass(errors.street)}
                            />
                        </Field>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="City" error={errors.city}>
                                <input
                                    type="text"
                                    value={form.address.city}
                                    onChange={(e) => updateAddress("city", e.target.value)}
                                    className={inputClass(errors.city)}
                                />
                            </Field>
                            <Field label="State" error={errors.state}>
                                <input
                                    type="text"
                                    value={form.address.state}
                                    onChange={(e) => updateAddress("state", e.target.value)}
                                    className={inputClass(errors.state)}
                                />
                            </Field>
                            <Field label="Zip Code" error={errors.zip}>
                                <input
                                    type="text"
                                    value={form.address.zip}
                                    onChange={(e) => updateAddress("zip", e.target.value)}
                                    className={inputClass(errors.zip)}
                                />
                            </Field>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium text-slate-900">Service Details</h2>

                        <Field label="Service Type" error={errors.serviceType}>
                            <select
                                value={form.serviceType}
                                onChange={(e) => updateField("serviceType", e.target.value as ServiceType)}
                                className={inputClass(errors.serviceType)}
                            >
                                <option value="">Select a service...</option>
                                {SERVICE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Description / Notes">
                            <textarea
                                rows={5}
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Briefly describe what you need help with..."
                                className={inputClass()}
                            />
                        </Field>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium text-slate-900">Upload Documents</h2>
                        <p className="text-sm text-slate-500">
                            Accepted formats: PDF, DOC, DOCX (max 5MB per file).
                        </p>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-slate-400">
                            <span className="text-sm font-medium text-slate-700">
                                Click to choose files
                            </span>
                            <span className="mt-1 text-xs text-slate-400">or drag and drop</span>
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>

                        {files.length > 0 && (
                            <ul className="flex flex-col gap-2">
                                {files.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    >
                                        <div>
                                            <p className="text-slate-700">{f.file.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {(f.file.size / 1024).toFixed(0)} KB
                                            </p>
                                            {f.error && <p className="text-xs text-red-600">{f.error}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium text-slate-900">Review &amp; Submit</h2>

                        <ReviewSection title="Personal Details">
                            <ReviewRow label="Name" value={form.fullName} />
                            <ReviewRow label="Phone" value={form.phone} />
                            <ReviewRow label="Email" value={session?.user?.email ?? ""} />
                            <ReviewRow
                                label="Address"
                                value={`${form.address.street}, ${form.address.city}, ${form.address.state} ${form.address.zip}`}
                            />
                        </ReviewSection>

                        <ReviewSection title="Service Details">
                            <ReviewRow label="Service Type" value={form.serviceType} />
                            <ReviewRow label="Notes" value={form.description || "—"} />
                        </ReviewSection>

                        <ReviewSection title="Documents">
                            {files.length === 0 ? (
                                <p className="text-sm text-slate-500">No files attached.</p>
                            ) : (
                                <ul className="list-inside list-disc text-sm text-slate-700">
                                    {files.map((f, i) => (
                                        <li key={i}>{f.file.name}</li>
                                    ))}
                                </ul>
                            )}
                        </ReviewSection>

                        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                    </div>
                )}

                <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={step === 1 || submitting}
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Application"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function inputClass(error?: string): string {
    return `mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${error
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        }`;
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-md bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <div className="mt-2 flex flex-col gap-1">{children}</div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{label}:</span> {value}
        </p>
    );
}
