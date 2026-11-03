import { NavLink } from "react-router-dom";

export default function DashboardSidebar({ routes }) {
  return (
    <aside className="w-56 bg-gray-50 h-full p-4 border-r">
      <nav className="flex flex-col space-y-2">
        {routes.map(r => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) => isActive ? "font-bold text-indigo-600" : "" }
          >
            {r.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}