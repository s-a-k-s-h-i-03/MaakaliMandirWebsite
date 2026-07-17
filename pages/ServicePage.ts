import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ServicePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/services");
  }
}

