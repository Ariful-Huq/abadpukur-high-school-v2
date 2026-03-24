// src/pages/Users/UserManagement.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { formatDistanceToNow } from "date-fns"; // Standard for relative time
import { 
  UserPlus, Edit, Trash2, Loader2, 
  ToggleLeft, ToggleRight, Search, X, 
  ChevronUp, ChevronDown, UserCircle, Clock 
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'first_name', direction: 'asc' });

  const [formData, setFormData] = useState({
    username: "", password: "", first_name: "", last_name: "", role: "staff", is_active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("users/users/");
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Handle Search & Sort
  useEffect(() => {
    let result = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
        const bValue = (b[sortConfig.key] || "").toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredUsers(result);
  }, [searchTerm, users, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ username: "", password: "", first_name: "", last_name: "", role: "staff", is_active: true });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    setFormData({ 
      username: user.username, 
      password: "", 
      first_name: user.first_name, 
      last_name: user.last_name, 
      role: user.role, 
      is_active: user.is_active 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await API.patch(`users/users/${selectedUserId}/`, payload);
      } else {
        await API.post("users/users/", formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert("Action failed. Check if username is unique or server is reachable.");
    }
  };

  const toggleStatus = async (user) => {
    try {
      await API.patch(`users/users/${user.id}/`, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await API.delete(`users/users/${id}/`);
        fetchUsers();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4 opacity-20"><ChevronUp size={16}/></div>;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} className="text-blue-500"/> : <ChevronDown size={16} className="text-blue-500"/>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Initializing User Directory...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCircle className="text-blue-500" /> <span className="text-blue-500">User Management</span>
          </h1>
          <p className="text-gray-500 text-sm">Create and manage access levels for Abadpukur High School.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Filter by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 w-full sm:w-72 transition-all"
            />
          </div>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-900/20 font-semibold"
          >
            <UserPlus size={20} /> Add Staff
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800/40 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-800">
              <tr>
                <th onClick={() => requestSort('first_name')} className="p-5 cursor-pointer hover:text-white transition group">
                  <div className="flex items-center gap-2">Full Name <SortIcon column="first_name"/></div>
                </th>
                <th onClick={() => requestSort('username')} className="p-5 cursor-pointer hover:text-white transition group">
                  <div className="flex items-center gap-2">Username <SortIcon column="username"/></div>
                </th>
                <th onClick={() => requestSort('role')} className="p-5 cursor-pointer hover:text-white transition group">
                  <div className="flex items-center gap-2">Role <SortIcon column="role"/></div>
                </th>
                <th onClick={() => requestSort('last_login')} className="p-5 cursor-pointer hover:text-white transition group">
                  <div className="flex items-center justify-center gap-2">Last Login <SortIcon column="last_login"/></div>
                </th>
                <th className="p-5 text-center">Login Access</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-gray-800/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="p-5">
                      <div className="font-semibold text-gray-100">{u.first_name} {u.last_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.phone || "No contact info"}</div>
                    </td>
                    <td className="p-5 font-mono text-sm text-blue-400/70">{u.username}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                        u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        u.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {u.last_login ? (
                        <div className="text-xs text-gray-400 flex flex-col items-center gap-1">
                          <span className="flex items-center gap-1"><Clock size={12}/> {formatDistanceToNow(new Date(u.last_login), { addSuffix: true })}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600 italic">Never logged in</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => toggleStatus(u)}
                          className={`transition-all transform hover:scale-110 ${u.is_active ? 'text-blue-500' : 'text-gray-700'}`}
                        >
                          {u.is_active ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}
                        </button>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => deleteUser(u.id)} 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-gray-600 italic">No staff found matching those criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? "Modify User Account" : "Register New Staff"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Security</label>
                <input 
                  required={!isEditing} 
                  className="w-full bg-gray-800/50 border border-gray-800 focus:border-blue-500 focus:outline-none p-3.5 rounded-xl text-white" 
                  placeholder="Username" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
                <input 
                  type="password" 
                  className="w-full bg-gray-800/50 border border-gray-800 focus:border-blue-500 focus:outline-none p-3.5 rounded-xl text-white" 
                  placeholder={isEditing ? "Leave blank to keep current password" : "Password"} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Profile Details</label>
                <div className="flex gap-3">
                  <input className="w-1/2 bg-gray-800/50 border border-gray-800 focus:border-blue-500 focus:outline-none p-3.5 rounded-xl text-white" placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                  <input className="w-1/2 bg-gray-800/50 border border-gray-800 focus:border-blue-500 focus:outline-none p-3.5 rounded-xl text-white" placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Permission</label>
                <select 
                  className="w-full bg-gray-800/50 border border-gray-800 focus:border-blue-500 focus:outline-none p-3.5 rounded-xl text-white cursor-pointer appearance-none" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="staff">School Staff</option>
                  <option value="teacher">Faculty Member (Teacher)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white px-4 font-medium transition">Discard</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl text-white font-bold transition-all shadow-xl shadow-blue-900/40">
                  {isEditing ? "Apply Changes" : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}