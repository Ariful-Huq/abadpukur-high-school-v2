// frontend/src/pages/Results/TabulationSheet.jsx
import { useState, useEffect } from "react";
import { getClasses, getSections } from "../../api/academicsApi";
import { getExams, getTabulationSheet } from "../../api/resultsApi";
import { Table, Printer, Search, FileDown, UserSearch, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx"; // Import for Excel Export

export default function TabulationSheet() {
  const [filters, setFilters] = useState({ class_id: "", section_id: "", exam_id: "" });
  const [searchTerm, setSearchTerm] = useState(""); // Feature 4: Search
  const [data, setData] = useState({ classes: [], sections: [], exams: [] });
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getClasses(), getSections(), getExams()]).then(([cls, sec, exm]) => {
      setData({
        classes: cls.data.results || cls.data || [],
        sections: sec.data.results || sec.data || [],
        exams: exm.data.results || exm.data || [],
      });
    });
  }, []);

  // Feature 4: Filter students based on search term (Name or Roll)
  const filteredStudents = sheet?.students.filter(stu => 
    stu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stu.roll.toString().includes(searchTerm)
  ) || [];

  const handleFetchSheet = async () => {
    if (!filters.class_id || !filters.section_id || !filters.exam_id) {
      return alert("Please select Exam, Class, and Section first.");
    }
    setLoading(true);
    try {
      const res = await getTabulationSheet(filters.class_id, filters.section_id, filters.exam_id);
      
    // Sort students by Roll Number numerically before saving to state
    const sortedData = {
      ...res.data,
      students: res.data.students.sort((a, b) => parseInt(a.roll) - parseInt(b.roll))
    };
    
    setSheet(sortedData);
    } catch (err) {
      alert("Failed to load tabulation sheet.");
    } finally {
      setLoading(false);
    }
  };

  // Feature 2: Export to Excel
  const exportToExcel = () => {
    if (!sheet) return;

    // Prepare Header Row
    const headers = ["Roll", "Student Name", ...sheet.subjects.map(s => s.name), "Grand Total", "Attendance %"];
    
    // Prepare Data Rows
    const rows = sheet.students.map(stu => [
      stu.roll,
      stu.name,
      ...stu.marks.map(m => `${m.total} (${m.grade})`),
      stu.grand_total,
      `${stu.attendance_pc}%`
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tabulation_Sheet");
    
    // Generate file name based on filters
    const fileName = `Tabulation_${filters.class_id}_${filters.section_id}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header & Main Actions */}
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Table className="text-purple-600" /> Tabulation Sheet
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={exportToExcel}
              disabled={!sheet}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              <FileDown size={18} /> Export Excel
            </button>
            <button 
              onClick={() => window.print()} 
              disabled={!sheet}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-black disabled:opacity-50"
            >
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 print:hidden">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-400 uppercase block ml-1">Exam</label>
              <select className="w-full border rounded-lg p-2 mt-1" value={filters.exam_id} onChange={e => setFilters({...filters, exam_id: e.target.value})}>
                <option value="">Select Exam</option>
                {data.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-400 uppercase block ml-1">Class</label>
              <select className="w-full border rounded-lg p-2 mt-1" value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value, section_id: ""})}>
                <option value="">Select Class</option>
                {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-400 uppercase block ml-1">Section</label>
              <select className="w-full border rounded-lg p-2 mt-1" value={filters.section_id} onChange={e => setFilters({...filters, section_id: e.target.value})} disabled={!filters.class_id}>
                <option value="">Select Section</option>
                {data.sections.filter(s => String(s.school_class) === String(filters.class_id)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleFetchSheet} disabled={loading} className="bg-purple-600 text-white px-8 py-2 rounded-lg hover:bg-purple-700 h-10 font-bold flex items-center gap-2">
              {loading ? "..." : <><Search size={18} /> Generate</>}
            </button>
          </div>

          {/* Feature 4: Inline Search */}
          {sheet && (
            <div className="pt-4 border-t flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <UserSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Quick search student by name or roll..."
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-400 italic">Showing {filteredStudents.length} of {sheet.students.length} students</p>
            </div>
          )}
        </div>

        {/* Results Table */}
        {sheet ? (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3 border border-gray-700 sticky left-0 bg-gray-800 z-10">Roll</th>
                    <th className="p-3 border border-gray-700 sticky left-12 bg-gray-800 z-10 min-w-[150px]">Name</th>
                    {sheet.subjects.map(sub => (
                      <th key={sub.id} className="p-3 border border-gray-700 text-center min-w-[80px] uppercase font-bold">
                        {sub.name}
                      </th>
                    ))}
                    <th className="p-3 border border-gray-700 bg-purple-900 text-center">Total</th>
                    <th className="p-3 border border-gray-700 bg-blue-900 text-center uppercase">Attn %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 border-b">
                      <td className="p-3 border text-center font-bold sticky left-0 bg-white z-10">{stu.roll}</td>
                      <td className="p-3 border font-semibold sticky left-12 bg-white z-10">{stu.name}</td>
                      {stu.marks.map((m, mIdx) => (
                        <td key={mIdx} className="p-3 border text-center">
                          <div className="font-bold text-gray-800">{m.total}</div>
                          <div className={`text-[9px] font-black ${m.grade === 'F' ? 'text-red-500' : 'text-blue-600'}`}>{m.grade}</div>
                        </td>
                      ))}
                      <td className="p-3 border text-center font-black bg-purple-50 text-purple-700 text-sm">
                        {stu.grand_total}
                      </td>
                      <td className="p-3 border text-center font-bold bg-blue-50 text-blue-700">
                        {stu.attendance_pc}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 p-12 rounded-3xl text-center border border-dashed border-purple-200">
             <AlertCircle className="mx-auto text-purple-300 mb-2" size={48} />
             <p className="text-purple-900 font-medium">Select criteria to view the Master Tabulation Sheet.</p>
          </div>
        )}
      </div>
    </div>
  );
}