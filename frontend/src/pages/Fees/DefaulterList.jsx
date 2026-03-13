import { useEffect, useState } from "react";
import { getPayments, getFeeStructures } from "../../api/feesApi";
import { getStudents } from "../../api/studentsApi";
import { AlertCircle, UserX, Download, Loader2 } from "lucide-react";

export default function DefaulterList() {
  const [defaulters, setDefaulters] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const fRes = await getFeeStructures();
      const structures = fRes.data.results || fRes.data;
      setFeeTypes(structures);
      if (structures.length > 0) setSelectedFee(structures[0].id);
    } catch (err) {
      console.error("Error loading setup data", err);
    }
  };

  const calculateDefaulters = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([getPayments(), getStudents()]);
      const allPayments = pRes.data.results || pRes.data;
      const allStudents = sRes.data.results || sRes.data;

      // Logic: Students who have NOT paid for the selected fee type this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const list = allStudents.filter(student => {
        const hasPaid = allPayments.find(p => 
          p.student === student.id && 
          p.fee === parseInt(selectedFee) &&
          new Date(p.payment_date).getMonth() === currentMonth &&
          new Date(p.payment_date).getFullYear() === currentYear
        );
        return !hasPaid;
      });

      setDefaulters(list);
    } catch (err) {
      console.error("Error calculating defaulters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFee) calculateDefaulters();
  }, [selectedFee]);

  const handleExport = () => {
    if (defaulters.length === 0) {
      alert("No data available to export.");
      return;
    }

    const selectedFeeName = feeTypes.find(f => f.id === parseInt(selectedFee))?.name || "Fee";
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

    // 1. Headers
    const headers = ["Roll Number", "Student Name", "Class", "Fee Type", "Month", "Status"];
    
    // 2. Map Rows
    const rows = defaulters.map(s => [
      s.roll_number,
      `${s.first_name} ${s.last_name}`,
      s.class_name || "N/A",
      selectedFeeName,
      currentMonthName,
      "UNPAID"
    ]);

    // 3. Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(",")) // Wraps in quotes to handle names with commas
    ].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Defaulters_${selectedFeeName}_${currentMonthName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm">
            <AlertCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Defaulter List</h1>
            <p className="text-sm text-gray-500">
              Unpaid records for {new Date().toLocaleString('default', { month: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedFee}
            onChange={(e) => setSelectedFee(e.target.value)}
            className="border-none rounded-xl px-4 py-2.5 bg-white text-sm font-semibold shadow-sm focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
          >
            {feeTypes.map(f => (
              <option key={f.id} value={f.id}>{f.name} (TK {f.amount})</option>
            ))}
          </select>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-red-50/30 text-red-500 text-[11px] uppercase font-black tracking-wider">
                <th className="px-6 py-5">Roll</th>
                <th className="px-6 py-5">Student Name</th>
                <th className="px-6 py-5">Class</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-red-500" size={32} />
                      <p className="text-gray-400 text-sm font-medium italic">Analyzing payment records...</p>
                    </div>
                  </td>
                </tr>
              ) : defaulters.length > 0 ? (
                defaulters.map((s) => (
                  <tr key={s.id} className="hover:bg-red-50/20 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{s.roll_number}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                        {s.first_name} {s.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{s.class_name || "Class A"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        Pending Payment
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full">
                         <UserX size={40} className="opacity-40" />
                      </div>
                      <p className="text-gray-500 font-medium">Clear record! All students have paid.</p>
                      <p className="text-gray-400 text-xs">No pending dues found for this fee category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Footer */}
      {!loading && (
        <div className="mt-6 flex justify-end">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Defaulters</p>
              <p className="text-xl font-black text-red-600">{defaulters.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}