import { DonationPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Donation flow", () => {
  test("loads donation heads from the live API", async ({ page }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();

    const headCount = await donationPage.headSelect.locator("option").count();
    const selectedValue = await donationPage.getSelectedHeadValue();
    const amountValue = await donationPage.amountInput.inputValue();

    expect(headCount).toBeGreaterThan(0);
    expect(selectedValue).toBeTruthy();
    expect(amountValue).toBeTruthy();
  });

  test("updates the amount when a different donation head is selected", async ({ page }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();

    const options = donationPage.headSelect.locator("option");
    const optionCount = await options.count();

    test.skip(optionCount < 2, "Need at least two donation heads to verify amount switching.");

    const firstValue = await options.nth(0).getAttribute("value");
    const secondValue = await options.nth(1).getAttribute("value");
    const firstText = await options.nth(0).textContent();
    const secondText = await options.nth(1).textContent();

    if (!firstValue || !secondValue || !firstText || !secondText) {
      throw new Error("Donation head options are incomplete.");
    }

    await donationPage.selectHeadByValue(firstValue);
    const firstAmount = await donationPage.amountInput.inputValue();

    await donationPage.selectHeadByValue(secondValue);
    const secondAmount = await donationPage.amountInput.inputValue();

    expect(firstAmount).toBeTruthy();
    expect(secondAmount).toBeTruthy();
    expect(firstText).not.toBe(secondText);
  });

  test("submits a valid donation through the mock payment flow", async ({ page, donationData }) => {
    const donationPage = new DonationPage(page);
    const seenPosts = new Set<string>();

    page.on("response", (response) => {
      if (response.request().method() !== "POST") {
        return;
      }

      const url = response.url();
      if (url.includes("/api/donations")) seenPosts.add("/api/donations");
      if (url.includes("/api/payments/create-order")) seenPosts.add("/api/payments/create-order");
      if (url.includes("/api/payments/verify")) seenPosts.add("/api/payments/verify");
    });

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();
    await donationPage.fillForm(donationData);
    await donationPage.submit();

    await expect(donationPage.successPanel).toBeVisible({ timeout: 20_000 });
    await expect(donationPage.receiptLink).toBeVisible();
    expect(seenPosts.has("/api/donations")).toBeTruthy();
    expect(seenPosts.has("/api/payments/create-order")).toBeTruthy();
    expect(seenPosts.has("/api/payments/verify")).toBeTruthy();
  });

  test("blocks invalid email before submission", async ({ page, donationData }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();
    await donationPage.fillForm({
      ...donationData,
      email: "invalid-email",
    });

    await donationPage.submit();

    expect(await donationPage.isFieldInvalid(donationPage.emailInput)).toBeTruthy();
  });

  test("shows validation when amount is below the selected minimum", async ({ page, donationData }) => {
    const donationPage = new DonationPage(page);

    await donationPage.goto();
    await donationPage.waitForHeadsLoaded();
    await donationPage.fillForm({
      ...donationData,
      amount: "1",
    });

    await donationPage.submit();

    expect(await donationPage.isFieldInvalid(donationPage.amountInput)).toBeTruthy();
  });
});
