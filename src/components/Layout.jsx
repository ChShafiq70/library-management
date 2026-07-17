import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/books", label: "Catalog", roles: ["superadmin", "librarian", "student"] },
  { to: "/borrow", label: "Borrowing Desk", roles: ["superadmin", "librarian", "student"] },
  { to: "/users", label: "Members", roles: ["superadmin", "librarian"] },
];

export default function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">℞</span>
            <span className="text-xl font-bold">The Reading Room</span>
          </div>
          <span className="text-sm text-gray-500 mt-1 block">Library Registry</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
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
            <div className="font-medium text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-500 capitalize">{role}</div>
          </div>
          <button 
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors" 
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}