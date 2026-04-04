// src/pages/Results/TermReports.jsx
import { useState, useEffect } from "react";
import { getClasses, getSections } from "../../api/academicsApi";
import { getStudents } from "../../api/studentsApi";
import { getExams, getStudentReport } from "../../api/resultsApi";
import { Printer, FileText, Search } from "lucide-react";

export default function TermReports() {
  const [data, setData] = useState({ classes: [], sections: [], exams: [] });
  const [filters, setFilters] = useState({ class_id: "", section_id: "", student_id: "", exam_id: "" });
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    Promise.all([getClasses(), getSections(), getExams()]).then(([cls, sec, exm]) => {
      setData({
        classes: cls.data.results || cls.data,
        sections: sec.data.results || sec.data,
        exams: exm.data.results || exm.data,
      });
    });
  }, []);

  // Update student list when class/section changes
  useEffect(() => {
    if (filters.class_id && filters.section_id) {
      getStudents(filters.class_id, filters.section_id).then(res => {
        const studentList = res.data.results || res.data;
        setStudents(studentList);
      });
    }
  }, [filters.class_id, filters.section_id]);

  const handleFetchReport = async () => {
    const selectedStudent = students.find(s => String(s.id) === String(filters.student_id));
    if (!selectedStudent?.enrollment_id || !filters.exam_id) return alert("Select Student & Exam");

    try {
      const res = await getStudentReport(selectedStudent.enrollment_id, filters.exam_id);
      setReport(res.data);
    } catch (err) {
      alert("Failed to load report.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> Academic Reports
        </h1>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Exam</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={e => setFilters({...filters, exam_id: e.target.value})}>
              <option value="">Select Exam</option>
              {data.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={e => setFilters({...filters, class_id: e.target.value})}>
              <option value="">Select Class</option>
              {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Section</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={e => setFilters({...filters, section_id: e.target.value})}>
              <option value="">Select Section</option>
              {data.sections.filter(s => String(s.school_class) === String(filters.class_id)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Student</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={e => setFilters({...filters, student_id: e.target.value})}>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.roll_number} - {s.first_name}</option>)}
            </select>
          </div>
          <button onClick={handleFetchReport} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Search size={18} /> View Report
          </button>
        </div>

        {/* Report Card View */}
        {report && (
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200 print:shadow-none print:border-none" id="printable-report">
            <div className="text-center border-b pb-6 mb-6">
              <h2 className="text-3xl font-black text-gray-900 uppercase">Student Progress Report</h2>
              <p className="text-gray-500 font-medium">Academic Session 2025-2026</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div>
                <p><span className="font-bold text-gray-400 uppercase">Name:</span> {students.find(s => String(s.id) === String(filters.student_id))?.first_name} {students.find(s => String(s.id) === String(filters.student_id))?.last_name}</p>
                <p><span className="font-bold text-gray-400 uppercase">Roll:</span> {students.find(s => String(s.id) === String(filters.student_id))?.roll_number}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold text-gray-400 uppercase">Exam:</span> {data.exams.find(e => String(e.id) === String(filters.exam_id))?.name}</p>
                <p><span className="font-bold text-gray-400 uppercase">Class:</span> {data.classes.find(c => String(c.id) === String(filters.class_id))?.name}</p>
              </div>
            </div>
            {report.attendance && (
              <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Working Days</p>
                  <p className="text-xl font-black text-blue-900">{report.attendance.total_days}</p>
                </div>
                <div className="text-center border-x border-blue-200">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Present</p>
                  <p className="text-xl font-black text-green-600">{report.attendance.present_days}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Attendance %</p>
                  {report.attendance.total_days === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      No records.
                    </p>
                  ) : (
                    <p className="text-xl font-black text-blue-600">{report.attendance.percentage}%</p>
                  )}
                </div>
              </div>
            )}

            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-800">
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-center">Written</th>
                  <th className="p-3 text-center">Objective</th>
                  <th className="p-3 text-center">Practical</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Grade</th>
                </tr>
              </thead>
              <tbody>
                {report.marks.map((m, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3 font-semibold">{m.subject_name || "Subject " + m.subject}</td>
                    <td className="p-3 text-center">{m.written_marks}</td>
                    <td className="p-3 text-center">{m.objective_marks}</td>
                    <td className="p-3 text-center">{m.practical_marks}</td>
                    <td className="p-3 text-right font-bold">{m.total_marks}</td>
                    <td className="p-3 text-right font-bold text-blue-600">{m.grade}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50">
                  <td colSpan="4" className="p-3 font-bold text-right uppercase">Grand Total</td>
                  <td className="p-3 text-right font-black text-blue-700 text-xl">{report.summary.total_obtained}</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-between mt-12 pt-8 border-t border-dashed">
              <div className="text-center">
                <div className="w-32 border-b border-black mb-1"></div>
                <p className="text-xs font-bold uppercase">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-black mb-1"></div>
                <p className="text-xs font-bold uppercase">Principal</p>
              </div>
            </div>

            <button 
              onClick={() => window.print()} 
              className="mt-8 w-full py-3 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all print:hidden"
            >
              <Printer size={20} /> Print Report Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}