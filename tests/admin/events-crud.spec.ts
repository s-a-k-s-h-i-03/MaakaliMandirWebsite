import { AdminEventsPage, EventPage, LoginPage } from "../../pages";
import { expect, test } from "../fixtures/testFixtures";

test.describe("Admin events CRUD", () => {
  test("creates, updates, and deletes an event that appears on the public website", async ({
    page,
    adminCredentials,
    eventData,
  }) => {
    const loginPage = new LoginPage(page);
    const adminEventsPage = new AdminEventsPage(page);
    const publicEventsPage = new EventPage(page);
    const updatedTitle = `Updated ${Date.now()}`;
    const updatedDescription = `${eventData.description} Updated for public verification.`;
    const updatedLocation = `${eventData.location} Annex`;

    await loginPage.goto();
    await loginPage.login(adminCredentials.username, adminCredentials.password);

    await adminEventsPage.goto();
    await expect(adminEventsPage.heading).toBeVisible();

    await adminEventsPage.openCreateForm();
    await adminEventsPage.fillForm(eventData);

    const createResponsePromise = page.waitForResponse((response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/admin/events") &&
      response.status() === 201,
    );

    await adminEventsPage.createButton.click();
    await createResponsePromise;
    await expect(adminEventsPage.toast("Event created")).toBeVisible();

    await adminEventsPage.search(eventData.title);
    await expect(adminEventsPage.row(eventData.title)).toBeVisible();

    await publicEventsPage.goto();
    await expect(publicEventsPage.heading).toBeVisible();
    await expect(publicEventsPage.card(eventData.title)).toBeVisible();

    await adminEventsPage.goto();
    await adminEventsPage.search(eventData.title);
    await adminEventsPage.openEditForm(eventData.title);
    await adminEventsPage.fillForm({
      ...eventData,
      title: updatedTitle,
      description: updatedDescription,
      location: updatedLocation,
      imagePath: undefined,
    });

    const updateResponsePromise = page.waitForResponse((response) =>
      response.request().method() === "PUT" &&
      response.url().includes("/api/admin/events/") &&
      response.status() === 200,
    );

    await adminEventsPage.updateButton.click();
    await updateResponsePromise;
    await expect(adminEventsPage.toast("Event updated")).toBeVisible();

    await adminEventsPage.search(updatedTitle);
    await expect(adminEventsPage.row(updatedTitle)).toBeVisible();

    await publicEventsPage.goto();
    await expect(publicEventsPage.card(updatedTitle)).toBeVisible();
    await expect(publicEventsPage.card(eventData.title)).toHaveCount(0);

    await adminEventsPage.goto();
    await adminEventsPage.search(updatedTitle);
    await adminEventsPage.requestDelete(updatedTitle);

    const deleteResponsePromise = page.waitForResponse((response) =>
      response.request().method() === "DELETE" &&
      response.url().includes("/api/admin/events/") &&
      response.status() === 200,
    );

    await adminEventsPage.confirmDeleteButton.click();
    await deleteResponsePromise;
    await expect(adminEventsPage.toast("Event deleted")).toBeVisible();
    await expect(adminEventsPage.row(updatedTitle)).toHaveCount(0);

    await publicEventsPage.goto();
    await expect(publicEventsPage.card(updatedTitle)).toHaveCount(0);
  });
});
