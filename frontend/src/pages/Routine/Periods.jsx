import { useState, useEffect } from "react";
import { getPeriods, createPeriod, deletePeriod } from "../../api/routineApi";
import { Clock, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Periods() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);
  const [formData, setFormData] = useState({ name: "", start_time: "", end_time: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPeriods(); }, []);

  const loadPeriods = () => {
    getPeriods().then(res => setPeriods(res.data.results || res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPeriod(formData);
      setFormData({ name: "", start_time: "", end_time: "" });
      loadPeriods();
    } catch (err) {
      alert("Error creating period. Ensure times are valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this period? This may affect existing routines.")) {
      await deletePeriod(id);
      loadPeriods();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/routine")} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock /> Period Management</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Period Name</label>
          <input 
            required 
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="e.g. 1st Period" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Time</label>
          <input 
            required type="time" 
            className="w-full border rounded-lg p-2" 
            value={formData.start_time} 
            onChange={e => setFormData({...formData, start_time: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Time</label>
          <input 
            required type="time" 
            className="w-full border rounded-lg p-2" 
            value={formData.end_time} 
            onChange={e => setFormData({...formData, end_time: e.target.value})} 
          />
        </div>
        <button 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Plus size={18}/> {loading ? "Adding..." : "Add Period"}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-bold text-gray-500 text-sm">Existing Time Slots</div>
        {periods.length === 0 && <div className="p-8 text-center text-gray-400 italic">No periods defined yet.</div>}
        {periods.map(p => (
          <div key={p.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {p.name[0]}
              </div>
              <div>
                <span className="font-bold text-gray-800 block">{p.name}</span>
                <span className="text-sm text-gray-500">{p.start_time.slice(0,5)} — {p.end_time.slice(0,5)}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors">
              <Trash2 size={18}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}