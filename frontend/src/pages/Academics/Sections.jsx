// src/pages/Academics/Sections.jsx
import { useEffect, useState } from "react";
import { getSections, createSection, updateSection, deleteSection, getClasses } from "../../api/academicsApi";
import { Plus, Trash2, List, Edit3, X } from "lucide-react";

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, clsRes] = await Promise.all([getSections(), getClasses()]);
      setSections(secRes.data.results || secRes.data || []);
      setClasses(clsRes.data.results || clsRes.data || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (sec) => {
    setEditId(sec.id);
    setName(sec.name);
    setClassId(sec.school_class);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setClassId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !classId) return alert("Fields required");

    try {
      const payload = { name, school_class: classId };
      if (editId) {
        await updateSection(editId, payload);
      } else {
        await createSection(payload);
      }
      resetForm();
      loadData();
    } catch (err) { alert("Error saving section"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <List className="text-blue-600" /> Academics: Sections
          </h1>
          <p className="text-sm text-gray-500">Assign sections to classes</p>
        </div>
        {editId && (
          <button onClick={resetForm} className="text-gray-500 flex items-center gap-1 bg-white px-3 py-1 rounded border shadow-sm">
            <X size={14} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Class</label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Class</option>
              {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
            </select>
          </div>
          <button className={`px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-white ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {editId ? <><Edit3 size={18} /> Update Section</> : <><Plus size={18} /> Add Section</>}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Section Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sections.map((sec) => (
              <tr key={sec.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{sec.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{sec.school_class_name}</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(sec)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => window.confirm("Delete?") && deleteSection(sec.id).then(loadData)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}