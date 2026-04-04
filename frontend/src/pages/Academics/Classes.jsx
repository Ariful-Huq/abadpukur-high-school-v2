// src/pages/Academics/Classes.jsx
import { useEffect, useState } from "react";
import { getClasses, createClass, updateClass, deleteClass } from "../../api/academicsApi";
import { Plus, Trash2, Layers, Edit3, X } from "lucide-react";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await getClasses();
      const data = res.data.results || res.data;
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadClasses(); }, []);

  const handleEdit = (cls) => {
    setEditId(cls.id);
    setName(cls.name);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editId) {
        await updateClass(editId, { name });
      } else {
        await createClass({ name });
      }
      resetForm();
      loadClasses();
    } catch (err) { alert("Error saving class"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-blue-600" /> Academics: Classes
          </h1>
          <p className="text-sm text-gray-500">Manage school grades and classes</p>
        </div>
        {editId && (
          <button onClick={resetForm} className="text-gray-500 flex items-center gap-1 bg-white px-3 py-1 rounded border shadow-sm transition-all hover:text-red-500">
            <X size={14} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Class 10"
            />
          </div>
          <button className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-white transition-colors ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {editId ? <><Edit3 size={18} /> Update</> : <><Plus size={18} /> Add Class</>}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Class Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!loading && classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 text-sm text-gray-500"># {cls.id}</td>
                <td className="px-6 py-4 font-medium">{cls.name}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(cls)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => window.confirm("Delete?") && deleteClass(cls.id).then(loadClasses)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}