import { NavLink } from "react-router-dom";

export default function DashboardSidebar({ routes }) {
  return (
    <aside className="w-full shrink-0 border-b border-[#e8e4da] bg-[#fbf9f5] p-3 lg:w-60 lg:border-b-0 lg:border-r lg:p-5">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#e9ede5] font-semibold text-[#36523e]"
                  : "text-[#686860] hover:bg-[#f0eee7] hover:text-[#292a25]"
              }`
            }
          >
            {r.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
