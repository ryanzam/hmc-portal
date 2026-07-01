import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()

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

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            role: "user",
        } as any);

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}