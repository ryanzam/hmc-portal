import { test, expect } from "@playwright/test";

test("Should navigate to login and register via links", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.getByRole("link", { name: "Log in" }).click();

    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.goto("http://localhost:3000/");

    await page.getByRole("link", { name: "Create an account" }).click();

    await expect(page).toHaveURL("http://localhost:3000/register");
});
