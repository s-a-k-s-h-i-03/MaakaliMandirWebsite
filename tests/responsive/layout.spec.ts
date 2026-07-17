import { ContactPage, DonationPage, HomePage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Responsive layout", () => {
  test("desktop homepage keeps the primary navigation and hero usable", async ({ page }) => {
    const homePage = new HomePage(page);

    await page.setViewportSize({ width: 1440, height: 960 });
    await homePage.goto();

    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.brandLink).toBeVisible();
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.navbar.getByRole("link", { name: "Donation" })).toBeVisible();
  });

  test("tablet contact page keeps the kalash form usable", async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.setViewportSize({ width: 834, height: 1112 });
    await contactPage.goto();
    await contactPage.selectFirstKalashType();

    await expect(contactPage.nameInput).toBeVisible();
    await expect(contactPage.headSelect).toBeVisible();
    await expect(contactPage.amountInput).toBeVisible();
    await expect(contactPage.submitButton).toBeVisible();
  });

  test("mobile navigation opens and donation form remains usable", async ({ page }) => {
    const homePage = new HomePage(page);
    const donationPage = new DonationPage(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.goto();
    await homePage.openMobileMenu();

    await expect(homePage.navbar.getByRole("link", { name: "Donation" })).toBeVisible();

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();

    await expect(donationPage.donorNameInput).toBeVisible();
    await expect(donationPage.headSelect).toBeVisible();
    await expect(donationPage.amountInput).toBeVisible();
    await expect(donationPage.submitButton).toBeVisible();
  });
});
