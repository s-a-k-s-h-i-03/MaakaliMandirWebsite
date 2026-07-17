import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { apiBaseUrl } from "../content";

function getNavratriConfig(type) {
  if (type === "tel") return { label: "तेल ज्योति कलश सूची" };
  if (type === "ghrit") return { label: "घृत ज्योति कलश सूची" };
  if (type === "jawara") return { label: "जवारें कलश सूची" };
  return null;
}

if (import.meta.env.DEV) {
  console.assert(getNavratriConfig("tel")?.label === "तेल ज्योति कलश सूची", "Navratri type mapping failed");
}

export default function NavratriList() {
  const { type } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const config = useMemo(() => getNavratriConfig(type), [type]);

  useEffect(() => {
    if (!config) {
      return;
    }

    let active = true;

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`${apiBaseUrl || ""}/api/navratri?type=${type}`);
        if (!active) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError.response?.data?.message || "No records found");
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [config, type]);

  if (!config) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <p className="font-hindi text-lg font-semibold text-slate-700 md:text-xl">
            आदिशक्ति माँ काली मंदिर सोनकुंड - पेंड्रा गौरेला मरवाही
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 md:text-5xl">
            चैत्र नवरात्रि - 2026
          </h1>
          <p className="mt-4 font-hindi text-xl font-semibold text-slate-700 md:text-2xl">
            [{` ${config.label} `}]
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center px-6 py-12">
                <div className="flex items-center gap-4 text-slate-600">
                  <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500" />
                  <span className="font-medium">Loading records...</span>
                </div>
              </div>
            ) : error || items.length === 0 ? (
              <div className="px-6 py-12 text-center text-lg font-medium text-slate-600">
                No records found
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-4 text-sm font-semibold md:px-6 md:text-base">कलश क्रमांक</th>
                    <th className="px-4 py-4 text-sm font-semibold md:px-6 md:text-base">रसीद / कलश क्रमांक</th>
                    <th className="px-4 py-4 text-sm font-semibold md:px-6 md:text-base">नाम</th>
                    <th className="px-4 py-4 text-sm font-semibold md:px-6 md:text-base">पता</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={`${item.kalashNo}-${item.receiptNo}-${index}`}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition hover:bg-amber-50`}
                    >
                      <td className="px-4 py-4 text-sm text-slate-700 md:px-6 md:text-base">{item.kalashNo}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 md:px-6 md:text-base">{item.receiptNo}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 md:px-6 md:text-base">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 md:px-6 md:text-base">{item.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
