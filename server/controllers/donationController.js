import {
  createDonation,
  deleteDonation,
  findAllDonations,
  findDonationById,
  getDonationStats,
  updateDonation,
} from "../models/DonationModel.js";
import { findHeadById } from "../models/DonationHeadModel.js";
import { exportDonations as exportDonationsCsv } from "../services/csvService.js";
import { createPaymentLog } from "../models/PaymentLogModel.js";
import { generateOrderId, generateReceiptNo } from "../services/payment/PaymentService.js";
import { createNavratriRegistration } from "../models/NavratriModel.js";
import { NAVRATRI_HEAD_OPTIONS } from "../utils/constants.js";

const legacyNavratriHeads = new Map(
  NAVRATRI_HEAD_OPTIONS.map((head) => [head.headid, head]),
);

function getLegacyNavratriHeadId(head) {
  const name = String(head?.name || "").trim().toLowerCase();
  const description = String(head?.description || "").trim().toLowerCase();
  const haystack = `${name} ${description}`;

  if (haystack.includes("tel") || haystack.includes("tail") || haystack.includes("तेल")) {
    return "001";
  }

  if (haystack.includes("ghrit") || haystack.includes("घृत")) {
    return "002";
  }

  if (haystack.includes("jawara") || haystack.includes("jaware") || haystack.includes("जवारे")) {
    return "003";
  }

  return null;
}

function normalizeDonationPayload(body) {
  const rawHeadId = String(body?.head_id ?? body?.headid ?? "").trim();

  return {
    donor_name: String(body?.donor_name || body?.udf1 || "").trim(),
    email: String(body?.email || body?.udf2 || "").trim(),
    phone: String(body?.phone || body?.udf3 || "").trim(),
    address: String(body?.address || body?.udf4 || "").trim(),
    head_id_raw: rawHeadId,
    head_id: Number(rawHeadId || 0),
    amount: Number(body?.amount || 0),
    payment_method: String(body?.payment_method || "Mock").trim() || "Mock",
    message: String(body?.message || "").trim(),
    payment_status: String(body?.payment_status || "Pending").trim() || "Pending",
    gateway: String(body?.gateway || process.env.PAYMENT_PROVIDER || "mock").trim() || "mock",
  };
}

function validateDonationPayload(payload, head) {
  const errors = [];

  if (!payload.donor_name) {
    errors.push("Donor name is required.");
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("A valid email address is required.");
  }

  if (!payload.phone || !/^[0-9]{10,15}$/.test(payload.phone)) {
    errors.push("A valid phone number is required.");
  }

  if (!payload.address) {
    errors.push("Address is required.");
  }

  if (!head) {
    errors.push("Donation head is invalid.");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.push("Amount must be greater than zero.");
  } else if (head && payload.amount < Number(head.minimum_amount)) {
    errors.push(`Minimum amount for ${head.name} is ${head.minimum_amount}.`);
  }

  if (!payload.payment_method) {
    errors.push("Payment method is required.");
  }

  return errors;
}

function validateLegacyNavratriPayload(payload, head) {
  const errors = [];

  if (!payload.donor_name) {
    errors.push("Name is required.");
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("A valid email address is required.");
  }

  if (!payload.phone || !/^[0-9]{10,15}$/.test(payload.phone)) {
    errors.push("A valid phone number is required.");
  }

  if (!payload.address) {
    errors.push("Address is required.");
  }

  if (!head) {
    errors.push("Kalash type is invalid.");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.push("Amount must be greater than zero.");
  } else if (head && payload.amount < Number(head.rate)) {
    errors.push(`Minimum amount for ${head.PartyName} is ${head.rate}.`);
  }

  return errors;
}

function mapCompatibilityResponse(donation) {
  return {
    orderid: donation.order_id,
    amount: donation.amount,
    receipt_no: donation.receipt_no,
    payment_status: donation.payment_status,
    donor_name: donation.donor_name,
    donation_head: donation.donation_head,
  };
}

export async function getDonations(req, res) {
  const rows = await findAllDonations(req.query);
  return res.json(rows);
}

export async function getDonationById(req, res) {
  const donation = await findDonationById(req.params.id);

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: "Donation not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Donation fetched successfully",
    data: donation,
  });
}

export async function exportDonations(req, res) {
  const rows = await findAllDonations(req.query);
  return exportDonationsCsv(
    res,
    rows.map((row) => ({
      receipt_no: row.receipt_no,
      donor_name: row.donor_name,
      phone: row.phone,
      donation_head: row.donation_head,
      amount: row.amount,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      created_at: row.created_at,
    })),
  );
}

export async function getPayHeads(_req, res) {
  return res.json({
    success: true,
    message: "Kalash types fetched successfully",
    data: NAVRATRI_HEAD_OPTIONS,
    items: NAVRATRI_HEAD_OPTIONS,
  });
}

export async function submitEnquiry(req, res) {
  const payload = normalizeDonationPayload(req.body);
  const legacyHead = legacyNavratriHeads.get(payload.head_id_raw);

  if (legacyHead) {
    const errors = validateLegacyNavratriPayload(payload, legacyHead);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const orderId = generateOrderId();

    await createNavratriRegistration({
      legacy_head_id: legacyHead.headid,
      order_id: orderId,
      amount: payload.amount,
      name: payload.donor_name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    });

    return res.status(201).json({
      success: true,
      message: "Kalash registration created successfully",
      orderid: orderId,
      amount: payload.amount,
      receipt_no: orderId,
      payment_status: "Pending",
      donor_name: payload.donor_name,
      donation_head: legacyHead.PartyName,
    });
  }

  const head = await findHeadById(payload.head_id);
  const errors = validateDonationPayload(payload, head);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const donation = await createDonation({
    ...payload,
    receipt_no: generateReceiptNo(),
    order_id: generateOrderId(),
    transaction_id: null,
    gateway_response: { source: "legacy-enquiry-route" },
  });

  await createPaymentLog(donation.id, "donation_created", {
    source: "legacy-enquiry-route",
    payment_status: donation.payment_status,
  });

  const legacyNavratriHeadId = getLegacyNavratriHeadId(head);

  if (legacyNavratriHeadId) {
    await createNavratriRegistration({
      legacy_head_id: legacyNavratriHeadId,
      order_id: donation.order_id,
      amount: donation.amount,
      name: donation.donor_name,
      email: donation.email,
      phone: donation.phone,
      address: donation.address,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Donation created successfully",
    data: donation,
    ...mapCompatibilityResponse(donation),
  });
}

export async function createDonationEntry(req, res) {
  const payload = normalizeDonationPayload(req.body);
  const head = await findHeadById(payload.head_id);
  const errors = validateDonationPayload(payload, head);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const donation = await createDonation({
    ...payload,
    receipt_no: generateReceiptNo(),
    order_id: generateOrderId(),
    transaction_id: null,
    gateway_response: { source: "public-donations-api" },
  });

  await createPaymentLog(donation.id, "donation_created", {
    source: "public-donations-api",
    payment_status: donation.payment_status,
  });

  return res.status(201).json({
    success: true,
    message: "Donation created successfully",
    data: donation,
  });
}

export async function updateDonationEntry(req, res) {
  const existing = await findDonationById(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Donation not found",
      errors: [],
    });
  }

  const payload = normalizeDonationPayload({
    ...existing,
    ...req.body,
    head_id: req.body?.head_id ?? existing.head_id,
  });
  const head = await findHeadById(payload.head_id);
  const errors = validateDonationPayload(payload, head);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const donation = await updateDonation(existing.id, {
    ...payload,
    transaction_id: req.body?.transaction_id || existing.transaction_id,
    gateway: req.body?.gateway || existing.gateway,
    gateway_response: existing.gateway_response,
  });

  return res.json({
    success: true,
    message: "Donation updated successfully",
    data: donation,
  });
}

export async function deleteDonationEntry(req, res) {
  const deleted = await deleteDonation(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Donation not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Donation deleted successfully",
    data: { id: Number(req.params.id) },
  });
}

export async function getDonationDashboardStats(_req, res) {
  const stats = await getDonationStats();
  return res.json({
    success: true,
    message: "Donation statistics fetched successfully",
    data: stats,
  });
}
