import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getDonationSummary,
  getEventSummary,
  getLatestDonations,
  getLatestEvents,
  getNavratriSummary,
} from "../models/DashboardModel.js";
import { findActive as findActiveServices } from "../models/ServiceModel.js";

function toNumber(value) {
  return Number(value || 0);
}

function mapLatestDonation(row) {
  return {
    receiptNo: row.receipt_no || "-",
    donorName: row.donor_name || "-",
    address: row.address || "-",
    amount: toNumber(row.amount),
    date: row.created_at || null,
  };
}

function mapLatestEvent(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    image: row.image || "",
  };
}

export async function getDashboardStats(_req, res) {
  const [donationSummary, eventSummary, navratriSummary, latestDonations, latestEvents, services] = await Promise.all([
    getDonationSummary(),
    getEventSummary(),
    getNavratriSummary(),
    getLatestDonations(),
    getLatestEvents(),
    findActiveServices(),
  ]);

  return ApiResponse.json(res, {
    overview: {
      totalDonations: toNumber(donationSummary.totalDonations),
      todayDonationsAmount: toNumber(donationSummary.todayDonationsAmount),
      monthlyDonationsAmount: toNumber(donationSummary.monthlyDonationsAmount),
      totalDonationAmount: toNumber(donationSummary.totalDonationAmount),
      totalEvents: toNumber(eventSummary.totalEvents),
      ongoingEvents: toNumber(eventSummary.upcomingEvents),
      upcomingEvents: toNumber(eventSummary.upcomingEvents),
      pastEvents: toNumber(eventSummary.pastEvents),
      totalNavratriRegistrations: toNumber(navratriSummary.totalRegistrations),
      telCount: toNumber(navratriSummary.telCount),
      ghritCount: toNumber(navratriSummary.ghritCount),
      jawaraCount: toNumber(navratriSummary.jawaraCount),
      totalEnquiries: 0,
      totalServices: services.length,
      latestPayments: 0,
      latestVisitors: 0,
    },
    latestDonations: latestDonations.map(mapLatestDonation),
    latestEvents: latestEvents.map(mapLatestEvent),
  });
}
