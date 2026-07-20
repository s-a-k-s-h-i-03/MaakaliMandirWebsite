import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DonationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get donorNameInput(): Locator {
    return this.page.locator("#donor_name");
  }

  get emailInput(): Locator {
    return this.page.locator("#email");
  }

  get phoneInput(): Locator {
    return this.page.locator("#phone");
  }

  get addressInput(): Locator {
    return this.page.locator("#address");
  }

  get headSelect(): Locator {
    return this.page.locator("#head_id");
  }

  get amountInput(): Locator {
    return this.page.locator("#amount");
  }

  get messageInput(): Locator {
    return this.page.locator("#message");
  }

  get paymentMethodSelect(): Locator {
    return this.page.locator("#payment_method");
  }

  get submitButton(): Locator {
    return this.page.locator("button[type='submit']");
  }

  get successPanel(): Locator {
    return this.page.locator("text=Donation successful. Receipt No:");
  }

  get receiptLink(): Locator {
    return this.page.getByRole("link", { name: "Open receipt" });
  }

  async waitForHeadsLoaded() {
    await this.page.waitForFunction(
      (selector) => {
        const select = document.querySelector(selector) as HTMLSelectElement | null;
        return Boolean(select && select.options.length > 0 && select.value);
      },
      "#head_id",
    );
  }

  async fillForm(data: {
    donorName: string;
    email: string;
    phone: string;
    address: string;
    amount: string;
    message: string;
    paymentMethod: string;
  }) {
    await this.donorNameInput.fill(data.donorName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressInput.fill(data.address);
    await this.amountInput.fill(data.amount);
    await this.messageInput.fill(data.message);
    await this.paymentMethodSelect.selectOption(data.paymentMethod);
  }

  async getSelectedHeadValue() {
    return this.headSelect.inputValue();
  }

  async getSelectedHeadText() {
    return this.headSelect.locator("option:checked").textContent();
  }

  async selectHeadByValue(value: string) {
    await this.headSelect.selectOption(value);
  }

  async submit() {
    await this.submitButton.click();
  }

  async isFieldInvalid(field: Locator): Promise<boolean> {
    return field.evaluate((input) => !input.checkValidity());
  }

  async goto() {
    await this.page.goto("/donation", { waitUntil: "domcontentloaded" });
  }
}
