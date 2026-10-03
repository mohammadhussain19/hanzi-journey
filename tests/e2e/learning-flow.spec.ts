import { expect, test } from "@playwright/test";

test("landing page introduces the HSK learning path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Learn Chinese, one lesson at a time/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start learning/i }).first()).toHaveAttribute("href", "/register");
  await page.getByRole("link", { name: /Explore lessons/i }).first().click();
  await expect(page.getByRole("heading", { name: /HSK 1 · Beginner path/i })).toBeVisible();
  await expect(page.getByText("120 starter words")).toBeVisible();
});

test("register, complete a lesson, and see saved progress", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL || !process.env.AUTH_SECRET, "Set DATABASE_URL and AUTH_SECRET to run database-backed end-to-end tests.");
  const email = `learner-${Date.now()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("What should we call you?").fill("Test Learner");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Create a password").fill("learning-password-123");
  await page.getByRole("button", { name: /Create account/i }).click();
  await expect(page).toHaveURL(/onboarding/);
  await page.getByRole("button", { name: /Start with HSK 1/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("link", { name: /Continue learning/i }).click();
  await page.getByRole("link", { name: /Start practice/i }).click();
  for (let i = 0; i < 8; i += 1) {
    await page.locator("fieldset button").first().click();
    await page.getByRole("button", { name: /Check and continue|Finish lesson/i }).click();
  }
  await expect(page.getByRole("heading", { name: /A perfect round|You made progress/i })).toBeVisible();
  await page.getByRole("link", { name: /Today’s dashboard/i }).click();
  await expect(page.getByText("1/15", { exact: true })).toBeVisible();
});
