"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError("Invalid email or password.");
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="mx-auto flex max-w-md flex-col px-4 py-16">
            <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
            <p className="mt-1 text-sm text-slate-500">
                Access your portal.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Log in"}
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
