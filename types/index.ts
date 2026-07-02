export type UserRole = "user" | "admin";

export type ServiceType = "Accounting & Book Keeping" | "Business Plan & Project Report" | "Company Registration" | "Compliance Service" | "FDI Approval" | "Form Registration" | "NGO/INGO Service" | "PAN/VAT Registration" | "Preparation of Financial Statements" | "Tax Counseling" | "Tax Returns" | "Tax & Accouting Training"

export const SERVICE_TYPES: ServiceType[] = ["Accounting & Book Keeping", "Business Plan & Project Report", "Company Registration", "Compliance Service", "FDI Approval", "Form Registration", "NGO/INGO Service", "PAN/VAT Registration", "Preparation of Financial Statements", "Tax Counseling", "Tax Returns", "Tax & Accouting Training"]

export type ApplicationStatus = "pending" | "incomplete submission" | "completed";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
    "pending",
    "incomplete submission",
    "completed",
];

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface UploadedFile {
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt?: string | Date;
}

export interface PopulatedUserRef {
    _id: string;
    name: string;
    email: string;
}

export interface ApplicationDTO {
    _id: string;
    userId: string | PopulatedUserRef;
    fullName: string;
    phone: string;
    address: Address;
    serviceType: ServiceType;
    description: string;
    files: UploadedFile[];
    status: ApplicationStatus;
    adminRemark: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
