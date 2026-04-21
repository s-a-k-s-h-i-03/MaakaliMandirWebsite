import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("donations");
  const [data, setData] = useState([]);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    let url = "";

    if (activeTab === "donations") {
      url = "http://localhost:5000/api/admin/donations";
    } else {
      url = `http://localhost:5000/api/navratri?type=${activeTab}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: token }
    });

    setData(res.data.items || res.data);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const exportData = () => {
    if (activeTab === "donations") {
      window.open("http://localhost:5000/api/admin/export/donations");
    } else {
      window.open(
        `http://localhost:5000/api/admin/export/navratri?type=${activeTab}`
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["donations", "tel", "ghrit", "jawara"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-red-700 text-white"
                : "bg-white border"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Export Button */}
      <button
        onClick={exportData}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        Export Excel
      </button>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-[#FFE8B5]">
            <tr>
              <th className="p-3">कलश क्र.</th>
              <th className="p-3">रसीद/कलश क्र.</th>
              <th className="p-3">नाम</th>
              <th className="p-3">पता</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">
                  {row.kalashNo || row.recno || "-"}
                </td>
                <td className="p-3">
                  {row.receiptNo || row.orderid || "-"}
                </td>
                <td className="p-3">
                  {row.name || row.udf1 || "-"}
                </td>
                <td className="p-3">
                  {row.address || row.udf4 || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <p className="mt-4 text-gray-500">No data available</p>
      )}
    </div>
  );
}