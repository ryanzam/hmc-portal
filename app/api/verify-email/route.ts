import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

interface VerifyBody {
    email?: string;
    code?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as VerifyBody;
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required." },
                { status: 400 }
            );
        }

        if (!/^\d{6}$/.test(code.trim())) {
            return NextResponse.json(
                { error: "Invalid verification code format." },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email address." },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json({ success: true, alreadyVerified: true });
        }

        if (!user.verificationCode || !user.verificationCodeExpiry) {
            return NextResponse.json(
                { error: "No verification code on file. Please request a new one." },
                { status: 400 }
            );
        }

        if (new Date() > user.verificationCodeExpiry) {
            return NextResponse.json(
                { error: "Verification code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        if (user.verificationCode !== code.trim()) {
            return NextResponse.json(
                { error: "Incorrect verification code. Please try again." },
                { status: 400 }
            );
        }

        user.emailVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiry = null;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Verify email error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
