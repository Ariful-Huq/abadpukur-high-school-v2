// src/pages/Academics/AcademicSessions.jsx
import { useEffect, useState } from "react";
import { getSessions, createSession, deleteSession } from "../../api/academicsApi";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

export default function AcademicSessions() {
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({ name: "", start_date: "", end_date: "" });
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      
      // FIX: Extract results if paginated, otherwise use raw data
      const data = res.data.results || res.data;
      
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setSessions([]); // Safety fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSession(formData);
      setFormData({ name: "", start_date: "", end_date: "" });
      loadSessions();
    } catch (err) {
      alert("Error creating session");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="text-blue-600" /> Academic Sessions
        </h1>
        <p className="text-sm text-gray-500">Define school years and terms</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
            <input
              placeholder="e.g. 2025-2026"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Plus size={18} /> Add Session
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Session Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map((ses) => (
              <tr key={ses.id} className={`hover:bg-blue-50/30 ${ses.is_active ? 'bg-green-50/50' : ''}`}>
                <td className="px-6 py-4 font-medium text-gray-800">
                  <div className="flex items-center gap-3">
                    {ses.name}
                    {ses.is_active && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Current
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ses.start_date} to {ses.end_date}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    {!ses.is_active && (
                      <button
                        onClick={async () => {
                          try {
                            await setActiveSession(ses.id);
                            loadSessions();
                          } catch (err) {
                            alert("Failed to update session");
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(ses.id).then(loadSessions)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}