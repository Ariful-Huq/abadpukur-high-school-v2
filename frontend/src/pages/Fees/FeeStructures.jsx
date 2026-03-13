import { useEffect, useState } from "react";
import { getFeeStructures, createFeeStructure } from "../../api/feesApi";
import { Settings, Plus, DollarSign, Trash2 } from "lucide-react";

export default function FeeStructures() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", amount: "" });

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    try {
      const res = await getFeeStructures();
      setStructures(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching fee structures", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFeeStructure(formData);
      setFormData({ name: "", amount: "" });
      setShowForm(false);
      fetchStructures();
    } catch (err) {
      alert("Error creating fee structure");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Configuration</h1>
            <p className="text-sm text-gray-500">Define your school's fee types and amounts</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all"
        >
          {showForm ? "Cancel" : <><Plus size={20} /> Add New Fee Type</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fee Name</label>
              <input 
                type="text" 
                placeholder="e.g., Monthly Tuition"
                className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.name}
                required
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount (TK)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.amount}
                required
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">
              Save Fee Type
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structures.map((fee) => (
          <div key={fee.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                <DollarSign size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800">{fee.name}</h3>
            <p className="text-2xl font-black text-purple-600 mt-1">TK {fee.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}