import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";
import StatusBadge from "@/components/StatusBadge";

describe("<StatusBadge /> UI Component Architecture", () => {
    test('Correctly renders styling attributes for dynamic "Pending" state mappings', () => {
        render(<StatusBadge status={"pending"} />);

        const badgeElement = screen.getByText(/Pending/i);
        expect(badgeElement).toBeInTheDocument();

        // Validate style classes applied via Tailwind
        expect(badgeElement.className).toContain("bg-amber-100");
    });

    test('Correctly renders styling attributes for dynamic "Completed" state mappings', () => {
        render(<StatusBadge status={"completed"} />);

        const badgeElement = screen.getByText(/Completed/i);
        expect(badgeElement).toBeInTheDocument();
        expect(badgeElement.className).toContain("bg-green-100");
    });

    test('Correctly renders styling attributes for "Incomplete Submission" administrative alerts', () => {
        render(<StatusBadge status={"incomplete submission"} />);

        const badgeElement = screen.getByText(/Incomplete Submission/i);
        expect(badgeElement).toBeInTheDocument();
        expect(badgeElement.className).toContain("bg-red-100");
    });
});
