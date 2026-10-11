"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") ?? "";

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email) router.replace("/register");
    }, [email, router]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setResendMessage("");

        if (!/^\d{6}$/.test(code.trim())) {
            setError("Please enter the 6-digit code from your email.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: code.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Verification failed. Please try again.");
                return;
            }

            setSuccess(true);
            setTimeout(() => router.push("/login?verified=1"), 2000);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setError("");
        setResendMessage("");
        setResending(true);
        try {
            const res = await fetch("/api/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not resend code. Please try again.");
            } else {
                setResendMessage("A new code has been sent to your email.");
                setCode("");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setResending(false);
        }
    }

    if (success) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                    ✓
                </div>
                <h1 className="mt-6 text-2xl font-semibold text-slate-900">
                    Email verified!
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Your account is now active. Redirecting you to login…
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-md flex-col px-4 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                ✉
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-slate-900">
                Check your email
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                We sent a 6-digit verification code to{" "}
                <span className="font-medium text-slate-800">{email}</span>. Enter it
                below to activate your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Verification code
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        required
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-center text-2xl font-bold tracking-widest text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {resendMessage && (
                    <p className="text-sm text-green-600">{resendMessage}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="mt-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    {loading ? "Verifying…" : "Verify email"}
                </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500">
                <p>Didn&apos;t receive the code?</p>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-medium text-slate-900 underline hover:text-slate-700 disabled:opacity-50"
                >
                    {resending ? "Sending…" : "Resend verification code"}
                </button>
                <Link href="/register" className="text-slate-400 hover:underline">
                    Use a different email address
                </Link>
            </div>
        </div>
    );
}
