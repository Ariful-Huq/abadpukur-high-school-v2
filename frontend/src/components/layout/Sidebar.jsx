// src/components/layout/Sidebar.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { menuItems } from "../../config/menuConfig";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  useEffect(() => {
    if (collapsed) {
      setOpenMenu("");
      return;
    }

    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );
    if (activeParent) setOpenMenu(activeParent.name);
  }, [location.pathname, collapsed]);

  const toggleMenu = (name) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenMenu(name);
    } else {
      setOpenMenu((prev) => (prev === name ? "" : name));
    }
  };

  const closeAllMenus = () => {
    setOpenMenu("");
  };

  const isActive = (path) => location.pathname === path;
  
  const isParentActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    return item.children?.some((child) => isActive(child.path));
  };

  return (
    <aside
      className={`bg-gray-900 text-gray-300 h-screen flex flex-col transition-all duration-300 shadow-xl border-r border-gray-800 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-800 mb-2">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
             <img src="/abadpukur-high-school-logo.svg" alt="Logo" className="w-10 h-10 min-w-[40px]" />
             <span className="font-bold text-white truncate text-sm">Abadpukur School</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors mx-auto text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3">
        {filteredMenuItems.map((item) => {
          const hasChildren = !!item.children;
          const active = isParentActive(item);
          const isOpen = openMenu === item.name;

          return (
            <div key={item.name} className="mb-1">
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                      active 
                        ? "bg-gray-800 text-blue-400 font-semibold" 
                        : "hover:bg-gray-800 hover:text-white text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={active ? "text-blue-400" : "text-gray-400"} />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight 
                        size={16} 
                        className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} 
                      />
                    )}
                  </button>

                  {/* FIX: STANDALONE DIV FOR ANIMATION */}
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen && !collapsed ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden ml-5 border-l-2 border-gray-700 space-y-1 py-1">
                      {item.children.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block ml-4 px-3 py-2 text-sm rounded-md transition-all ${
                              childActive
                                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={closeAllMenus}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.path) 
                      ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40" 
                      : "hover:bg-gray-800 hover:text-white text-gray-400"
                  }`}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}