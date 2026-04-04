// frontend/src/pages/Results/MarkEntry.jsx
import { useState, useEffect } from "react";
import { getClasses, getSections, getSubjects } from "../../api/academicsApi";
import { getStudents } from "../../api/studentsApi";
import { getExams, submitBulkMarks, getMarks } from "../../api/resultsApi";
import { Save, Search, ClipboardList } from "lucide-react";

export default function MarkEntry() {
  const [data, setData] = useState({ classes: [], sections: [], subjects: [], exams: [] });
  const [filters, setFilters] = useState({ class_id: "", section_id: "", subject_id: "", exam_id: "" });
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  // Find the configuration for the currently selected subject
  const currentSubjectConfig = data.subjects.find(s => String(s.id) === String(filters.subject_id)) || {};

  useEffect(() => {
    Promise.all([getClasses(), getSections(), getSubjects(), getExams()]).then(
      ([cls, sec, sub, exm]) => {
        setData({
          classes: cls.data.results || cls.data || [],
          sections: sec.data.results || sec.data || [],
          subjects: sub.data.results || sub.data || [],
          exams: exm.data.results || exm.data || [],
        });
      }
    );
  }, []);

  const filteredSections = data.sections.filter((sec) => 
    !filters.class_id || String(sec.school_class) === String(filters.class_id)
  );

  const filteredSubjects = data.subjects.filter((sub) => 
    !filters.class_id || String(sub.school_class) === String(filters.class_id)
  );

  const handleFetchStudents = async () => {
    const { class_id, section_id, subject_id, exam_id } = filters;

    if (!class_id || !section_id || !subject_id || !exam_id) {
      return alert("Please select all filters.");
    }

    try {
      const studentRes = await getStudents(class_id, section_id);
      const studentList = studentRes.data.results || studentRes.data || [];
      setStudents(studentList);

      const marksRes = await getMarks(exam_id, subject_id, class_id, section_id);
      const existingMarksList = marksRes.data.results || marksRes.data || [];

      const mergedMarks = {};
      studentList.forEach((s) => {
        mergedMarks[s.id] = { written: 0, objective: 0, practical: 0 };
      });

      existingMarksList.forEach((m) => {
        const student = studentList.find(s => s.enrollment_id === m.enrollment);
        if (student) {
          mergedMarks[student.id] = {
            written: m.written_marks || 0,
            objective: m.objective_marks || 0,
            practical: m.practical_marks || 0,
          };
        }
      });

      setMarks(mergedMarks);
      if (studentList.length === 0) alert("No students found.");
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    const numValue = value === "" ? "" : parseFloat(value);
    
    // Validation: Check against the dynamic limits from Subject Model
    const limitKey = `max_${field}`;
    const maxAllowed = currentSubjectConfig[limitKey] || 0;

    if (numValue > maxAllowed) {
        alert(`Maximum allowed marks for ${field} in this subject is ${maxAllowed}`);
        return;
    }

    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: numValue },
    }));
  };

  const handleSubmit = async () => {
    const marksArray = Object.keys(marks).map((studentId) => {
      const student = students.find(s => String(s.id) === String(studentId));
      return {
        enrollment_id: student?.enrollment_id,
        // Ensure we send 0 if the component is not applicable
        written_marks: currentSubjectConfig.has_written ? (marks[studentId].written || 0) : 0,
        objective_marks: currentSubjectConfig.has_objective ? (marks[studentId].objective || 0) : 0,
        practical_marks: currentSubjectConfig.has_practical ? (marks[studentId].practical || 0) : 0,
      };
    });

    if (marksArray.some(m => !m.enrollment_id)) {
      return alert("Some students are missing enrollment records.");
    }

    const payload = {
      exam_id: filters.exam_id,
      subject_id: filters.subject_id,
      marks_list: marksArray,
    };

    try {
      await submitBulkMarks(payload);
      alert("Marks saved successfully!");
    } catch (err) {
      alert("Error saving marks.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Mark Entry Panel
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-gray-400 uppercase">Exam</label>
            <select 
              className="w-full border rounded-lg p-2 mt-1" 
              value={filters.exam_id}
              onChange={e => { setFilters({...filters, exam_id: e.target.value}); setStudents([]); setMarks({}); }}
            >
              <option value="">Select Exam</option>
              {data.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
            <select 
              className="w-full border rounded-lg p-2 mt-1"
              value={filters.class_id}
              onChange={e => {
                setFilters({...filters, class_id: e.target.value, section_id: "", subject_id: ""});
                setStudents([]); setMarks({});
              }}
            >
              <option value="">Select Class</option>
              {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-gray-400 uppercase">Section</label>
            <select 
              className="w-full border rounded-lg p-2 mt-1"
              value={filters.section_id}
              onChange={e => { setFilters({...filters, section_id: e.target.value}); setStudents([]); setMarks({}); }}
              disabled={!filters.class_id}
            >
              <option value="">Select Section</option>
              {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
            <select
              className="w-full border rounded-lg p-2 mt-1"
              value={filters.subject_id}
              onChange={e => { setFilters({...filters, subject_id: e.target.value}); setStudents([]); setMarks({}); }}
              disabled={!filters.class_id}
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <button onClick={handleFetchStudents} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 h-11">
            <Search size={18} /> Load Students
          </button>
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-gray-500 text-sm font-bold uppercase">Roll</th>
                  <th className="p-4 text-gray-500 text-sm font-bold uppercase">Name</th>
                  <th className={`p-4 text-gray-500 text-sm font-bold uppercase ${!currentSubjectConfig.has_written && 'opacity-30'}`}>Written</th>
                  <th className={`p-4 text-gray-500 text-sm font-bold uppercase ${!currentSubjectConfig.has_objective && 'opacity-30'}`}>Objective</th>
                  <th className={`p-4 text-gray-500 text-sm font-bold uppercase ${!currentSubjectConfig.has_practical && 'opacity-30'}`}>Practical</th>
                  <th className="p-4 text-gray-500 text-sm font-bold uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{s.roll_number}</td>
                    <td className="p-4 font-semibold">{s.first_name} {s.last_name}</td>
                    
                    {/* WRITTEN COLUMN */}
                    <td className="p-4">
                      <input type="number" 
                        disabled={!currentSubjectConfig.has_written}
                        className={`w-24 border rounded-lg p-2 outline-none ${!currentSubjectConfig.has_written ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'focus:ring-2 focus:ring-blue-500'}`}
                        value={marks[s.id]?.written ?? ""}
                        onChange={e => handleMarkChange(s.id, 'written', e.target.value)} 
                      />
                    </td>

                    {/* OBJECTIVE COLUMN */}
                    <td className="p-4">
                      <input type="number" 
                        disabled={!currentSubjectConfig.has_objective}
                        className={`w-24 border rounded-lg p-2 outline-none ${!currentSubjectConfig.has_objective ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'focus:ring-2 focus:ring-blue-500'}`}
                        value={marks[s.id]?.objective ?? ""}
                        onChange={e => handleMarkChange(s.id, 'objective', e.target.value)} 
                      />
                    </td>

                    {/* PRACTICAL COLUMN */}
                    <td className="p-4">
                      <input type="number" 
                        disabled={!currentSubjectConfig.has_practical}
                        className={`w-24 border rounded-lg p-2 outline-none ${!currentSubjectConfig.has_practical ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'focus:ring-2 focus:ring-blue-500'}`}
                        value={marks[s.id]?.practical ?? ""}
                        onChange={e => handleMarkChange(s.id, 'practical', e.target.value)} 
                      />
                    </td>

                    <td className="p-4 font-bold text-lg text-blue-600">
                      {(currentSubjectConfig.has_written ? (marks[s.id]?.written || 0) : 0) + 
                       (currentSubjectConfig.has_objective ? (marks[s.id]?.objective || 0) : 0) + 
                       (currentSubjectConfig.has_practical ? (marks[s.id]?.practical || 0) : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={handleSubmit} className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg transform active:scale-95 transition-all">
                <Save size={20} /> Save All Marks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}