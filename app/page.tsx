import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        HMC Portal
      </h1>
      <p className="mt-4 max-w-xl text-slate-600">
        Submit your service application online, upload the required documents,
        and track its approval status in one simple dashboard.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
