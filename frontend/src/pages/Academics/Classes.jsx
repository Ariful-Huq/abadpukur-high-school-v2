// src/pages/Academics/Classes.jsx
import { useEffect, useState } from "react";
import { getClasses, createClass, deleteClass } from "../../api/academicsApi";
import { Plus, Trash2, Layers } from "lucide-react";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to load classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createClass({ name });
      setName("");
      loadClasses();
    } catch (err) {
      alert("Error creating class");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This may affect associated sections and students.")) {
      await deleteClass(id);
      loadClasses();
    }
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
      </div>

      {/* Quick Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Class Name</label>
            <input
              type="text"
              placeholder="e.g. Class 10 or Grade A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors">
            <Plus size={18} /> Add Class
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Class Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Loading classes...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">No classes found.</td></tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500"># {cls.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{cls.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} /> <span className="text-xs font-bold uppercase">Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}