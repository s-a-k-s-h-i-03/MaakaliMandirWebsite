import { expect, request, test } from "@playwright/test";
import { buildEventInput, getAdminCredentials } from "../data";
import { backendBaseUrl } from "../helpers/urls";

async function loginAndGetToken() {
  const credentials = getAdminCredentials();
  const api = await request.newContext({ baseURL: backendBaseUrl });

  const response = await api.post("/api/admin/login", {
    data: credentials,
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  await api.dispose();

  return body.token as string;
}

test.describe("Backend API", () => {
  test("returns donation heads with the expected shape", async ({ request }) => {
    const response = await request.get(`${backendBaseUrl}/api/donation-heads`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
    });
    expect(Number(body.data[0].minimum_amount)).toBeGreaterThan(0);
  });

  test("rejects invalid public donation payloads", async ({ request }) => {
    const response = await request.post(`${backendBaseUrl}/api/donations`, {
      data: {
        donor_name: "",
        email: "invalid-email",
        phone: "123",
        address: "",
        head_id: 999999,
        amount: 0,
        payment_method: "",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();

    expect(body.success).toBeFalsy();
    expect(Array.isArray(body.errors)).toBeTruthy();
    expect(body.errors).toContain("A valid email address is required.");
  });

  test("rejects unauthorized admin event access", async ({ request }) => {
    const response = await request.get(`${backendBaseUrl}/api/admin/events`);

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "No token",
      errors: [],
    });
  });

  test("authenticates the seeded admin user", async () => {
    const token = await loginAndGetToken();
    expect(token).toBeTruthy();
  });

  test("creates, updates, and deletes an event through the admin API", async ({ request }) => {
    const token = await loginAndGetToken();
    const eventData = buildEventInput();
    const updatedTitle = `API Updated ${Date.now()}`;
    const createResponse = await request.post(`${backendBaseUrl}/api/admin/events`, {
      headers: {
        Authorization: token,
      },
      data: {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.eventDate,
        location: eventData.location,
        status: eventData.status,
      },
    });

    expect(createResponse.status()).toBe(201);
    const createdBody = await createResponse.json();
    const createdId = createdBody.data.id;
    expect(createdBody.success).toBeTruthy();

    const publicCreatedResponse = await request.get(`${backendBaseUrl}/api/events`);
    const publicCreatedBody = await publicCreatedResponse.json();
    expect(publicCreatedBody.some((item: { title: string }) => item.title === eventData.title)).toBeTruthy();

    const updateResponse = await request.put(`${backendBaseUrl}/api/admin/events/${createdId}`, {
      headers: {
        Authorization: token,
      },
      data: {
        title: updatedTitle,
        description: `${eventData.description} Updated`,
        event_date: eventData.eventDate,
        location: `${eventData.location} Updated`,
        status: "Active",
      },
    });

    expect(updateResponse.ok()).toBeTruthy();

    const publicUpdatedResponse = await request.get(`${backendBaseUrl}/api/events`);
    const publicUpdatedBody = await publicUpdatedResponse.json();
    expect(publicUpdatedBody.some((item: { title: string }) => item.title === updatedTitle)).toBeTruthy();
    expect(publicUpdatedBody.some((item: { title: string }) => item.title === eventData.title)).toBeFalsy();

    const deleteResponse = await request.delete(`${backendBaseUrl}/api/admin/events/${createdId}`, {
      headers: {
        Authorization: token,
      },
    });

    expect(deleteResponse.ok()).toBeTruthy();

    const publicDeletedResponse = await request.get(`${backendBaseUrl}/api/events`);
    const publicDeletedBody = await publicDeletedResponse.json();
    expect(publicDeletedBody.some((item: { title: string }) => item.title === updatedTitle)).toBeFalsy();
  });
});
