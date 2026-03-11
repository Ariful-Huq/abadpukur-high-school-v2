// src/components/layout/Sidebar.jsx

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { menuConfig } from "../../config/menuConfig";

export default function Sidebar() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Auto-open submenu if route belongs to it
  useEffect(() => {
    const newOpenMenus = {};

    menuConfig.forEach((menu) => {
      if (menu.children) {
        const match = menu.children.some((child) =>
          location.pathname.startsWith(child.path)
        );

        if (match) newOpenMenus[menu.title] = true;
      }
    });

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div
      className={`bg-gray-800 text-white h-screen flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } p-4 border-b border-gray-700`}
      >
        {!collapsed && (
          <span className="text-lg font-bold">School Admin</span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuConfig.map((menu) => {
          const Icon = menu.icon;

          // ---------- SINGLE MENU ----------
          if (!menu.children) {
            const active =
              menu.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(menu.path);

            return (
              <Link
                key={menu.title}
                to={menu.path}
                className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${
                  active ? "bg-gray-700 border-l-4 border-blue-500" : ""
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span>{menu.title}</span>}
              </Link>
            );
          }

          // ---------- MENU WITH SUBMENU ----------
          return (
            <div key={menu.title}>
              <button
                onClick={() => toggleMenu(menu.title)}
                className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {!collapsed && <span>{menu.title}</span>}
                </div>

                {!collapsed &&
                  (openMenus[menu.title] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </button>

              {/* Submenu */}
              {openMenus[menu.title] && !collapsed && (
                <div className="ml-4 space-y-1 text-sm">
                  {menu.children.map((child) => {
                    const ChildIcon = child.icon;
                    const active = location.pathname === child.path;

                    return (
                      <Link
                        key={child.title}
                        to={child.path}
                        className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
                          active ? "bg-gray-700" : ""
                        }`}
                      >
                        <ChildIcon size={16} />
                        <span>{child.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
