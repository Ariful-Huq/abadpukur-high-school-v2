import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardStats } from "../../api/dashboardApi";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data || {}); // ensures stats is never undefined
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error)
    return <div className="p-6 text-red-500 font-semibold">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.username || "User"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-gray-500">Students</h2>
          <p className="text-2xl font-bold">{stats?.students || 0}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-gray-500">Teachers</h2>
          <p className="text-2xl font-bold">{stats?.teachers || 0}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-gray-500">Present Today</h2>
          <p className="text-2xl font-bold">{stats?.present_today || 0}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-gray-500">Total Fees</h2>
          <p className="text-2xl font-bold">{stats?.total_fees || 0}</p>
        </div>
      </div>
    </div>
  );
}