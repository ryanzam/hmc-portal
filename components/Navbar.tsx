"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Loader from "./Loader";

export default function Navbar() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <Loader />
    }

    if (status === "unauthenticated") {
        return
    }

    const homeHref = (session?.user as any).role === "admin" ? "/admin" : "/dashboard";

    return (
        <nav className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href={homeHref} className="text-lg font-semibold text-slate-800">
                    HMC. <span className="text-[#d0a43a]">Portal</span>
                </Link>

                <div className="flex items-center gap-4">
                    {session?.user && (
                        <>
                            <span className="hidden text-sm text-slate-500 sm:inline">
                                {session.user.name?.toUpperCase()}{" "}
                                {(session.user as any).role === "admin" && (
                                    <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-white">
                                        Admin
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Log out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
