import { Bell, User } from "lucide-react";

export default function Navbar() {

  return (

    <div className="h-16 bg-white shadow flex items-center justify-between px-6">

      <h2 className="font-semibold text-lg">
        School Management
      </h2>

      <div className="flex items-center gap-4">

        <Bell size={20} />

        <div className="flex items-center gap-2">
          <User size={20} />
          Admin
        </div>

      </div>

    </div>

  );
}