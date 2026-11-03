import { Link, NavLink } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { useDemoData } from "../store/DemoDataContext";

const navigation = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/kits", label: "Restock Kits" },
  { to: "/bulk-orders", label: "Bulk Orders" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { itemCount } = useCart();
  const { currentUser, signOutDemo } = useDemoData();

  return (
    <header className="sticky top-0 z-30 border-b border-[#e9e5db] bg-[#fbf9f5]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[64px] max-w-[1440px] flex-wrap items-center justify-between gap-x-2 gap-y-2 px-4 py-2 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-[19px] font-bold tracking-[-0.06em] text-[#20231f]">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#36523e] text-[17px] font-bold text-white">S</span>
          <span>StaySupply</span>
        </Link>
        <nav aria-label="Main" className="order-3 flex w-full items-center justify-between gap-0 overflow-x-auto text-[13px] font-medium text-[#64635e] md:order-none md:w-auto md:justify-center">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-2.5 py-2 text-center leading-4 transition sm:px-3 ${isActive ? "bg-[#efebdf] text-[#252821]" : "hover:bg-[#f1eee8] hover:text-[#252821]"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0 md:gap-3">
          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-[#252821] transition hover:bg-[#efebdf]"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
              <path d="M5 8.5h14l-.8 11H5.8L5 8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 9V6.8a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#36523e] px-1 text-[10px] font-bold text-white">{itemCount}</span>}
          </Link>
          <Link to="/admin" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] md:block">Admin</Link>
          {currentUser ? (
            <>
              <Link to="/account" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] sm:block">My account</Link>
              <button type="button" onClick={signOutDemo} className="rounded-full bg-[#36523e] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#284332]">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] sm:block">Log in</Link>
              <Link to="/signup" className="rounded-full bg-[#36523e] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#284332]">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
