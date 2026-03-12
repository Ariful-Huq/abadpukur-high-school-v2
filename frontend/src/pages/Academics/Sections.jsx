// src/pages/Academics/Sections.jsx
import { useEffect, useState } from "react";
import { getSections, createSection, deleteSection, getClasses } from "../../api/academicsApi";
import { Plus, Trash2, List } from "lucide-react";

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, clsRes] = await Promise.all([getSections(), getClasses()]);
      
      const sectionsData = secRes.data.results || secRes.data;
      const classesData = clsRes.data.results || clsRes.data;

      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      console.error("Failed to load sections data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !classId) return alert("Please provide both name and class");

    try {
      // Sending 'school_class' to match your Django model ForeignKey field
      await createSection({ name, school_class: classId });
      setName("");
      setClassId("");
      loadData();
    } catch (err) {
      alert("Error creating section");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this section?")) {
      await deleteSection(id);
      loadData();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <List className="text-blue-600" /> Academics: Sections
        </h1>
        <p className="text-sm text-gray-500">Assign sections to classes</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
            <input
              placeholder="e.g. Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} /> Add Section
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Section Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : (
              sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{sec.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                      {sec.school_class_name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(sec.id)}
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