import { useState, useEffect } from "react";
import { getClasses, getSections } from "../../api/academicsApi";
import { getStudents } from "../../api/studentsApi";
import { markBulkAttendance } from "../../api/attendanceApi";
import { CheckCircle, XCircle, Clock, DoorOpen, Coffee, Save, Search } from "lucide-react";

export default function MarkAttendance() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({ class_id: "", section_id: "", date: new Date().toISOString().split('T')[0] });
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    getClasses().then(res => setClasses(res.data.results || res.data));
    getSections().then(res => setSections(res.data.results || res.data));
  }, []);

  const handleFetchStudents = async () => {
    if (!filters.class_id || !filters.section_id) return alert("Select Class and Section");
    const res = await getStudents(); 
    // Filter students belonging to this class/section
    const list = (res.data.results || res.data).filter(s => s.class_name === classes.find(c => c.id == filters.class_id)?.name);
    setStudents(list);
    
    // Default everyone to 'P' (Present)
    const initial = {};
    list.forEach(s => initial[s.id] = 'P');
    setAttendance(initial);
  };

  const toggleStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const payload = {
      date: filters.date,
      attendance_list: Object.keys(attendance).map(id => ({
        student_id: id,
        status: attendance[id],
        class_id: filters.class_id,
        section_id: filters.section_id
      }))
    };
    try {
      await markBulkAttendance(payload);
      alert("Attendance saved successfully!");
    } catch (err) {
      alert("Error saving attendance.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Mark Daily Attendance</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Class</label>
            <select className="w-full border rounded-lg p-2" onChange={e => setFilters({...filters, class_id: e.target.value})}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section</label>
            <select className="w-full border rounded-lg p-2" onChange={e => setFilters({...filters, section_id: e.target.value})}>
              <option value="">Select Section</option>
              {sections.filter(s => s.school_class == filters.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date</label>
            <input type="date" value={filters.date} className="w-full border rounded-lg p-2" onChange={e => setFilters({...filters, date: e.target.value})} />
          </div>
          <button onClick={handleFetchStudents} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Search size={18} /> Load Students
          </button>
        </div>

        {/* Student List Section */}
        {students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-gray-500 font-semibold">Roll</th>
                  <th className="p-4 text-gray-500 font-semibold">Student Name</th>
                  <th className="p-4 text-gray-500 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-600">{s.roll_number}</td>
                    <td className="p-4 font-semibold text-gray-900">{s.first_name} {s.last_name}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <StatusBtn active={attendance[s.id] === 'P'} color="green" icon={<CheckCircle size={16}/>} label="P" onClick={() => toggleStatus(s.id, 'P')} />
                        <StatusBtn active={attendance[s.id] === 'A'} color="red" icon={<XCircle size={16}/>} label="A" onClick={() => toggleStatus(s.id, 'A')} />
                        <StatusBtn active={attendance[s.id] === 'L'} color="yellow" icon={<Clock size={16}/>} label="L" onClick={() => toggleStatus(s.id, 'L')} />
                        <StatusBtn active={attendance[s.id] === 'EL'} color="orange" icon={<DoorOpen size={16}/>} label="EL" onClick={() => toggleStatus(s.id, 'EL')} />
                        <StatusBtn active={attendance[s.id] === 'LE'} color="purple" icon={<Coffee size={16}/>} label="LE" onClick={() => toggleStatus(s.id, 'LE')} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all">
                <Save size={20} /> Save Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBtn({ active, color, icon, label, onClick }) {
  const colors = {
    green: active ? "bg-green-600 text-white" : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100",
    red: active ? "bg-red-600 text-white" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
    yellow: active ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100",
    orange: active ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
    purple: active ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100",
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${colors[color]}`}>
      {icon} {label}
    </button>
  );
}
