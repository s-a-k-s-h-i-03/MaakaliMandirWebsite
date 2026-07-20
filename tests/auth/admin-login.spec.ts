import { DashboardPage, LoginPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Admin login", () => {
  test("logs in with valid credentials", async ({ page, adminCredentials }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await loginPage.login(adminCredentials.username, adminCredentials.password);

    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.adminBadge).toBeVisible();
  });

  test("shows an error for invalid login", async ({ page, adminCredentials }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(adminCredentials.username, `${adminCredentials.password}-wrong`);

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(loginPage.errorToast).toBeVisible();
  });

  test("logs out and returns to the login page", async ({ page, adminCredentials }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(adminCredentials.username, adminCredentials.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await dashboardPage.logout();

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(loginPage.heading).toBeVisible();
  });

  test("keeps the session after a refresh", async ({ page, adminCredentials }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(adminCredentials.username, adminCredentials.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.reload();

    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(dashboardPage.heading).toBeVisible();
  });

  test("redirects unauthenticated visitors away from protected routes", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(loginPage.heading).toBeVisible();
  });
});
