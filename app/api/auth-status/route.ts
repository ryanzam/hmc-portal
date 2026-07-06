import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ needsVerification: false });
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select("emailVerified")
            .lean<{ emailVerified: boolean }>();

        if (!user) {
            return NextResponse.json({ needsVerification: false });
        }

        return NextResponse.json({ needsVerification: !user.emailVerified });
    } catch (err) {
        console.error("Auth status error:", err);
        return NextResponse.json({ needsVerification: false });
    }
}
