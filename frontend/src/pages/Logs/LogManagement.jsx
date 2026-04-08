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
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-start gap-4 hover:border-gray-700 transition"
            >
              {/* Icon Container with Dynamic Colors */}
              <div className={`p-3 rounded-xl ${
                log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' : 
                log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' : 
                log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-500' :
                log.action === 'LOGIN' ? 'bg-purple-500/10 text-purple-500' :
                log.action === 'LOGOUT' ? 'bg-orange-500/10 text-orange-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                <Activity size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black uppercase tracking-widest ${
                     log.action === 'DELETE' ? 'text-red-400' : 
                     log.action === 'CREATE' ? 'text-emerald-400' : 
                     'text-gray-500'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {format(new Date(log.timestamp), "PPp")}
                  </span>
                </div>
      
                <p className="text-gray-200 mt-1">{log.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {/* Performed By */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={14} />
                    <span>By: <b className="text-gray-400">{log.performed_by_name || "System/Unknown"}</b></span>
                  </div>

                  {/* IP Address Tag */}
                  {log.ip_address && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-800/50 border border-gray-700 rounded text-[11px] font-mono text-blue-400/80">
                      <Activity size={10} />
                      <span>{log.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-3xl">
            <ClipboardList size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">No activity logs found</p>
            <p className="text-gray-600 text-xs">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}