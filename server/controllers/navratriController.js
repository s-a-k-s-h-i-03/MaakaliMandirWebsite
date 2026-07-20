import { ApiResponse } from "../utils/ApiResponse.js";
import { NAVRATRI_HEAD_MAP } from "../utils/constants.js";
import {
  deleteNavratriByHeadId,
  deleteNavratriRegistration,
  exportNavratri as exportNavratriData,
  getNavratri as getNavratriData,
} from "../models/NavratriModel.js";
import { exportNavratri as exportNavratriCsv } from "../services/csvService.js";

function getHeadId(type) {
  return NAVRATRI_HEAD_MAP[type];
}

function mapNavratriItems(rows) {
  return rows.map((row) => ({
    kalashNo: row.recno,
    receiptNo: row.orderid,
    name: row.udf1,
    address: row.udf4,
    recordId: row.id ?? null,
  }));
}

function mapNavratriExportRows(rows) {
  return rows.map((row) => ({
    "कलश क्र.": row.recno,
    "रसीद/कलश क्र.": row.orderid,
    नाम: row.udf1,
    पता: row.udf4,
  }));
}

export async function getNavratri(req, res) {
  const headid = getHeadId(req.query.type);

  if (!headid) {
    return res.status(400).json({ message: "Invalid type" });
  }

  const rows = await getNavratriData(headid);
  return ApiResponse.json(res, { items: mapNavratriItems(rows) });
}

export async function exportNavratri(req, res) {
  const { type } = req.query;
  const headid = getHeadId(type);

  if (!headid) {
    return res.status(400).json({ error: "Invalid type" });
  }

  const rows = await exportNavratriData(headid);
  return exportNavratriCsv(res, mapNavratriExportRows(rows), type);
}

export async function deleteNavratriRegistrations(req, res) {
  const { type } = req.query;
  const headid = getHeadId(type);

  if (!headid) {
    return res.status(400).json({
      success: false,
      message: "Invalid type",
      errors: [],
    });
  }

  const deletedCount = await deleteNavratriByHeadId(headid);

  return res.json({
    success: true,
    message: `Deleted ${deletedCount} registration${deletedCount === 1 ? "" : "s"}.`,
    data: {
      type,
      deletedCount,
    },
  });
}

export async function deleteNavratriRegistrationItem(req, res) {
  const { type } = req.query;
  const headid = getHeadId(type);

  if (!headid) {
    return res.status(400).json({
      success: false,
      message: "Invalid type",
      errors: [],
    });
  }

  const deletedCount = await deleteNavratriRegistration(headid, {
    recno: req.body?.kalashNo ?? req.body?.recno,
    orderid: req.body?.receiptNo ?? req.body?.orderid,
  });

  if (!deletedCount) {
    return res.status(404).json({
      success: false,
      message: "Registration not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Registration deleted successfully.",
    data: {
      type,
      deletedCount,
    },
  });
}
