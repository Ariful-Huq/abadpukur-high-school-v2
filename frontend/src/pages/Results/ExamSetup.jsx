// frontend/src/pages/Results/ExamSetup.jsx
import { useState, useEffect } from "react";
import { getExams, createExam, deleteExam } from "../../api/resultsApi";
// FIX: Changed from getAcademicSessions to getSessions
import { getSessions } from "../../api/academicsApi"; 
import { Plus, Trash2, CalendarCheck, AlertCircle } from "lucide-react";

export default function ExamSetup() {
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    name: "1st Term",
    session: "",
    start_date: "", 
    end_date: "",
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // FIX: Changed from getAcademicSessions() to getSessions()
      const [exmRes, sesRes] = await Promise.all([getExams(), getSessions()]);
      
      setExams(exmRes.data.results || exmRes.data);
      const sessionList = sesRes.data.results || sesRes.data;
      setSessions(sessionList);
      
      // Auto-select active session if available
      const active = sessionList.find(s => s.is_active);
      if (active) setFormData(prev => ({ ...prev, session: active.id }));
    } catch (err) {
      console.error("Failed to fetch setup data:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.session) return alert("Please select an Academic Session first.");
    
    setLoading(true);
    try {
      await createExam(formData);
      fetchData(); // Refresh list
      // Reset form (keeping session selected for convenience)
      setFormData(prev => ({ 
        ...prev, 
        name: "1st Term", // Reset to default term
        start_date: "", 
        end_date: "" 
      }));
      alert("Exam term created successfully!");
    } catch (err) {
      alert("Error: Likely this term already exists for this session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will delete all marks associated with this exam!")) {
      try {
        await deleteExam(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete exam.");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarCheck className="text-blue-600" /> Exam Configuration
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
            <h2 className="font-bold mb-4 text-gray-700">Add New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Term Name</label>
                <select 
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                >
                  <option value="1st Term">1st Term Exam</option>
                  <option value="2nd Term">2nd Term Exam</option>
                  <option value="Final">Final Exam</option>
                </select>
              </div>

              {/* Start Date Input */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Start Date</label>
                <input 
                  type="date"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>

              {/* End Date Input */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">End Date</label>
                <input 
                  type="date"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>

              {/* Session Select */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Academic Session</label>
                <select 
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.session}
                  onChange={e => setFormData({...formData, session: e.target.value})}
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.is_active ? "(Active)" : ""}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Plus size={18} /> {loading ? "Saving..." : "Create Exam"}
              </button>
            </form>
          </div>

          {/* List of Exams */}
          <div className="md:col-span-2 space-y-4">
            {exams.length === 0 ? (
              <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
                <AlertCircle className="mx-auto text-blue-400 mb-2" />
                <p className="text-blue-700 font-medium">No exams configured yet.</p>
                <p className="text-blue-500 text-sm">Add the 1st, 2nd, and Final terms to start entry.</p>
              </div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{exam.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                    {exam.start_date} to {exam.end_date}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">ID: {exam.id}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}