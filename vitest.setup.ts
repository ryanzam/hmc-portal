// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Move global framework intercepts here!
vi.mock("next-auth", () => ({
    default: () => ({
        auth: () => Promise.resolve({ user: { role: "user" } }),
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
