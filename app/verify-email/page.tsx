import { Suspense } from "react";
import Loader from "@/components/Loader";
import VerifyEmailForm from "./VerifyEmailForm";

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={<Loader />}
        >
            <VerifyEmailForm />
        </Suspense>
    );
}
