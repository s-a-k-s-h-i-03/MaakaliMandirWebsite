import { ContactPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Contact form / Kalash registration", () => {
  test("loads kalash types from the live API", async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    await expect(contactPage.headSelect).toBeEnabled();
    const selectedHeadId = await contactPage.selectFirstKalashType();
    const optionCount = await contactPage.headSelect.locator("option").count();

    expect(selectedHeadId).toBeTruthy();
    expect(optionCount).toBeGreaterThan(1);
  });

  test("submits a valid kalash registration and receives a success response", async ({ page, enquiryData }) => {
    const contactPage = new ContactPage(page);

    await contactPage.goto();
    await contactPage.selectFirstKalashType();
    await contactPage.fillForm(enquiryData);

    const submitResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/enquiry") && response.request().method() === "POST",
    );

    await contactPage.submit();

    const response = await submitResponsePromise;
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.success).toBeTruthy();
    expect(body.orderid).toBeTruthy();
    expect(String(body.amount)).toContain(enquiryData.amount);
    await expect(contactPage.feedbackMessage).toContainText(String(body.orderid));
  });

  test("blocks submitting an empty form with browser validation", async ({ page }) => {
    const contactPage = new ContactPage(page);

    await contactPage.goto();
    await contactPage.submit();

    await expect(contactPage.nameInput).toBeFocused();
    expect(await contactPage.isFieldInvalid(contactPage.nameInput)).toBeTruthy();
  });

  test("rejects an invalid email format before submission", async ({ page, enquiryData }) => {
    const contactPage = new ContactPage(page);

    await contactPage.goto();
    await contactPage.selectFirstKalashType();
    await contactPage.fillForm({
      ...enquiryData,
      email: "invalid-email",
    });

    await contactPage.submit();

    await expect(contactPage.emailInput).toBeFocused();
    expect(await contactPage.isFieldInvalid(contactPage.emailInput)).toBeTruthy();
  });

  test("rejects an invalid phone length before submission", async ({ page, enquiryData }) => {
    const contactPage = new ContactPage(page);

    await contactPage.goto();
    await contactPage.selectFirstKalashType();
    await contactPage.fillForm({
      ...enquiryData,
      phone: "12345",
    });

    await contactPage.submit();

    await expect(contactPage.phoneInput).toBeFocused();
    expect(await contactPage.isFieldInvalid(contactPage.phoneInput)).toBeTruthy();
  });

  test("sends the expected enquiry payload to the API", async ({ page, enquiryData }) => {
    const contactPage = new ContactPage(page);
    let submittedPayload: Record<string, unknown> | null = null;

    page.on("request", (request) => {
      if (request.url().includes("/api/enquiry") && request.method() === "POST") {
        submittedPayload = request.postDataJSON() as Record<string, unknown>;
      }
    });

    await contactPage.goto();
    const selectedHeadId = await contactPage.selectFirstKalashType();
    await contactPage.fillForm(enquiryData);

    const submitResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/enquiry") && response.request().method() === "POST",
    );

    await contactPage.submit();
    const response = await submitResponsePromise;

    expect(response.status()).toBe(201);
    expect(submittedPayload).not.toBeNull();
    expect(submittedPayload).toMatchObject({
      udf1: enquiryData.name,
      udf2: enquiryData.email,
      udf3: enquiryData.phone,
      udf4: enquiryData.address,
      headid: selectedHeadId,
      amount: enquiryData.amount,
    });
  });
});
