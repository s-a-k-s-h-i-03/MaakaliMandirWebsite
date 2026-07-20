import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get nameInput(): Locator {
    return this.page.locator("#udf1");
  }

  get emailInput(): Locator {
    return this.page.locator("#udf2");
  }

  get phoneInput(): Locator {
    return this.page.locator("#udf3");
  }

  get addressInput(): Locator {
    return this.page.locator("#udf4");
  }

  get headSelect(): Locator {
    return this.page.locator("#headid");
  }

  get amountInput(): Locator {
    return this.page.locator("#amount");
  }

  get submitButton(): Locator {
    return this.page.locator("button[type='submit']");
  }

  get feedbackMessage(): Locator {
    return this.page.locator("form p").last();
  }

  async fillForm(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    amount: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressInput.fill(data.address);
    await this.amountInput.fill(data.amount);
  }

  async selectFirstKalashType() {
    await this.headSelect.waitFor({ state: "visible" });
    await this.page.waitForFunction(
      (selector) => {
        const select = document.querySelector(selector) as HTMLSelectElement | null;
        return Boolean(select && !select.disabled && select.options.length > 1);
      },
      "#headid",
    );

    const currentValue = await this.headSelect.inputValue();
    if (currentValue) {
      return currentValue;
    }

    const options = this.headSelect.locator("option");
    const count = await options.count();

    for (let index = 0; index < count; index += 1) {
      const value = await options.nth(index).evaluate((option) => (option as HTMLOptionElement).value);
      if (value) {
        await this.headSelect.selectOption(value);
        return value;
      }
    }

    throw new Error("No selectable kalash type found.");
  }

  async submit() {
    await this.submitButton.click();
  }

  async isFieldInvalid(field: Locator): Promise<boolean> {
    return field.evaluate((input) => !input.checkValidity());
  }

  async goto() {
    await this.page.goto("/contact", { waitUntil: "domcontentloaded" });
  }
}
