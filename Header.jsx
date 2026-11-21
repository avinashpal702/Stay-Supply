import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (mobile = false) => navigation.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => mobile && setMenuOpen(false)}
      className={({ isActive }) =>
        `rounded-full px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-[#e4f6f3] text-[#252821]"
            : "text-[#64635e] hover:bg-[#f1eee8] hover:text-[#252821]"
        }`
      }
    >
      {item.label}
    </NavLink>
  ));

  return (
    <header className="sticky top-0 z-30 border-b border-[#e9e5db]/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2.5 text-[19px] font-bold tracking-[-0.06em] text-[#20231f]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00ad9f] to-[#247e76] text-[17px] font-bold text-white shadow-[0_8px_18px_rgba(0,173,159,.22)]">S</span>
          <span>StaySupply</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks()}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:ml-0">
          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-[#252821] transition hover:bg-[#efebdf]"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
              <path d="M3.5 4.5h2l2.1 10.1a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 20h.01M18 20h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M8 12h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" />
            </svg>
            {itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#36523e] px-1 text-[10px] font-bold text-white">{itemCount}</span>}
          </Link>
          <Link to="/admin" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] lg:block">Admin</Link>
          {currentUser ? (
            <>
              <Link to="/account" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] lg:block">My account</Link>
              <button type="button" onClick={signOutDemo} className="hidden rounded-full bg-[#36523e] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110 active:brightness-95 sm:block">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-[13px] font-semibold text-[#302f2a] hover:text-[#36523e] sm:block">Log in</Link>
              <Link to="/signup" className="hidden rounded-full bg-[#36523e] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#284332] sm:block">Sign up</Link>
            </>
          )}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full text-[#252821] transition hover:bg-[#f1eee8] md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile" className="border-t border-[#e9e5db] bg-white px-4 pb-4 pt-3 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {navLinks(true)}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e9e5db] pt-3">
              <Link to={currentUser ? "/account" : "/login"} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#64635e] hover:bg-[#f1eee8]">
                {currentUser ? "My account" : "Log in"}
              </Link>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#64635e] hover:bg-[#f1eee8]">Admin preview</Link>
              {!currentUser && <Link to="/signup" onClick={() => setMenuOpen(false)} className="col-span-2 rounded-full bg-[#36523e] px-4 py-2.5 text-center text-sm font-semibold text-white">Create an account</Link>}
              {currentUser && <button type="button" onClick={() => { signOutDemo(); setMenuOpen(false); }} className="col-span-2 rounded-full border border-[#e4e0d6] px-4 py-2.5 text-sm font-semibold text-[#64635e] transition hover:border-[#b8e4de] hover:bg-[#e4f6f3] hover:text-[#008f84]">Log out</button>}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
