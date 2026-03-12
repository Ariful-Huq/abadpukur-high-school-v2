import { useEffect, useState } from "react";
import { getMonthlyAttendance } from "../../api/attendanceApi";
import { getClasses, getSections } from "../../api/academicsApi";
import { Calendar, Filter, Printer, FileSpreadsheet } from "lucide-react";

export default function MonthlyAttendance() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default to current month/year
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    class_id: "",
    section_id: "",
  });

  useEffect(() => {
    // Load dropdown options
    getClasses().then(res => setClasses(res.data.results || res.data));
    getSections().then(res => setSections(res.data.results || res.data));
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyAttendance(filters.year, filters.month, filters.class_id, filters.section_id);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'P': return 'bg-green-100 text-green-700 font-bold';
      case 'A': return 'bg-red-100 text-red-700 font-bold';
      case 'L': return 'bg-yellow-100 text-yellow-700 font-bold';
      case 'EL': return 'bg-orange-100 text-orange-700 font-bold';
      case 'LE': return 'bg-purple-100 text-purple-700 font-bold';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
            <h1 className="text-2xl font-bold text-gray-800">Monthly Attendance Report</h1>
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Year</label>
            <input 
              type="number" 
              value={filters.year} 
              className="w-full border rounded-lg p-2" 
              onChange={e => setFilters({...filters, year: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Month</label>
            <select 
              value={filters.month} 
              className="w-full border rounded-lg p-2" 
              onChange={e => setFilters({...filters, month: e.target.value})}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Class</label>
            <select className="w-full border rounded-lg p-2" onChange={e => setFilters({...filters, class_id: e.target.value})}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section</label>
            <select className="w-full border rounded-lg p-2" onChange={e => setFilters({...filters, section_id: e.target.value})}>
              <option value="">All Sections</option>
              {sections.filter(s => s.school_class == filters.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchReport} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Filter size={18} /> Generate
          </button>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 border-r sticky left-0 bg-gray-50 z-10 w-48 font-bold text-gray-600">Student Name</th>
                {[...Array(31)].map((_, i) => (
                  <th key={i} className="p-1 border text-center w-8 text-[10px] font-bold text-gray-400">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="32" className="p-10 text-center text-gray-400">Loading records...</td></tr>
              ) : data.length > 0 ? (
                data.map(student => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r sticky left-0 bg-white font-medium text-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-col">
                        <span>{student.student_name}</span>
                        <span className="text-[10px] text-gray-400">Roll: {student.roll}</span>
                      </div>
                    </td>
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const status = student.days[day.toString()];
                      return (
                        <td key={day} className={`border text-center p-0 w-8 h-10 text-[11px] ${getStatusStyle(status)}`}>
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="32" className="p-10 text-center text-gray-400">No data found for this selection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span> Present (P)</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span> Absent (A)</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></span> Late (L)</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></span> Leave (EL)</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></span> Leave (LE)</div>
      </div>
    </div>
  );
}
