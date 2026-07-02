import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Only PDF, DOC, and DOCX files are allowed." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File must be smaller than 5MB." },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name);
        const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, safeName);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        return NextResponse.json({
            fileName: file.name,
            fileUrl: `/uploads/${safeName}`,
            fileType: file.type,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "File upload failed. Please try again." },
            { status: 500 }
        );
    }
}
