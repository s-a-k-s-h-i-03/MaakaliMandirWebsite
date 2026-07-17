import { expect, test } from "@playwright/test";
import { backendBaseUrl } from "../helpers/urls";

test.describe("Health API", () => {
  test("returns a healthy database-backed status response", async ({ request }) => {
    const response = await request.get(`${backendBaseUrl}/api/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      message: "OK",
      data: {
        ok: true,
      },
    });
    expect(["mysql", "postgres"]).toContain(body.data.dialect);
  });
});
