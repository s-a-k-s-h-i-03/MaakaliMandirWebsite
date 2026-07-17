import { Parser } from "json2csv";

export function exportDonations(res, rows) {
  const parser = new Parser();
  const csv = `\uFEFF${parser.parse(rows)}`;

  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("donations.csv");
  return res.send(csv);
}

export function exportNavratri(res, rows, type) {
  const parser = new Parser();
  const csv = `\uFEFF${parser.parse(rows)}`;

  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment(`${type}.csv`);
  return res.send(csv);
}
