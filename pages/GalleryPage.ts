import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class GalleryPage extends BasePage {
  readonly heading;
  readonly featuredOpenButton;
  readonly closeButton;
  readonly previousImageButton;
  readonly nextImageButton;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Gallery" });
    this.featuredOpenButton = page.locator("button", { has: page.locator("img[alt]") }).first();
    this.closeButton = page.getByRole("button", { name: "Close" });
    this.previousImageButton = page.getByRole("button", { name: "Previous image" });
    this.nextImageButton = page.getByRole("button", { name: "Next image" });
  }

  async goto() {
    await this.page.goto("/gallery");
  }
}
