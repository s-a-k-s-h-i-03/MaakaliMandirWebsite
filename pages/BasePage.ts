import type { Locator, Page } from "@playwright/test";

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getByRoleButton(name: string | RegExp): Locator {
    return this.page.getByRole("button", { name });
  }
}

