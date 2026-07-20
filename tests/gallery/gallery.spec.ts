import { GalleryPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Gallery", () => {
  test("loads the gallery page and opens the lightbox", async ({ page }) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await expect(galleryPage.heading).toBeVisible();
    await expect(page.locator("img[alt]").first()).toBeVisible();

    await galleryPage.featuredOpenButton.click();
    await expect(galleryPage.closeButton).toBeVisible();
    await expect(galleryPage.previousImageButton).toBeVisible();
    await expect(galleryPage.nextImageButton).toBeVisible();
  });
});
