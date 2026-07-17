import { buildSeed } from "../helpers";

export type AdminCredentials = {
  username: string;
  password: string;
};

export type FakeUser = {
  seed: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

export function getAdminCredentials(): AdminCredentials {
  return {
    username: process.env.PLAYWRIGHT_ADMIN_USERNAME || "admin",
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "admin123",
  };
}

export function buildFakeUser(prefix = "user"): FakeUser {
  const seed = buildSeed(prefix);
  const digits = seed.replace(/\D/g, "").slice(-5).padStart(5, "0");

  return {
    seed,
    fullName: `Playwright ${prefix} ${digits}`,
    email: `${prefix}.${seed}@example.com`,
    phone: `9${digits}${digits}`.slice(0, 10),
    address: `Automation Address ${digits}`,
  };
}
