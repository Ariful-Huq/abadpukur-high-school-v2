import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { getMonthlyAttendance } from "../../api/attendanceApi";
import { getClasses, getSections } from "../../api/academicsApi";
import { Calendar, Filter, Printer, Search, FileSpreadsheet } from "lucide-react";

export default function MonthlyAttendance() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    class_id: "",
    section_id: "",
  });

  useEffect(() => {
    getClasses().then(res => setClasses(res.data.results || res.data));
    getSections().then(res => setSections(res.data.results || res.data));
  }, []);

  // --- LOGIC HELPERS ---

  const daysInMonth = new Date(filters.year, filters.month, 0).getDate();

  const isWeekend = (dayNumber) => {
    const date = new Date(filters.year, filters.month - 1, dayNumber);
    const dayOfWeek = date.getDay(); 
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday
  };

  const fetchReport = async () => {
    if (!filters.class_id || !filters.section_id) return alert("Select Class and Section");
    setLoading(true);
    try {
      const res = await getMonthlyAttendance(
        filters.year, 
        filters.month, 
        filters.class_id, 
        filters.section_id
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (data.length === 0) return alert("No data to export. Please generate the report first.");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Attendance");

    // Define Columns
    const columns = [
      { header: "Student Name", key: "name", width: 25 },
      { header: "Roll", key: "roll", width: 8 },
      ...[...Array(daysInMonth)].map((_, i) => ({
        header: (i + 1).toString(),
        key: `day_${i + 1}`,
        width: 4
      })),
      { header: "P+L", key: "total_p", width: 8 },
      { header: "A+EL", key: "total_a", width: 8 },
      { header: "Percentage", key: "percent", width: 12 },
    ];
    worksheet.columns = columns;

    // Add Data Rows
    filteredData.forEach(student => {
      const attendanceValues = Object.values(student.days);
      const p = attendanceValues.filter(v => v === 'P').length;
      const l = attendanceValues.filter(v => v === 'L').length;
      const a = attendanceValues.filter(v => v === 'A').length;
      const el = attendanceValues.filter(v => v === 'EL').length;
      const totalRecords = attendanceValues.filter(v => v !== "").length;
      const perc = totalRecords > 0 ? (((p + l) / totalRecords) * 100).toFixed(1) : "0.0";

      const rowData = {
        name: student.student_name,
        roll: student.roll,
        total_p: p + l,
        total_a: a + el,
        percent: `${perc}%`
      };

      for (let i = 1; i <= daysInMonth; i++) {
        rowData[`day_${i}`] = student.days[i.toString()] || "-";
      }

      const row = worksheet.addRow(rowData);

      // Status Coloring
      row.eachCell((cell, colNumber) => {
        if (colNumber > 2 && colNumber <= daysInMonth + 2) {
          if (cell.value === "P") cell.font = { color: { argb: "FF008000" }, bold: true };
          if (cell.value === "A") cell.font = { color: { argb: "FFFF0000" }, bold: true };
          if (cell.value === "L") cell.font = { color: { argb: "FFD4A017" }, bold: true };
        }
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_${filters.year}_Month_${filters.month}.xlsx`;
    link.click();
  };

  const filteredData = data.filter(student => 
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll.toString().includes(searchTerm)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'P': return 'bg-green-100 text-green-700 font-bold';
      case 'A': return 'bg-red-100 text-red-700 font-bold';
      case 'L': return 'bg-yellow-100 text-yellow-700 font-bold';
      case 'EL': return 'bg-orange-100 text-orange-700 font-bold';
      case 'LE': return 'bg-blue-100 text-blue-700 font-bold';
      default: return '';
    }
  };

  const dailyTotals = [...Array(daysInMonth)].map((_, i) => {
    const day = (i + 1).toString();
    return data.reduce((acc, student) => {
      const status = student.days[day];
      return (status === "P" || status === "L") ? acc + 1 : acc;
    }, 0);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
            <h1 className="text-2xl font-bold text-gray-800">Monthly Attendance Report</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name or roll..." 
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors text-sm">
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Year</label>
            <input type="number" value={filters.year} className="w-full border rounded-lg p-2 text-sm" onChange={e => setFilters({...filters, year: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Month</label>
            <select value={filters.month} className="w-full border rounded-lg p-2 text-sm" onChange={e => setFilters({...filters, month: e.target.value})}>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Class</label>
            <select className="w-full border rounded-lg p-2 text-sm" value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Section</label>
            <select className="w-full border rounded-lg p-2 text-sm" value={filters.section_id} onChange={e => setFilters({...filters, section_id: e.target.value})}>
              <option value="">Select Section</option>
              {sections.filter(s => s.school_class == filters.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={fetchReport} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <Filter size={18} /> Generate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 border-r sticky left-0 bg-gray-50 z-10 w-48 font-bold text-gray-600 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Student Name</th>
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const weekend = isWeekend(day);
                  return (
                    <th key={i} className={`p-1 border text-center w-8 text-[10px] font-bold ${weekend ? 'bg-red-50 text-red-400' : 'text-gray-400'}`}>
                      {day}
                    </th>
                  );
                })}
                <th className="p-2 border text-center w-12 text-[10px] font-bold text-green-600 bg-green-50">P+L</th>
                <th className="p-2 border text-center w-12 text-[10px] font-bold text-red-600 bg-red-50">A+EL</th>
                <th className="p-2 border text-center w-16 text-[10px] font-bold text-blue-600 bg-blue-50">%</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={daysInMonth + 4} className="p-10 text-center text-gray-400 italic">Processing attendance data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(student => {
                  const attendanceValues = Object.values(student.days);
                  const totalPresent = attendanceValues.filter(v => v === 'P').length;
                  const totalLate = attendanceValues.filter(v => v === 'L').length;
                  const totalAbsent = attendanceValues.filter(v => v === 'A').length;
                  const totalLeave = attendanceValues.filter(v => v === 'EL').length;
                  
                  const totalRecords = attendanceValues.filter(v => v !== "").length;
                  const percentage = totalRecords > 0 
                    ? (((totalPresent + totalLate) / totalRecords) * 100).toFixed(1) 
                    : "0.0";

                  return (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-r sticky left-0 bg-white font-medium text-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col">
                          <span className="truncate w-40">{student.student_name}</span>
                          <span className="text-[9px] text-gray-400">Roll: {student.roll}</span>
                        </div>
                      </td>
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const status = student.days[day.toString()];
                        const weekend = isWeekend(day);
                        return (
                          <td key={day} className={`border text-center p-0 w-8 h-10 text-[11px] ${getStatusStyle(status)} ${weekend && !status ? 'bg-gray-50' : ''}`}>
                            {status}
                          </td>
                        );
                      })}
                      <td className="border text-center font-bold text-green-700 bg-green-50/20">{totalPresent + totalLate}</td>
                      <td className="border text-center font-bold text-red-700 bg-red-50/20">{totalAbsent + totalLeave}</td>
                      <td className="border text-center font-bold text-blue-700 bg-blue-50/20">{percentage}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={daysInMonth + 4} className="p-10 text-center text-gray-400">No students found.</td></tr>
              )}
            </tbody>
            {!loading && data.length > 0 && (
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td className="p-3 border-r sticky left-0 bg-gray-100 font-bold text-gray-700 z-10 text-[11px]">Daily Present Total</td>
                  {dailyTotals.map((total, i) => {
                    const weekend = isWeekend(i + 1);
                    return (
                      <td key={i} className={`border text-center p-1 text-[10px] font-bold ${weekend ? 'text-gray-400 bg-gray-200/30' : 'text-blue-700'}`}>
                        {weekend && total === 0 ? '—' : total}
                      </td>
                    );
                  })}
                  <td colSpan="3" className="bg-gray-200/50"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
