import { Suspense } from "react";
import LoginForm from "./LoginForm";
import Loader from "@/components/Loader";

export default function LoginPage() {
    return (
        <Suspense fallback={<Loader />}>
            <LoginForm />
        </Suspense>
    );
}