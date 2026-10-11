"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const justVerified = searchParams.get("verified") === "1";

    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [error, setError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setNeedsVerification(false);
        setLoading(true);

        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        if (res?.error) {
            try {
                const statusRes = await fetch(
                    `/api/auth-status?email=${encodeURIComponent(form.email)}`
                );
                const statusData = (await statusRes.json()) as {
                    needsVerification: boolean;
                };

                if (statusData.needsVerification) {
                    setNeedsVerification(true);
                    setError("Please verify your email before logging in.");
                    setLoading(false);
                    return;
                }
            } catch {
                // Silently ignore — fall through to generic error
            }

            setError("Invalid email or password.");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="mx-auto flex max-w-md flex-col px-4 py-16">
            {justVerified && (
                <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    Your email has been verified. You can now log in.
                </div>
            )}

            <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
            <p className="mt-1 text-sm text-slate-500">
                Access your service application dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            setNeedsVerification(false);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">{error}</p>
                        {needsVerification && (
                            <Link
                                href={`/verify-email?email=${encodeURIComponent(form.email)}`}
                                className="mt-1 inline-block text-sm font-medium text-red-800 underline"
                            >
                                Verify your email →
                            </Link>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    {loading ? "Logging in…" : "Log in"}
                </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-slate-900 underline">
                    Register
                </Link>
            </p>
        </div>
    );
}
