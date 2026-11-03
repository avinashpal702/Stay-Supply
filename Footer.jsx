import { Link } from "react-router-dom";

const columns = [
  {
    title: "Shop",
    links: [["All products", "/shop"], ["Restock kits", "/kits"], ["Build your kit", "/build-kit"], ["Bulk orders", "/bulk-orders"]],
  },
  {
    title: "Company",
    links: [["About", "/about"], ["Contact", "/contact"], ["FAQs", "/contact#faq"]],
  },
  {
    title: "Policies",
    links: [["Shipping & returns", "/legal/shipping-returns"], ["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"]],
  },
  {
    title: "Preview",
    links: [["Customer dashboard", "/account"], ["Admin dashboard", "/admin"]],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e4da] bg-[#fbf9f5]">
      <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-[#252821]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#36523e] text-white">S</span>
              StaySupply
            </Link>
            <p className="mt-4 text-sm leading-6 text-[#74736d]">
              Guest essentials, customised kits and effortless restocking for hospitality businesses. Jaipur pilot.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-4 text-sm font-bold text-[#252821]">{column.title}</p>
              <ul className="space-y-3">
                {column.links.map(([label, path]) => (
                  <li key={path}>
                    <Link to={path} className="text-sm text-[#74736d] transition hover:text-[#36523e]">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[#e8e4da] pt-5 text-xs leading-5 text-[#89877f]">
          StaySupply is a working name. Prices and data shown are sample content for the frontend preview.
        </div>
      </div>
    </footer>
  );
}
