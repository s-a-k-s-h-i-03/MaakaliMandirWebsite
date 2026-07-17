import { ServicePage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Services", () => {
  test("loads the services page and exposes at least one service card", async ({ page }) => {
    const servicePage = new ServicePage(page);

    await servicePage.goto();
    await expect(page.getByRole("heading", { name: /services/i })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("opens a service detail page from the listing", async ({ page }) => {
    const servicePage = new ServicePage(page);

    await servicePage.goto();

    const firstServiceLink = page.locator("a[href^='/services/']").first();
    await expect(firstServiceLink).toBeVisible();

    const href = await firstServiceLink.getAttribute("href");
    await firstServiceLink.click();

    await expect(page).toHaveURL(new RegExp(`${href?.replace("/", "\\/")}$`));
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
