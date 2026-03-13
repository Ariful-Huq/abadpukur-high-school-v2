import { useEffect, useState, useRef } from "react";
import { getPeriods, getRoutines, createRoutineEntry, deleteRoutineEntry } from "../../api/routineApi";
import { getClasses, getSections, getSubjects } from "../../api/academicsApi";
import { getTeachers } from "../../api/teachersApi";
import { CalendarDays, Plus, Settings, X, Trash2, Upload, Download, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import autoTable from "jspdf-autotable";

const DAYS = [
  { id: "sun", name: "Sunday" },
  { id: "mon", name: "Monday" },
  { id: "tue", name: "Tuesday" },
  { id: "wed", name: "Wednesday" },
  { id: "thu", name: "Thursday" },
];

export default function RoutineTable() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [periods, setPeriods] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [filters, setFilters] = useState({ class_id: "", section_id: "" });
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ day: "sun", period: "", subject: "", teacher: "" });

  useEffect(() => {
    getPeriods().then(res => setPeriods(res.data.results || res.data));
    getClasses().then(res => setClasses(res.data.results || res.data));
    getSections().then(res => setSections(res.data.results || res.data));
    getSubjects().then(res => setSubjects(res.data.results || res.data));
    getTeachers().then(res => setTeachers(res.data.results || res.data));
  }, []);

  const loadRoutine = () => {
    if (filters.class_id && filters.section_id) {
      getRoutines(filters.class_id, filters.section_id).then(res => setRoutines(res.data.results || res.data));
    }
  };

  const handleAddSchedule = async () => {
    if(!newEntry.period || !newEntry.subject || !newEntry.teacher) return alert("Fill all fields");
    const payload = { ...newEntry, school_class: filters.class_id, section: filters.section_id };
    try {
      await createRoutineEntry(payload);
      setShowModal(false);
      loadRoutine();
      setNewEntry({ ...newEntry, subject: "", teacher: "" });
    } catch (err) {
      const backendError = err.response?.data?.non_field_errors?.[0] || 
                           err.response?.data?.detail || 
                           "Failed to save schedule. Check for conflicts.";
      alert(backendError);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this slot?")) {
      try {
        await deleteRoutineEntry(id);
        loadRoutine();
      } catch (err) {
        alert("Could not delete slot.");
      }
    }
  };

  // --- NEW: Download Sample Excel ---
  const downloadSampleExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Routine Template");

    worksheet.columns = [
      { header: "Day", key: "day", width: 15 },
      { header: "Period", key: "period", width: 15 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Teacher", key: "teacher", width: 25 },
    ];

    // Add example data
    worksheet.addRow({ day: "Sunday", period: periods[0]?.name || "1st", subject: subjects[0]?.name || "Math", teacher: teachers[0] ? `${teachers[0].first_name} ${teachers[0].last_name}` : "Teacher Name" });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Routine_Template.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Updated Bulk Upload Logic using ExcelJS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !filters.class_id || !filters.section_id) return alert("Select Class/Section first!");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    const worksheet = workbook.getWorksheet(1);

    let successCount = 0;
    let errors = [];

    worksheet.eachRow(async (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip Header

      const rowDay = row.getCell(1).text.trim();
      const rowPeriod = row.getCell(2).text.trim();
      const rowSubject = row.getCell(3).text.trim();
      const rowTeacher = row.getCell(4).text.trim();

      const periodId = periods.find(p => p.name.toLowerCase() === rowPeriod.toLowerCase())?.id;
      const subjectId = subjects.find(s => s.name.toLowerCase() === rowSubject.toLowerCase())?.id;
      const teacherId = teachers.find(t => `${t.first_name} ${t.last_name}`.toLowerCase() === rowTeacher.toLowerCase())?.id;
      const dayId = DAYS.find(d => d.name.toLowerCase() === rowDay.toLowerCase())?.id;

      if (periodId && subjectId && teacherId && dayId) {
        try {
          await createRoutineEntry({
            school_class: filters.class_id,
            section: filters.section_id,
            day: dayId,
            period: periodId,
            subject: subjectId,
            teacher: teacherId
          });
          successCount++;
        } catch (err) {
          errors.push(`Row ${rowNumber}: ${err.response?.data?.non_field_errors?.[0] || "Conflict"}`);
        }
      }
    });

    alert("Upload processed. Refresh the table to see changes.");
    loadRoutine();
  };

  // --- PDF Export Logic ---
  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const className = classes.find(c => c.id == filters.class_id)?.name || "";
    const sectionName = sections.find(s => s.id == filters.section_id)?.name || "";

    doc.setFontSize(16);
    doc.text(`${className} - Section ${sectionName} Routine`, 14, 15);

    const tableColumn = ["Day", ...periods.map(p => `${p.name}\n${p.start_time.slice(0,5)}`)];
    const tableRows = DAYS.map(day => {
      const row = [day.name];
      periods.forEach(p => {
        const entry = getCellContent(day.id, p.id);
        row.push(entry ? `${entry.subject_name}\n(${entry.teacher_name})` : "-");
      });
      return row;
    });

    autoTable(doc, {
      startY: 25,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
      bodyStyles: { fontSize: 7, halign: 'center' },
      styles: { font: "helvetica" }
    });
    doc.save(`Routine_${className}_${sectionName}.pdf`);
  };

  const getCellContent = (dayId, periodId) => {
    return routines.find(r => r.day === dayId && r.period === periodId);
  };

  return (
    <div className="w-full max-w-[calc(100vw-280px)] overflow-x-hidden p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={20} /> Class Routine
          </h1>
          <div className="flex gap-2">
            <button onClick={downloadSampleExcel} className="text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-100 text-xs font-medium transition-all">
              <FileSpreadsheet size={14} /> Sample Template
            </button>
            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".xlsx" />
            <button 
              disabled={!filters.class_id || !filters.section_id} 
              onClick={() => fileInputRef.current.click()} 
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 disabled:bg-gray-300 text-xs font-medium transition-all"
            >
              <Upload size={14} /> Bulk Upload
            </button>
            <button 
              disabled={routines.length === 0} 
              onClick={downloadPDF} 
              className="bg-gray-100 text-gray-700 border px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50 text-xs font-medium transition-all"
            >
              <Download size={14} /> PDF
            </button>
            <button onClick={() => navigate("/routine/periods")} className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs font-medium transition-all">
              <Settings size={14} /> Manage Periods
            </button>
            <button disabled={!filters.class_id || !filters.section_id} onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 text-xs font-medium transition-all">
              <Plus size={14} /> Add Slot
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
          <select className="border rounded-lg p-2 text-xs flex-1 bg-gray-50/50" value={filters.class_id} onChange={e => setFilters({ ...filters, class_id: e.target.value })}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="border rounded-lg p-2 text-xs flex-1 bg-gray-50/50" value={filters.section_id} onChange={e => setFilters({ ...filters, section_id: e.target.value })}>
            <option value="">Select Section</option>
            {sections.filter(s => s.school_class == filters.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={loadRoutine} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black text-xs font-bold transition-colors">
            View
          </button>
        </div>

        {/* Routine Table Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-2 border-r w-24 text-gray-400 font-bold text-[9px] uppercase sticky left-0 bg-gray-50 z-20">Day</th>
                  {periods.map(p => (
                    <th key={p.id} className="p-2 border-r">
                      <div className="text-[11px] font-bold text-gray-800 truncate">{p.name}</div>
                      <div className="text-[9px] text-gray-400 font-normal">
                        {p.start_time.slice(0, 5)}-{p.end_time.slice(0, 5)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day.id} className="border-b last:border-0">
                    <td className="p-2 border-r bg-gray-50/50 font-bold text-gray-600 text-[11px] sticky left-0 z-10">{day.name}</td>
                    {periods.map(period => {
                      const entry = getCellContent(day.id, period.id);
                      return (
                        <td key={period.id} className="p-1 border-r text-center h-14 hover:bg-blue-50/20 transition-colors relative group">
                          {entry ? (
                            <div className="bg-blue-50/80 p-1.5 rounded border border-blue-100 h-full flex flex-col justify-center relative">
                              <div className="text-[10px] font-bold text-blue-900 truncate leading-tight">{entry.subject_name}</div>
                              <div className="text-[8px] text-blue-500 font-medium truncate mt-0.5 uppercase tracking-tighter">{entry.teacher_name}</div>
                              <button 
                                onClick={() => handleDelete(entry.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                              >
                                <Trash2 size={8} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-200 text-[8px] font-medium uppercase tracking-tighter select-none">Free</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={18} /></button>
            <h2 className="text-lg font-bold text-gray-800">Assign Slot</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">Day</label>
                <select className="w-full border rounded-lg p-2 bg-gray-50 text-xs" value={newEntry.day} onChange={e => setNewEntry({...newEntry, day: e.target.value})}>
                  {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">Period</label>
                <select className="w-full border rounded-lg p-2 bg-gray-50 text-xs" onChange={e => setNewEntry({...newEntry, period: e.target.value})}>
                  <option value="">Select</option>
                  {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">Subject</label>
              <select className="w-full border rounded-lg p-2 bg-gray-50 text-xs" value={newEntry.subject} onChange={e => setNewEntry({...newEntry, subject: e.target.value})}>
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">Teacher</label>
              <select className="w-full border rounded-lg p-2 bg-gray-50 text-xs" value={newEntry.teacher} onChange={e => setNewEntry({...newEntry, teacher: e.target.value})}>
                <option value="">Select</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs text-gray-500 font-bold border rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddSchedule} className="flex-1 py-2 text-xs bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
