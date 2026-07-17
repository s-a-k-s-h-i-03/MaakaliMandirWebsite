import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly heading;
  readonly logoutButton;
  readonly adminBadge;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /administration/i }).first();
    this.logoutButton = page.getByRole("button", { name: "Logout" });
    this.adminBadge = page.getByText("Temple Manager");
  }

  async goto() {
    await this.page.goto("/admin/dashboard");
  }

  async logout() {
    await this.logoutButton.click();
  }
}
