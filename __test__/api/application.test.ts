import { expect, test, describe, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/applications/route";
import Application from "@/models/Application";
import { NextRequest } from 'next/server';

// Mock the internal Mongoose model structure
vi.mock("@/models/Application", () => {
    return {
        default: {
            create: vi.fn(),
        },
    };
});

vi.mock("@/lib/db", () => ({
    default: vi.fn(() => Promise.resolve()), // Mock database connection success
}));

describe("POST /api/applications API Endpoint", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("Successfully creates a new service application submission", async () => {
        const mockPayload = {
            fullName: "John Doe",
            phone: "+358401234567",
            address: {
                street: "Mannerheimintie 1",
                city: "Helsinki",
                zip: "00100",
            },
            serviceType: "Consulting",
            description: "Requesting management setup evaluation.",
            files: [
                {
                    fileName: "docs.pdf",
                    fileUrl: "/uploads/docs.pdf",
                    fileType: "pdf",
                },
            ],
        };

        // Spy/Mock the Mongoose database insertion resolution
        vi.mocked(Application.create).mockResolvedValue({
            _id: "mock-database-id-12345",
            ...mockPayload,
            status: "Pending",
            createdAt: new Date(),
        } as any);

        // Mock incoming Request web API structure
        const request = new NextRequest("http://localhost:3000/api/applications", {
            method: "POST",
            body: JSON.stringify(mockPayload),
        });

        const response = await POST(request);
        const jsonBody = await response.json();

        expect(response.status).toBe(200);
        expect(jsonBody.application).toBeDefined();
        expect(jsonBody.application.status).toBe("Pending");
        expect(Application.create).toHaveBeenCalledTimes(1);
    });

    test("Returns 400 Bad Request error when critical payload fields are missing", async () => {
        const incompletePayload = {
            fullName: "John Doe",
            // Missing phone, address, and serviceType data constraints
        };

        const request = new NextRequest("http://localhost:3000/api/applications", {
            method: "POST",
            body: JSON.stringify(incompletePayload),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
