import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get navbar(): Locator {
    return this.page.locator("nav").first();
  }

  get heroSection(): Locator {
    return this.page.locator("#home");
  }

  get footer(): Locator {
    return this.page.locator("footer");
  }

  get brandLink(): Locator {
    return this.navbar.locator("a[href='/']").first();
  }

  get mobileMenuButton(): Locator {
    return this.navbar.getByRole("button");
  }

  get floatingDonationLink(): Locator {
    return this.page.locator("a[href='/donation']").last();
  }

  get whatsappLink(): Locator {
    return this.page.locator("a[aria-label='WhatsApp']");
  }

  get navLinks(): Locator {
    return this.navbar.locator("a");
  }

  get donationNavLink(): Locator {
    return this.navbar.getByRole("link", { name: "Donation" });
  }

  get contactNavLink(): Locator {
    return this.navbar.getByRole("link", { name: "Contact" });
  }

  async openMobileMenu() {
    if (await this.mobileMenuButton.isVisible()) {
      await this.mobileMenuButton.click();
    }
  }

  async goto() {
    await this.page.goto("/");
  }
}
