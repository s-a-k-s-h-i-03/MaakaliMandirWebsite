import { buildFakeUser } from "./users";

export type DonationInput = {
  donorName: string;
  email: string;
  phone: string;
  address: string;
  amount: string;
  message: string;
  paymentMethod: "Mock" | "UPI" | "Bank" | "Cash";
};

export function buildDonationInput(minimumAmount = 151): DonationInput {
  const user = buildFakeUser("donation");

  return {
    donorName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    amount: String(minimumAmount),
    message: `Automated donation for ${user.seed}`,
    paymentMethod: "Mock",
  };
}
