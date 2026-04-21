// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Donations() {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       window.location.href = "/admin/login";
//       return;
//     }

//     axios
//       .get("http://localhost:5000/api/admin/donations", {
//         headers: {
//           Authorization: token
//         }
//       })
//       .then((res) => setData(res.data))
//       .catch((err) => {
//         console.error(err);
//         alert("Failed to load data");
//       });
//   }, []);

//   // ✅ Filter logic
//   const filtered = data.filter((item) =>
//     item.udf1?.toLowerCase().includes(search.toLowerCase()) &&
//     (filter ? item.headid === filter : true)
//   );

//   // ✅ EXPORT FUNCTION
//   const exportCSV = () => {
//     const token = localStorage.getItem("token");

//     fetch("http://localhost:5000/api/admin/export", {
//       headers: {
//         Authorization: token
//       }
//     })
//       .then((res) => res.blob())
//       .then((blob) => {
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "donations.csv";
//         a.click();
//       })
//       .catch(() => alert("Export failed"));
//   };

//   return (
//     <div className="p-6">
//       {/* Title + Export Button */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-[#7A1C1C]">
//           Donations
//         </h1>

//         <button
//           onClick={exportCSV}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//         >
//           Export Excel
//         </button>
//       </div>

//       {/* Search + Filter */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search by name..."
//           className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <select
//           className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="">All Types</option>
//           <option value="001">Tel</option>
//           <option value="002">Ghrit</option>
//           <option value="003">Jawara</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-auto">
//         <table className="w-full text-left">
//           <thead className="bg-[#FFE8B5]">
//             <tr>
//               <th className="p-4">Name</th>
//               <th className="p-4">City</th>
//               <th className="p-4">Amount</th>
//               <th className="p-4">Order ID</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.length > 0 ? (
//               filtered.map((row, i) => (
//                 <tr key={i} className="border-t hover:bg-gray-50 transition">
//                   <td className="p-4">{row.udf1}</td>
//                   <td className="p-4">{row.udf2}</td>
//                   <td className="p-4 font-semibold text-green-600">
//                     ₹{row.amount}
//                   </td>
//                   <td className="p-4">{row.orderid}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center p-6 text-gray-500">
//                   No results found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }