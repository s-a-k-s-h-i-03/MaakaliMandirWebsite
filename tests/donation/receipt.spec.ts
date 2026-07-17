import { DonationPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Donation receipt", () => {
  test("opens the generated receipt after a successful donation flow", async ({ page, donationData }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();
    await donationPage.fillForm(donationData);
    await donationPage.submit();

    await expect(donationPage.successPanel).toBeVisible({ timeout: 20_000 });

    const [receiptPage] = await Promise.all([
      page.context().waitForEvent("page"),
      donationPage.receiptLink.click(),
    ]);

    await receiptPage.waitForLoadState("domcontentloaded");
    expect(receiptPage.url()).toContain("/api/donations/receipt/");
  });
});
