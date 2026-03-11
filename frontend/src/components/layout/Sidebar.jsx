// src/components/layout/Sidebar.jsx

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { menuItems } from "../../config/menuConfig";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    const parent = menuItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );
    setOpenMenu(parent ? parent.name : "");
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? "" : name));
  };

  return (
    <aside
      className={`bg-gray-800 text-white h-screen flex flex-col transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo + Collapse Button */}
      <div className="relative flex items-center justify-center h-20 border-b border-gray-700">
        <img
          src="/AbadpukurSchoolLogo.svg"
          alt="School Logo"
          className={`${collapsed ? "w-8" : "w-12"} transition-all`}
        />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-3 p-1 rounded hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-2 flex-1 overflow-y-auto">

        {menuItems.map((item) => {
          const hasChildren = item.children;
          const isParentActive =
            item.path && location.pathname === item.path;
          const isOpen = openMenu === item.name;

          return (
            <div key={item.name}>

              {/* Parent without children */}
              {!hasChildren && (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-700 ${
                    isParentActive ? "bg-gray-700 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}

              {/* Parent with children */}
              {hasChildren && (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>

                  {!collapsed &&
                    (isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>
              )}

              {/* Children */}
              {hasChildren && isOpen && !collapsed && (
                <div className="ml-6">
                  {item.children.map((child) => {
                    const active = location.pathname === child.path;

                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 ${
                          active
                            ? "bg-gray-700 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </nav>
    </aside>
  );
}