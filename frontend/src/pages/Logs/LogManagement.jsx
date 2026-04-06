// src/pages/Logs/LogManagement.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { ClipboardList, Clock, User, Activity, Search } from "lucide-react";
import { format } from "date-fns"; // Install via: npm install date-fns

export default function LogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("users/audit-logs/");
        setLogs(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performed_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-gray-400">Loading system logs...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-blue-500" /><span className="text-blue-500"> Audit Logs</span>
          </h1>
          <p className="text-gray-500 text-sm">System-wide activity and security tracking.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search activities..."
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-start gap-4 hover:border-gray-700 transition">
            <div className={`p-3 rounded-xl ${
              log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' : 
              log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              <Activity size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{log.action}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {format(new Date(log.timestamp), "PPp")}
                </span>
              </div>
              <p className="text-gray-200 mt-1">{log.description}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <User size={14} />
                <span>By: <b className="text-gray-400">{log.performed_by_name || "System/Unknown"}</b></span>
              </div>
              {log.ip_address && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-[11px] font-mono text-blue-400">
                  <Activity size={12} />
                  <span>IP: {log.ip_address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}