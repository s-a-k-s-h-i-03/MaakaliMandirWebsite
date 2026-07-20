import { buildFakeUser } from "./users";

export type EnquiryInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  amount: string;
  headLabel: "tel" | "ghrit" | "jawara";
};

export function buildEnquiryInput(headLabel: EnquiryInput["headLabel"] = "tel"): EnquiryInput {
  const user = buildFakeUser("enquiry");
  const defaultAmounts: Record<EnquiryInput["headLabel"], string> = {
    tel: "101",
    ghrit: "151",
    jawara: "101",
  };

  return {
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    amount: defaultAmounts[headLabel],
    headLabel,
  };
}
