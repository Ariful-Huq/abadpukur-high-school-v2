// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardStats } from "../../api/dashboardApi";
import { Users, UserCheck, CalendarCheck, Banknote } from "lucide-react";

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

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading statistics...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-lg m-6">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Hello, {user?.username || "Admin"}
        </h1>
        <p className="text-gray-500">Here is what is happening in your school today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={stats?.students} 
          icon={Users} 
          color="text-blue-600" 
          bgColor="bg-blue-100" 
        />
        <StatCard 
          label="Active Teachers" 
          value={stats?.teachers} 
          icon={UserCheck} 
          color="text-green-600" 
          bgColor="bg-green-100" 
        />
        <StatCard 
          label="Attendance" 
          value={`${stats?.present_today || 0}%`} 
          icon={CalendarCheck} 
          color="text-purple-600" 
          bgColor="bg-purple-100" 
        />
        <StatCard 
          label="Fees Collected" 
          value={`৳${stats?.total_fees?.toLocaleString() || 0}`} 
          icon={Banknote} 
          color="text-amber-600" 
          bgColor="bg-amber-100" 
        />
      </div>
      
      {/* Placeholder for future Charts/Recent Activity */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          Attendance Graph (Coming Soon)
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          Recent Payments (Coming Soon)
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{value || 0}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}