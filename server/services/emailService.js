export async function sendDonationReceiptEmail({ donation }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return {
      sent: false,
      reason: "Email configuration not provided",
    };
  }

  return {
    sent: false,
    reason: "Email delivery adapter is environment-controlled and currently disabled in this workspace",
    donationId: donation.id,
  };
}
