import { expect, test } from "@playwright/test";

test.describe("public and protected route shells", () => {
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

    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Reset password" }),
    ).toBeVisible();

    await page.goto("/reset-password?userId=test-user&secret=test-secret");
    await expect(
      page.getByRole("heading", { name: "Create new password" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update password" }),
    ).toBeDisabled();

    await page.goto("/reset-password");
    await expect(
      page.getByRole("link", { name: "Request new link" }),
    ).toHaveAttribute("href", "/forgot-password");

    await page.goto("/");
    await expect(page).toHaveURL(/\/login\?next=%2F/);

    await page.goto("/invoices");
    await expect(page).toHaveURL(/\/login\?next=%2Finvoices/);
  });
});
