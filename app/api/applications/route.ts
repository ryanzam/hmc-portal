import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import Application from "@/models/Application";
import {
    SERVICE_TYPES,
    APPLICATION_STATUSES,
    type Address,
    type UploadedFile,
    type ServiceType,
    type ApplicationStatus,
} from "@/types";
import connectDB from "@/lib/db";

interface CreateApplicationBody {
    fullName?: string;
    phone?: string;
    address?: Partial<Address>;
    serviceType?: ServiceType;
    description?: string;
    files?: UploadedFile[];
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ApplicationStatus | null;

    const query: { userId?: string; status?: ApplicationStatus } = {};
    if ((session.user as any).role !== "admin") {
        query.userId = session.user.id;
    }
    if (status && APPLICATION_STATUSES.includes(status)) {
        query.status = status;
    }

    const applications = await Application.find(query)
        .sort({ createdAt: -1 })
        .populate("userId", "name email")
        .lean();

    return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as CreateApplicationBody;
        const { fullName, phone, address, serviceType, description, files } = body;

        if (
            !fullName ||
            !phone ||
            !address?.street ||
            !address?.city ||
            !address?.state ||
            !address?.zip ||
            !serviceType
        ) {
            return NextResponse.json(
                { error: "Please fill in all required fields." },
                { status: 400 }
            );
        }

        if (!SERVICE_TYPES.includes(serviceType)) {
            return NextResponse.json(
                { error: "Invalid service type." },
                { status: 400 }
            );
        }

        await connectDB();

        const application = await Application.create({
            userId: session.user.id,
            fullName,
            phone,
            address: address as Address,
            serviceType,
            description: description || "",
            files: Array.isArray(files) ? files : [],
            status: "pending",
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (err) {
        console.error("Create application error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
