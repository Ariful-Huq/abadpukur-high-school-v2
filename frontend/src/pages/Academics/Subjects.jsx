// frontend/src/pages/Academics/Subjects.jsx
import { useEffect, useState } from "react";
// Ensure updateSubject is imported from your API file
import { getSubjects, createSubject, updateSubject, deleteSubject, getClasses } from "../../api/academicsApi";
import { BookOpen, Plus, Trash2, Settings2, Edit3, X } from "lucide-react";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editId, setEditId] = useState(null); // Track if we are editing
  const [formData, setFormData] = useState({ 
    name: "", 
    code: "", 
    school_class: "",
    has_written: true,
    has_objective: true,
    has_practical: false,
    max_written: 70,
    max_objective: 30,
    max_practical: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, clsRes] = await Promise.all([getSubjects(), getClasses()]);
      setSubjects(subRes.data.results || subRes.data || []);
      setClasses(clsRes.data.results || clsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Set form for editing
  const handleEditClick = (sub) => {
    setEditId(sub.id);
    setFormData({
      name: sub.name,
      code: sub.code,
      school_class: sub.school_class,
      has_written: sub.has_written,
      has_objective: sub.has_objective,
      has_practical: sub.has_practical,
      max_written: sub.max_written,
      max_objective: sub.max_objective,
      max_practical: sub.max_practical
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ 
      name: "", code: "", school_class: "",
      has_written: true, has_objective: true, has_practical: false,
      max_written: 70, max_objective: 30, max_practical: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.school_class) return alert("All fields required");
    
    try {
      if (editId) {
        await updateSubject(editId, formData);
        alert("Subject updated successfully");
      } else {
        await createSubject(formData);
      }
      resetForm();
      loadData();
    } catch (err) {
      alert(editId ? "Error updating subject" : "Error creating subject");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Academics: Subjects
          </h1>
          <p className="text-sm text-gray-500">Configure subjects and mark distributions</p>
        </div>
        {editId && (
          <button onClick={resetForm} className="flex items-center gap-1 text-gray-500 hover:text-red-500 font-medium bg-white px-4 py-2 rounded-lg border shadow-sm transition-all">
            <X size={16} /> Cancel Editing
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Physics" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code</label>
              <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. PHY101" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Class</label>
              <select value={formData.school_class} onChange={e => setFormData({...formData, school_class: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Settings2 size={16} /> Mark Distribution Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-blue-600" checked={formData.has_written} onChange={e => setFormData({...formData, has_written: e.target.checked})} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Written Max</label>
                  <input type="number" disabled={!formData.has_written} value={formData.max_written} onChange={e => setFormData({...formData, max_written: e.target.value})} className="w-full border rounded p-1 mt-1 disabled:bg-gray-200" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-blue-600" checked={formData.has_objective} onChange={e => setFormData({...formData, has_objective: e.target.checked})} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Objective Max</label>
                  <input type="number" disabled={!formData.has_objective} value={formData.max_objective} onChange={e => setFormData({...formData, max_objective: e.target.value})} className="w-full border rounded p-1 mt-1 disabled:bg-gray-200" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-blue-600" checked={formData.has_practical} onChange={e => setFormData({...formData, has_practical: e.target.checked})} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Practical Max</label>
                  <input type="number" disabled={!formData.has_practical} value={formData.max_practical} onChange={e => setFormData({...formData, max_practical: e.target.value})} className="w-full border rounded p-1 mt-1 disabled:bg-gray-200" />
                </div>
              </div>
            </div>
          </div>

          <button className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
            {editId ? <><Edit3 size={18} /> Update Subject</> : <><Plus size={18} /> Create Subject</>}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Subject (Code)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Distribution (W/O/P)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{sub.name}</div>
                  <div className="text-xs text-blue-600 font-mono">{sub.code}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {sub.has_written && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">W: {sub.max_written}</span>}
                    {sub.has_objective && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">O: {sub.max_objective}</span>}
                    {sub.has_practical && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">P: {sub.max_practical}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(sub)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Subject">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => confirm("Delete this subject?") && deleteSubject(sub.id).then(loadData)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Subject">
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