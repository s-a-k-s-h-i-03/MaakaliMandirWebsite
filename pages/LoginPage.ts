import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly heading;
  readonly usernameInput;
  readonly passwordInput;
  readonly submitButton;
  readonly errorToast;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Admin Login" });
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /login|signing in/i });
    this.errorToast = page.getByText("Login failed");
  }

  async goto() {
    await this.page.goto("/admin/login");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
