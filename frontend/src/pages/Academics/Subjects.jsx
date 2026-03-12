import { useEffect, useState } from "react";
import { getSubjects, createSubject, deleteSubject } from "../../api/academicsApi";
import { BookOpen, Plus, Trash2 } from "lucide-react";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      const data = res.data.results || res.data;
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return alert("Fields required");
    try {
      await createSubject(formData);
      setFormData({ name: "", code: "" });
      loadSubjects();
    } catch (err) {
      alert("Error creating subject");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Academics: Subjects
        </h1>
        <p className="text-sm text-gray-500">Manage curriculum subjects and codes</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input
              placeholder="e.g. Mathematics"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input
              placeholder="e.g. MATH101"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} /> Add Subject
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Code</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Subject Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-mono text-sm text-blue-600">{sub.code}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{sub.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteSubject(sub.id).then(loadSubjects)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}