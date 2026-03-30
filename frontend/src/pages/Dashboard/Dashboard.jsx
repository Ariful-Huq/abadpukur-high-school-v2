// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardStats } from "../../api/dashboardApi";
import { Users, UserCheck, CalendarCheck, Banknote } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data || {});
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-gray-500 text-center font-medium">Loading School Analytics...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-lg m-6 border border-red-100">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hello, {user?.username || "Admin"}</h1>
          <p className="text-gray-500 mt-1">Here is what is happening in your school today.</p>
        </div>
        <div className="text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats?.students} icon={Users} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard label="Active Teachers" value={stats?.teachers} icon={UserCheck} color="text-green-600" bgColor="bg-green-100" />
        <StatCard label="Attendance" value={`${stats?.present_today || 0}%`} icon={CalendarCheck} color="text-purple-600" bgColor="bg-purple-100" />
        <StatCard label="Fees Collected" value={`৳${stats?.total_fees?.toLocaleString() || 0}`} icon={Banknote} color="text-amber-600" bgColor="bg-amber-100" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AttendanceChart 
          title="Top 5 Section Attendance (%)" 
          data={stats?.top_sections} 
          primaryColor="#4f46e5" 
          secondaryColor="#818cf8" 
        />
        <AttendanceChart 
          title="Lowest 5 Section Attendance (%)" 
          data={stats?.lowest_sections} 
          primaryColor="#e11d48" 
          secondaryColor="#fb7185" 
        />
      </div>

      {/* Recent Payments Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Banknote className="mr-2 text-gray-400" size={20} />
          Recent Payments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.recent_payments?.length > 0 ? (
            stats.recent_payments.map((pay) => (
              <div key={pay.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                <div>
                  <p className="font-bold text-gray-800 leading-tight">{pay.student}</p>
                  <p className="text-xs text-gray-400 mt-1">{pay.date}</p>
                </div>
                <span className="text-emerald-600 font-extrabold text-lg">৳{pay.amount.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl">
              No recent payments recorded today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl font-black text-gray-800 mt-2">{value || 0}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Reusable Chart Component
function AttendanceChart({ title, data, primaryColor, secondaryColor }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
      <div className="flex-1 w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 500}} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
            <Tooltip 
              cursor={{fill: '#f9fafb'}} 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]} barSize={32}>
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? primaryColor : secondaryColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}