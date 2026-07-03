import connectDB from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

interface RegisterBody {
    name?: string;
    email?: string;
    password?: string;
}

function generateVerificationCode(): string {
    const array = new Uint32Array(1);
    const { randomInt } = require("crypto") as typeof import("crypto");
    return randomInt(100000, 1000000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json() as RegisterBody;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: "user",
            emailVerified: false,
            verificationCode,
            verificationCodeExpiry,
        });

        try {
            await sendVerificationEmail(normalizedEmail, name.trim(), verificationCode);
        } catch (emailErr) {
            console.error("[Email] Failed to send verification email:", emailErr);
            console.log(
                `[Dev] Verification code for ${normalizedEmail}: ${verificationCode}`
            );

            if (process.env.NODE_ENV === "production") {
                await User.deleteOne({ _id: newUser._id });
                return NextResponse.json(
                    {
                        error: "Failed to send verification email. Please check your email address and try again.",
                    },
                    { status: 500 }
                );
            }
        }
        return NextResponse.json({ success: true }, { status: 201 });

    } catch (err) {
        console.error("Registration error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}