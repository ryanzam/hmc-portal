import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import Application from "@/models/Application";
import mongoose from "mongoose";
import { Address, APPLICATION_STATUSES, SERVICE_TYPES, type ApplicationStatus, type PopulatedUserRef, UploadedFile, ServiceType } from "@/types";
import connectDB from "@/lib/db";

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface UpdateStatusBody {
    status?: ApplicationStatus;
    adminRemark?: string;
}

interface EditApplicationBody {
    fullName?: string;
    phone?: string;
    address?: Partial<Address>;
    serviceType?: ServiceType;
    description?: string;
    files?: UploadedFile[];
}


export async function GET(_req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
    }

    await connectDB();

    const application = await Application.findById(id)
        .populate<{ userId: PopulatedUserRef }>("userId", "name email")
        .lean();

    if (!application) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const isOwner = application.userId?._id?.toString() === (session.user as any).id;
    if ((session.user as any).role !== "admin" && !isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ application });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
    }

    const body = (await req.json()) as UpdateStatusBody;
    const { status, adminRemark } = body;

    if (!status || !APPLICATION_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    await connectDB();
    const application = await Application.findByIdAndUpdate(
        id,
        { status, adminRemark: adminRemark || "" },
        { new: true }
    ).populate("userId", "name email");

    if (!application) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ application });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid application id." }, { status: 400 });
    }

    await connectDB();
    const existing = await Application.findById(id);
    if (!existing) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const isOwner = existing.userId.toString() === session.user.id;
    if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status === "completed") {
        return NextResponse.json(
            { error: "Completed applications can no longer be edited." },
            { status: 409 }
        );
    }

    const body = (await req.json()) as EditApplicationBody;
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
        return NextResponse.json({ error: "Invalid service type." }, { status: 400 });
    }

    existing.fullName = fullName;
    existing.phone = phone;
    existing.address = address as Address;
    existing.serviceType = serviceType;
    existing.description = description || "";
    existing.files = Array.isArray(files) ? files : existing.files;
    existing.status = "pending";
    existing.adminRemark = "";

    await existing.save();
    await existing.populate("userId", "name email");

    return NextResponse.json({ application: existing });
}
