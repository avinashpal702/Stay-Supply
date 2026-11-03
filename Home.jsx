import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import products from "../data/product.json";


const categories = [
  { title: "Toiletries", description: "Shampoo, conditioner, soap and dental kits", key: "toiletries", image: "/images/toiletries.svg" },
  { title: "Bath & Linen", description: "Towels, slippers and bath mats", key: "linen", image: "/images/linen.svg" },
  { title: "Pantry", description: "Tea, coffee, sugar and guest water", key: "pantry", image: "/images/pantry.svg" },
  { title: "Housekeeping", description: "Cleaning and room-maintenance essentials", key: "housekeeping", image: "/images/housekeeping.svg" },
  { title: "Welcome Kits", description: "Ready-made and branded welcome items", key: "welcome", image: "/images/welcome.svg" },
];

const kits = [
  { name: "Starter Pack", audience: "Single-room homestays and first-time hosts", description: "The bare essentials for one room for a month.", count: 5, price: "₹4,550" },
  { name: "Airbnb Essentials Pack", audience: "Airbnb hosts with 1–3 units", description: "Covers toiletries, towels and a pantry basics set for short stays.", count: 9, price: "₹7,230" },
  { name: "Premium Pack", audience: "Well-rated homestays and serviced apartments", description: "Mini-bottle toiletries and heavier cotton towels.", count: 8, price: "₹19,390" },
];

const benefits = [
  ["One platform, one supplier", "Stop chasing different vendors for toiletries, linen and pantry."],
  ["Consistent quality and pricing", "Clear pack sizes, minimum quantities and bulk price breaks."],
  ["Flexible quantities", "Small properties can order what they need, not a pallet."],
  ["No more emergency runs", "Saved kits and reorder reminders before you run out."],
];

const steps = [
  ["Tell us about your property", "Property type, rooms, guest capacity and budget."],
  ["Pick a pack or build your kit", "Start from a ready-made pack or tailor every item."],
  ["We deliver", "Pay online or request a quotation for bulk and branded orders."],
  ["Reorder in one click", "Saved kits and property profiles make restocking quick."],
];

export default function Home() {
  return (
    <>
      <section className="relative isolate min-h-[650px] overflow-hidden bg-[#f3f0e7] md:min-h-[calc(100vh-64px)]">
        <div className="hero-noise absolute inset-0 -z-10 opacity-[.055]" />
        <div className="absolute -right-[13%] top-[13%] -z-10 h-[850px] w-[62%] rounded-t-full bg-[#e1e2d5] lg:top-[17%]" />
        <div className="absolute -right-[2%] top-[24%] -z-10 h-[690px] w-[20%] rounded-t-full bg-[#e8e8dc]" />
        <div className="absolute right-[3%] top-[8%] -z-10 h-40 w-40 rounded-full bg-white/70 lg:h-52 lg:w-52" />
        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-5 px-5 py-16 md:min-h-[calc(100vh-64px)] md:grid-cols-[1fr_.95fr] md:gap-3 md:px-6 md:py-12 lg:gap-8 lg:px-10">
          <div className="relative z-10 max-w-[670px]">
            <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#45634b] sm:text-[12px]">
              Hospitality procurement · Jaipur pilot
            </p>
            <h1 className="mt-5 text-[clamp(3.2rem,6.1vw,6.35rem)] font-bold leading-[.99] tracking-[-.065em] text-[#24231f]">
              <span className="hidden md:block">Everything your</span>
              <span className="hidden md:block">property</span>
              <span className="hidden md:block">needs. In one</span>
              <span className="hidden md:block">place.</span>
              <span className="md:hidden">Everything your property needs. In one place.</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-lg leading-[1.5] text-[#72716b] sm:text-[20px]">
              Guest essentials, customised kits and effortless restocking for Airbnb hosts, homestays and boutique hotels.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-[#36523e] px-7 py-4 text-[17px] font-semibold text-white transition hover:bg-[#284332]">
                Shop products
              </Link>
              <Link to="/build-kit" className="rounded-full border border-[#dedbd2] bg-white px-7 py-4 text-[17px] font-semibold text-[#292a25] transition hover:border-[#36523e] hover:bg-[#f9f8f3]">
                Build your kit
              </Link>
            </div>
          </div>
          <div className="relative mx-auto grid w-full max-w-[650px] grid-cols-2 gap-4 pb-8 pt-3 sm:gap-5 md:ml-auto md:mr-0 md:mt-12 md:max-w-[335px] md:translate-y-4 md:gap-2 md:pb-0 md:pt-0">
            <div className="pointer-events-none absolute -left-4 top-[27%] h-24 w-24 rounded-full bg-[#f5f4ec]/80" />
            <div className="pointer-events-none absolute -right-4 bottom-[7%] h-28 w-28 rounded-full bg-[#f0e8d8]/80" />
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.key}
                to={`/shop?category=${category.key}`}
                className={`product-art-shadow relative z-10 block overflow-hidden rounded-[26px] border-[5px] border-white/90 shadow-[0_20px_40px_rgba(54,58,47,.09)] ${index % 2 ? "mt-10 sm:mt-14" : ""}`}
              >
                <img src={category.image} alt={`${category.title} illustration`} className="aspect-square w-full object-cover" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:py-20 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="section-title">Everything a room needs</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-[#3d5943] hover:underline">View all <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/shop?category=${category.key}`}
              className="group overflow-hidden rounded-[18px] border border-[#e9e5db] bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img src={category.image} alt={`${category.title} illustration`} className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="p-4">
                <p className="font-bold text-[#292a25]">{category.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#77766e]">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f3f0e7] py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Ready-made restock kits</p>
              <h2 className="section-title">Start from a pack that fits your property</h2>
              <p className="mt-2 text-sm text-[#74736d]">Every pack lists exactly what is included, in what quantity, and at what price.</p>
            </div>
            <Link to="/kits" className="text-sm font-bold text-[#3d5943] hover:underline">All packs <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {kits.map((kit, index) => (
              <article key={kit.name} className="flex flex-col rounded-[20px] border border-[#e6e1d6] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#77766e]">{kit.audience}</p>
                <h3 className="mt-3 text-[22px] font-bold tracking-tight text-[#292a25]">{kit.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#74736d]">{kit.description}</p>
                <p className="mt-4 text-xs text-[#74736d]">{kit.count} products included</p>
                <div className="mt-5 flex items-end justify-between border-t border-[#eeeae2] pt-5">
                  <div><p className="text-xs text-[#77766e]">From</p><p className="mt-1 text-xl font-bold text-[#292a25]">{kit.price}</p></div>
                  <Link to={`/kits#pack-${index + 1}`} className="text-sm font-semibold text-[#3d5943] hover:underline">View contents</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-[#36523e] px-6 py-6 text-white sm:px-8">
            <div><p className="font-bold">Build your own restock kit</p><p className="mt-1 text-sm text-white/75">Enter rooms and guest capacity. We calculate quantities per product, not a blind multiply.</p></div>
            <Link to="/build-kit" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#36523e] hover:bg-[#f3f0e7]">Start building <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:py-20 lg:px-10">
        <div className="mb-8">
          <p className="eyebrow">Popular</p>
          <h2 className="section-title">Frequently restocked essentials</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(1, 3).concat(products.slice(16, 18)).map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>

      <section className="bg-[#f3f0e7] py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
          <div className="mb-8">
            <p className="eyebrow">Why StaySupply</p>
            <h2 className="section-title">Built for how properties actually restock</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, description], index) => (
              <article key={title} className="rounded-[18px] border border-[#e5e0d5] bg-white/75 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e7ece3] text-lg text-[#36523e]">
                  {["⌂", "✓", "↗", "⟳"][index]}
                </span>
                <h3 className="mt-5 font-bold text-[#292a25]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#77766e]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="section-title">From first order to repeat order</h2>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2">
          {steps.map(([title, description], index) => (
            <li key={title} className="rounded-[18px] border border-[#e9e5db] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#70836d]">Step {index + 1}</p>
              <h3 className="mt-3 font-bold text-[#292a25]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#77766e]">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#36523e] py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-6 px-5 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">For hotels and Airbnb hosts</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Run a pilot restock with us in Jaipur</h2>
            <p className="mt-3 leading-7 text-white/75">We are onboarding our first properties. Request a quotation for bulk or branded orders, or place a trial order from the catalogue.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/bulk-orders" className="rounded-full bg-white px-5 py-3 font-bold text-[#36523e] hover:bg-[#f3f0e7]">Request a quotation</Link>
            <Link to="/contact" className="rounded-full border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
