import { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboardApi";

export default function Dashboard() {

  const [stats, setStats] = useState({});

  useEffect(() => {

    getDashboardStats().then(res => {
      setStats(res.data);
    });

  }, []);

  return (

    <div className="grid grid-cols-4 gap-6">

      <div className="bg-white p-6 shadow rounded">
        Students: {stats.students}
      </div>

      <div className="bg-white p-6 shadow rounded">
        Teachers: {stats.teachers}
      </div>

      <div className="bg-white p-6 shadow rounded">
        Present Today: {stats.present_today}
      </div>

      <div className="bg-white p-6 shadow rounded">
        Total Fees: {stats.total_fee_amount}
      </div>

    </div>
  );
}