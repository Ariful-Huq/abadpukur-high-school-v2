import { useEffect, useState } from "react";
import { 
  getFeeStructures, 
  createFeeStructure, 
  deleteFeeStructure, 
  updateFeeStructure 
} from "../../api/feesApi";
import { getClasses } from "../../api/academicsApi";
import { Edit2, Plus, Layers, Trash2, Search, Filter } from "lucide-react";

export default function FeeStructures() {
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  const [formData, setFormData] = useState({ 
    name: "", 
    school_class: null, 
    amount: "", 
    frequency: "monthly" 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [fRes, cRes] = await Promise.all([getFeeStructures(), getClasses()]);
    setStructures(fRes.data.results || fRes.data);
    setClasses(cRes.data.results || cRes.data);
  };

  const handleEdit = (fee) => {
    setFormData({
      name: fee.name,
      school_class: fee.school_class,
      amount: fee.amount,
      frequency: fee.frequency || "monthly"
    });
    setEditingId(fee.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFeeStructure(editingId, formData);
      } else {
        await createFeeStructure(formData);
      }
      
      setFormData({ name: "", school_class: null, amount: "", frequency: "monthly" });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert("Error saving fee rule");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this fee rule?")) {
      await deleteFeeStructure(id);
      fetchData();
    }
  };

  // Logic: Filter structures based on Search and Dropdown
  const filteredStructures = structures.filter(fee => {
    const matchesSearch = fee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" 
      ? true 
      : filterClass === "global" 
        ? fee.school_class === null 
        : Number(fee.school_class) === Number(filterClass);
    
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Architecture</h1>
            <p className="text-sm text-gray-500">Map fees to specific classes and sessions</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ name: "", school_class: null, amount: "", frequency: "monthly" });
            }
          }} 
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={20} /> New Fee Rule</>}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-top-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Fee Name</label>
            <input 
              type="text" 
              placeholder="e.g. Tuition" 
              className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div className="relative">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Class</label>
            <select 
              className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer" 
              value={formData.school_class || ""} 
              onChange={e => setFormData({
                ...formData, 
                school_class: e.target.value === "" ? null : Number(e.target.value) 
              })}
            >
              <option value="">All Classes (Global)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-4 bottom-4 pointer-events-none text-gray-400">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Amount (TK)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 font-bold" 
              required 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
            />
          </div>

          <button type="submit" className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
            {editingId ? "Update Rule" : "Apply Rule"}
          </button>
        </form>
      )}

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search fee names..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer text-sm font-medium text-gray-600"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="all">Show All Rules</option>
            <option value="global">Global Rules Only</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} Rules</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStructures.length > 0 ? (
          filteredStructures.map((fee) => (
            <div key={fee.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative hover:-translate-y-1">
              
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEdit(fee)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(fee.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  fee.school_class 
                    ? "bg-purple-50 text-purple-600" 
                    : "bg-blue-50 text-blue-600"
                }`}>
                  {classes.find(c => Number(c.id) === Number(fee.school_class))?.name || "Global / All Classes"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{fee.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-gray-400">TK</span>
                <p className="text-2xl font-black text-gray-900">{Number(fee.amount).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
            No fee rules found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}