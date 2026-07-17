import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class EventPage extends BasePage {
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Events" });
  }

  async goto() {
    await this.page.goto("/events");
  }

  card(title: string) {
    return this.page.locator("article").filter({
      has: this.page.getByRole("heading", { name: title, exact: true }),
    }).first();
  }
}
