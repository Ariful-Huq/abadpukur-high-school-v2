// src/components/layout/Topbar.jsx

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 h-14">

      <h1 className="font-semibold text-lg">
        Welcome, {user?.username || "Admin"}
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>

    </header>
  );
}