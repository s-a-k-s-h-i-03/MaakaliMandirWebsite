import { ContactPage, DonationPage, GalleryPage, HomePage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Accessibility", () => {
  test("homepage navigation stays keyboard reachable", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.keyboard.press("Tab");
    await expect(homePage.brandLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(homePage.donationNavLink).not.toBeFocused();

    for (let index = 0; index < 6; index += 1) {
      await page.keyboard.press("Tab");
      if (await homePage.donationNavLink.evaluate((node) => node === document.activeElement)) {
        break;
      }
    }

    await expect(homePage.donationNavLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/donation$/);
  });

  test("contact form exposes accessible labels and required controls", async ({ page }) => {
    const contactPage = new ContactPage(page);

    await contactPage.goto();

    await expect(page.getByLabel("Name:")).toBeVisible();
    await expect(page.getByLabel("Email:")).toBeVisible();
    await expect(page.getByLabel("Phone:")).toBeVisible();
    await expect(page.getByLabel("Address:")).toBeVisible();
    await expect(page.getByLabel("Tail/Ghrit/Jaware Kalash:")).toBeVisible();
    await expect(page.getByLabel("Amount:")).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(contactPage.nameInput).toBeFocused();
  });

  test("donation form preserves labels and keyboard submission path", async ({ page, donationData }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();

    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Phone")).toBeVisible();
    await expect(page.getByLabel("Address")).toBeVisible();
    await expect(page.getByLabel("Donation Head")).toBeVisible();
    await expect(page.getByLabel("Amount")).toBeVisible();
    await expect(page.getByLabel("Payment Method")).toBeVisible();

    await donationPage.fillForm(donationData);
    await page.keyboard.press("Tab");
    await expect(donationPage.submitButton).toBeFocused();
  });

  test("gallery images expose alt text and lightbox controls are keyboard reachable", async ({ page }) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await expect(galleryPage.heading).toBeVisible();
    await expect(page.locator("img[alt]").first()).toBeVisible();

    await galleryPage.featuredOpenButton.focus();
    await page.keyboard.press("Enter");

    await expect(galleryPage.closeButton).toBeVisible();
    await expect(galleryPage.previousImageButton).toBeVisible();
    await expect(galleryPage.nextImageButton).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(galleryPage.closeButton).toBeFocused();
  });
});
