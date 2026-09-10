import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/books", label: "Catalog", roles: ["superadmin", "librarian", "student"] },
  { to: "/borrow", label: "Borrowing Desk", roles: ["superadmin", "librarian", "student"] },
  { to: "/history", label: "History", roles: ["student"] },
  { to: "/users", label: "Members", roles: ["superadmin", "librarian"] },
];

export default function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:relative w-64 h-full md:h-auto bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-40`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">℞</span>
              <span className="text-xl font-bold">Library</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <div className="font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-sm text-gray-500 capitalize">{role}</div>
          </div>
          <button
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 w-full md:w-auto">
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            ☰
          </button>
          <span className="text-lg font-semibold">Library</span>
        </div>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}