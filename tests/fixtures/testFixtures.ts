import { test as base } from "@playwright/test";
import { buildDonationInput, buildEnquiryInput, buildEventInput, getAdminCredentials } from "../data";

type TestFixtures = {
  adminCredentials: ReturnType<typeof getAdminCredentials>;
  enquiryData: ReturnType<typeof buildEnquiryInput>;
  donationData: ReturnType<typeof buildDonationInput>;
  eventData: ReturnType<typeof buildEventInput>;
};

export const test = base.extend<TestFixtures>({
  adminCredentials: async ({}, use) => {
    await use(getAdminCredentials());
  },
  enquiryData: async ({}, use) => {
    await use(buildEnquiryInput());
  },
  donationData: async ({}, use) => {
    await use(buildDonationInput());
  },
  eventData: async ({}, use) => {
    await use(buildEventInput());
  },
});

export const expect = test.expect;
