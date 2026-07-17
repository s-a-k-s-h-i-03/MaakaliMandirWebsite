import { useCallback, useEffect, useMemo, useState } from "react";
import AdminCard from "../Components/AdminCard";
import DataTable from "../Components/DataTable";
import EmptyState from "../Components/EmptyState";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import StatCard from "../Components/StatCard";
import { useToast } from "../Components/ToastProvider";
import { fetchDashboardStats } from "../Services/api";

const REFRESH_INTERVAL_MS = 30000;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatUpdatedAt(value) {
  if (!value) {
    return "Waiting for live data";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function TinyBarChart({ items }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#8b0000] via-[#d97706] to-[#ffd700]"
              style={{ width: `${Math.max((item.value / maxValue) * 100, 6)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisMetric({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[#eadfca] bg-white/90 px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-4xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    lastUpdated: null,
  });
  const { showToast } = useToast();

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setState((current) => ({ ...current, loading: true }));
    }

    try {
      const data = await fetchDashboardStats();
      setState({
        loading: false,
        data,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        data: current.data,
      }));

      if (!silent) {
        showToast({
          tone: "error",
          title: "Dashboard unavailable",
          description: error.response?.data?.error || error.message,
        });
      }
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();

    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadDashboard]);

  const overview = state.data?.overview;
  const analysisMetrics = useMemo(() => (
    overview
      ? [
        {
          label: "Kalash Registrations",
          value: overview.totalNavratriRegistrations,
          hint: `Tel ${overview.telCount} - Ghrit ${overview.ghritCount} - Jawara ${overview.jawaraCount}`,
        },
        {
          label: "Ongoing Events",
          value: overview.ongoingEvents ?? overview.upcomingEvents,
          hint: `${overview.totalEvents} total events currently tracked`,
        },
        {
          label: "Total Donation",
          value: formatCurrency(overview.totalDonationAmount),
          hint: `${overview.totalDonations} donation records processed`,
        },
      ]
      : []
  ), [overview]);

  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Live Dashboard"
        title="Temple live analysis board"
        description="This board auto-refreshes and tracks the current Kalash registrations, ongoing events, and total donation collected from the live backend data."
        action={(
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200">Last Updated</p>
            <p className="mt-1 font-semibold">{formatUpdatedAt(state.lastUpdated)}</p>
          </div>
        )}
      />

      {state.loading && !overview ? <LoadingSkeleton rows={6} /> : null}

      {overview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <AdminCard title="Live analysis board">
              <div className="grid gap-4 md:grid-cols-3">
                {analysisMetrics.map((metric) => (
                  <AnalysisMetric
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                  />
                ))}
              </div>
            </AdminCard>

            <AdminCard title="Quick health snapshot">
              <div className="grid gap-4">
                <StatCard label="Today's Donation" value={formatCurrency(overview.todayDonationsAmount)} hint="Today so far" accent="maroon" />
                <StatCard label="Monthly Donation" value={formatCurrency(overview.monthlyDonationsAmount)} hint="Current month" accent="sun" />
              </div>
            </AdminCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <AdminCard title="Latest Donations">
              <DataTable
                columns={[
                  { key: "receiptNo", label: "Receipt No" },
                  { key: "donorName", label: "Donor Name" },
                  { key: "address", label: "Address" },
                  { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
                ]}
                rows={state.data.latestDonations}
                emptyState={<EmptyState title="No donations found" description="Donation records will appear here as soon as they are available." />}
              />
            </AdminCard>

            <AdminCard title="Kalash breakdown">
              <TinyBarChart
                items={[
                  { label: "Tel", value: overview.telCount },
                  { label: "Ghrit", value: overview.ghritCount },
                  { label: "Jawara", value: overview.jawaraCount },
                  { label: "Total", value: overview.totalNavratriRegistrations },
                ]}
              />
            </AdminCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminCard title="Ongoing and recent events">
              <DataTable
                columns={[
                  { key: "title", label: "Title" },
                  { key: "date", label: "Date" },
                ]}
                rows={state.data.latestEvents}
                emptyState={<EmptyState title="No events found" description="When events are available in the current database, they will appear here." />}
              />
            </AdminCard>

            <AdminCard title="Live backend modules">
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Kalash registrations update the dashboard totals automatically.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Event counts reflect current ongoing records from the events table.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Donation totals refresh using the latest payment-backed donation records.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">This board refreshes every 30 seconds while the dashboard stays open.</li>
              </ul>
            </AdminCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
