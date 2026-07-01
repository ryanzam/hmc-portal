"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
}


const RegisterPage = () => {
    const router = useRouter();
    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed.");
                setLoading(false);
                return;
            }

            const signInRes = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            setLoading(false);

            if (signInRes?.error) {
                router.push("/login");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setLoading(false);
            setError("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="mx-auto flex max-w-md flex-col px-4 py-16">
            <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
            <p className="mt-1 text-sm text-slate-500">
                Register to submit and track your service applications.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

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
                        minLength={8}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                    <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-slate-900 underline">
                    Log in
                </Link>
            </p>
        </div>
    )
}

export default RegisterPage