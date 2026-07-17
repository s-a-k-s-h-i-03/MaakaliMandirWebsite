import {
  createHead,
  deleteHead,
  findActiveHeads,
  findAllHeads,
  findHeadById,
  updateHead,
} from "../models/DonationHeadModel.js";

function normalizeHeadPayload(body) {
  return {
    name: String(body?.name || "").trim(),
    description: String(body?.description || "").trim(),
    minimum_amount: Number(body?.minimum_amount || 0),
    status: String(body?.status || "").trim() || "Active",
  };
}

function validateHeadPayload(payload) {
  const errors = [];

  if (!payload.name) {
    errors.push("Donation head name is required.");
  }

  if (!Number.isFinite(payload.minimum_amount) || payload.minimum_amount <= 0) {
    errors.push("Minimum amount must be greater than zero.");
  }

  if (!["Active", "Inactive"].includes(payload.status)) {
    errors.push("Status must be Active or Inactive.");
  }

  return errors;
}

export async function getDonationHeads(_req, res) {
  const heads = await findActiveHeads();
  return res.json({
    success: true,
    message: "Donation heads fetched successfully",
    data: heads,
    items: heads.map((head) => ({
      headid: String(head.id),
      PartyName: head.name,
      rate: Number(head.minimum_amount),
      description: head.description,
      status: head.status,
    })),
  });
}

export async function getAdminDonationHeads(_req, res) {
  const heads = await findAllHeads();
  return res.json({
    success: true,
    message: "Donation heads fetched successfully",
    data: heads,
  });
}

export async function createDonationHead(req, res) {
  const payload = normalizeHeadPayload(req.body);
  const errors = validateHeadPayload(payload);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const head = await createHead(payload);
  return res.status(201).json({
    success: true,
    message: "Donation head created successfully",
    data: head,
  });
}

export async function updateDonationHead(req, res) {
  const existing = await findHeadById(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Donation head not found",
      errors: [],
    });
  }

  const payload = normalizeHeadPayload(req.body);
  const errors = validateHeadPayload(payload);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const head = await updateHead(req.params.id, payload);
  return res.json({
    success: true,
    message: "Donation head updated successfully",
    data: head,
  });
}

export async function deleteDonationHead(req, res) {
  const deleted = await deleteHead(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Donation head not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Donation head deleted successfully",
    data: { id: Number(req.params.id) },
  });
}
