import { expect, test } from "../fixtures/testFixtures";
import { HomePage } from "../../pages";

test.describe("Homepage", () => {
  test("loads core homepage sections", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.brandLink).toBeVisible();
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.footer).toBeVisible();
    await expect(homePage.floatingDonationLink).toBeVisible();
    await expect(homePage.whatsappLink).toBeVisible();
  });

  test("shows the expected primary navigation links", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    await expect(homePage.navbar.getByRole("link", { name: "Events" })).toBeVisible();
    await expect(homePage.navbar.getByRole("link", { name: "Gallery" })).toBeVisible();
    await expect(homePage.navbar.getByRole("link", { name: "Contact" })).toBeVisible();
    await expect(homePage.navbar.getByRole("link", { name: "Donation" })).toBeVisible();
  });

  test("does not load broken images on first paint", async ({ page }) => {
    const homePage = new HomePage(page);
    const failedImageUrls = new Set<string>();

    page.on("response", (response) => {
      const request = response.request();
      const resourceType = request.resourceType();
      const url = response.url();

      if (
        resourceType === "image" &&
        url.startsWith("http://127.0.0.1") &&
        response.status() >= 400
      ) {
        failedImageUrls.add(url);
      }
    });

    await homePage.goto();
    await expect(homePage.heroSection).toBeVisible();

    const imageCount = await page.locator("img").count();
    expect(imageCount).toBeGreaterThan(0);
    expect([...failedImageUrls]).toEqual([]);
  });

  test("keeps the mobile navigation usable", async ({ page }) => {
    const homePage = new HomePage(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.goto();
    await homePage.openMobileMenu();

    await expect(homePage.navbar.getByRole("link", { name: "Events" })).toBeVisible();
    await expect(homePage.navbar.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("exposes working primary page links", async ({ page }) => {
    const homePage = new HomePage(page);
    const checkedLinks = [
      { name: "Events", expectedPath: "/events" },
      { name: "Gallery", expectedPath: "/gallery" },
      { name: "Contact", expectedPath: "/contact" },
      { name: "Donation", expectedPath: "/donation" },
    ];

    await homePage.goto();

    for (const link of checkedLinks) {
      await homePage.navbar.getByRole("link", { name: link.name }).click();
      await expect(page).toHaveURL(new RegExp(`${link.expectedPath}$`));
      await page.goBack();
      await expect(homePage.navbar).toBeVisible();
    }
  });
});
