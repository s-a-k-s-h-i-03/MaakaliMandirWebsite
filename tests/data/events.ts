import { buildSeed } from "../helpers";

export type EventInput = {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: "Active" | "Inactive";
  imagePath: string;
};

export function buildEventInput(): EventInput {
  const seed = buildSeed("event");
  const suffix = seed.slice(-6);

  return {
    title: `Playwright Event ${suffix}`,
    description: `Automated event description for ${seed}.`,
    eventDate: "2026-12-31",
    location: `Temple Hall ${suffix}`,
    status: "Active",
    imagePath: "C:\\Users\\saksh\\maakalisonkundgpm.org_new\\client\\dist\\assets\\images\\news\\01.jpg",
  };
}
