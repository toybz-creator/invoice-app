import { expect, test } from "@playwright/test";

test.describe("public and protected route shells", () => {
  test("renders the public home page and links to auth", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Manage invoices, VAT, and payment status from one secure dashboard.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  test("renders auth routes and protects dashboard routes", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create new account" }),
    ).toBeVisible();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

    await page.goto("/invoices");
    await expect(page).toHaveURL(/\/login\?next=%2Finvoices/);
  });
});
