"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_TYPES, type Address, type ServiceType, type UploadedFile } from "@/types";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 5 * 1024 * 1024;

interface EditFormState {
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

interface UpdateApplicationFormProps {
    applicationId: string;
    initialData: EditFormState & { files: UploadedFile[] };
}

export default function UpdateApplicationForm({
    applicationId,
    initialData,
}: UpdateApplicationFormProps) {
    const router = useRouter();

    const [form, setForm] = useState<EditFormState>({
        fullName: initialData.fullName,
        phone: initialData.phone,
        address: initialData.address,
        serviceType: initialData.serviceType,
        description: initialData.description,
    });
    const [existingFiles, setExistingFiles] = useState<UploadedFile[]>(initialData.files);
    const [newFiles, setNewFiles] = useState<SelectedFile[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function updateField<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function updateAddress<K extends keyof Address>(field: K, value: Address[K]) {
        setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    }

    function validate(): boolean {
        const next: FormErrors = {};
        if (!form.fullName.trim()) next.fullName = "Full name is required.";
        if (!form.phone.trim()) next.phone = "Phone number is required.";
        if (!form.address.street.trim()) next.street = "Street address is required.";
        if (!form.address.city.trim()) next.city = "City is required.";
        if (!form.address.state.trim()) next.state = "State is required.";
        if (!form.address.zip.trim()) next.zip = "Zip code is required.";
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
        setNewFiles((prev) => [...prev, ...validated]);
        e.target.value = "";
    }

    function removeExistingFile(index: number) {
        setExistingFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function removeNewFile(index: number) {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        setSubmitError("");

        if (!validate()) return;

        const hasFileErrors = newFiles.some((f) => f.error);
        if (hasFileErrors) {
            setSubmitError("Please remove invalid files before saving.");
            return;
        }

        setSubmitting(true);
        try {
            const uploadedFiles: UploadedFile[] = [];
            for (const { file } of newFiles) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || `Failed to upload ${file.name}`);
                }
                uploadedFiles.push(data as UploadedFile);
            }

            const res = await fetch(`/api/applications/${applicationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    files: [...existingFiles, ...uploadedFiles],
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update application.");
            }

            router.push(`/dashboard/applications/${applicationId}`);
            router.refresh();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-4">
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
                </section>

                <section className="flex flex-col gap-4 border-t border-slate-100 pt-6">
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
                            rows={4}
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Briefly describe what you need help with..."
                            className={inputClass()}
                        />
                    </Field>
                </section>

                <section className="flex flex-col gap-4 border-t border-slate-100 pt-6">
                    <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                    <p className="text-sm text-slate-500">
                        Accepted formats: PDF, DOC, DOCX (max 5MB per file).
                    </p>

                    {existingFiles.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Currently attached
                            </p>
                            <ul className="flex flex-col gap-2">
                                {existingFiles.map((f, i) => (
                                    <li
                                        key={`${f.fileUrl}-${i}`}
                                        className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    >
                                        <a
                                            href={f.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-700 underline hover:text-slate-900"
                                        >
                                            {f.fileName}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(i)}
                                            className="text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-slate-400">
                        <span className="text-sm font-medium text-slate-700">
                            Click to add more files
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

                    {newFiles.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                New files to upload
                            </p>
                            <ul className="flex flex-col gap-2">
                                {newFiles.map((f, i) => (
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
                                            onClick={() => removeNewFile(i)}
                                            className="text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={submitting}
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
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
