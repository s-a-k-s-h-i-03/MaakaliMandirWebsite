import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

type EventFormInput = {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: "Active" | "Inactive";
  imagePath?: string;
};

export class AdminEventsPage extends BasePage {
  readonly heading;
  readonly addEventButton;
  readonly titleInput;
  readonly dateInput;
  readonly locationInput;
  readonly statusSelect;
  readonly descriptionInput;
  readonly imageInput;
  readonly searchInput;
  readonly createButton;
  readonly updateButton;
  readonly deleteEventButton;
  readonly confirmDeleteButton;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /event management/i });
    this.addEventButton = page.getByRole("button", { name: "Add Event" });
    this.titleInput = page.getByLabel("Title");
    this.dateInput = page.getByLabel("Date");
    this.locationInput = page.getByLabel("Location");
    this.statusSelect = page.getByLabel("Status");
    this.descriptionInput = page.getByLabel("Description");
    this.imageInput = page.locator('input[type="file"]');
    this.searchInput = page.getByLabel("Search events...");
    this.createButton = page.getByRole("button", { name: "Create Event" });
    this.updateButton = page.getByRole("button", { name: "Update Event" });
    this.deleteEventButton = page.getByRole("button", { name: "Delete Event" });
    this.confirmDeleteButton = page.getByRole("button", { name: /^Delete Event$/ });
  }

  async goto() {
    await this.page.goto("/admin/events");
  }

  row(title: string) {
    return this.page.locator("tbody tr", { hasText: title }).first();
  }

  toast(title: string) {
    return this.page.getByRole("status").filter({ hasText: title }).first();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async openCreateForm() {
    await this.addEventButton.click();
  }

  async openEditForm(title: string) {
    const row = this.row(title);
    await row.getByRole("button", { name: "Edit" }).click();
  }

  async requestDelete(title: string) {
    const row = this.row(title);
    await row.getByRole("button", { name: "Delete" }).click();
  }

  async fillForm(input: EventFormInput) {
    await this.titleInput.fill(input.title);
    await this.dateInput.fill(input.eventDate);
    await this.locationInput.fill(input.location);
    await this.statusSelect.selectOption(input.status);
    await this.descriptionInput.fill(input.description);

    if (input.imagePath) {
      await this.imageInput.setInputFiles(input.imagePath);
    }
  }
}
