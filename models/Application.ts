import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import {
    SERVICE_TYPES,
    APPLICATION_STATUSES,
    type Address,
    type UploadedFile,
    type ApplicationStatus,
    type ServiceType,
} from "@/types";

export interface IApplication extends Document {
    userId: Types.ObjectId;
    fullName: string;
    phone: string;
    address: Address;
    serviceType: ServiceType;
    description: string;
    files: UploadedFile[];
    status: ApplicationStatus;
    adminRemark: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema<UploadedFile>(
    {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
        },
        serviceType: {
            type: String,
            enum: SERVICE_TYPES,
            required: true,
        },
        description: { type: String, default: "" },
        files: { type: [FileSchema], default: [] },
        status: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "pending",
        },
        adminRemark: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Application: Model<IApplication> =
    (mongoose.models.Application as Model<IApplication>) ||
    mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
