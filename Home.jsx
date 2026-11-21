import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import products from "../data/product.json";


const categories = [
  { title: "Toiletries", description: "Shampoo, conditioner, soap and dental kits", key: "toiletries", image: "https://media.landmarkshops.in/homecentre/1100049767001-1100049767_01-2100.jpg" },
  { title: "Bath & Linen", description: "Towels, slippers and bath mats", key: "linen", image: "https://spaces.in/cdn/shop/articles/5_Bed_Bath_Linen_Buys_That_Make_for_the_Most_Thoughtful_Gifts_for_Housewarming_3c2ac756-8403-4705-ac94-49784592317c.png?v=1777955580" },
  { title: "Pantry", description: "Tea, coffee, sugar and guest water", key: "pantry", image: "https://designerkitchendirect.co.uk/wp-content/uploads/2026/03/walk-in-pantries-1.webp" },
  { title: "Housekeeping", description: "Cleaning and room-maintenance essentials", key: "housekeeping", image: "https://jkdenterprises.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-14-2026-02_15_47-PM.png" },
  { title: "Welcome Kits", description: "Ready-made and branded welcome items", key: "welcome", image: "/images/welcome-kit.png" },
];

const kits = [
  { name: "Starter Pack", audience: "Single-room homestays and first-time hosts", description: "The bare essentials for one room for a month.", count: 5, price: "₹4,550" },
  { name: "Airbnb Essentials Pack", audience: "Airbnb hosts with 1–3 units", description: "Covers toiletries, towels and a pantry basics set for short stays.", count: 9, price: "₹7,230" },
  { name: "Premium Pack", audience: "Well-rated homestays and serviced apartments", description: "Mini-bottle toiletries and heavier cotton towels.", count: 8, price: "₹19,390" },
];

const benefits = [
  ["One platform, one supplier", "Stop chasing different vendors for toiletries, linen and pantry."],
  ["Consistent quality and pricing", "Clear pack sizes and minimum quantities, with bulk quotes on request."],
  ["Flexible quantities", "Small properties can order what they need, not a pallet."],
  ["No more emergency runs", "Saved kits and reorder reminders before you run out."],
];

const workQuotes = [
  {
    text: "The best welcome is built from a hundred thoughtful details.",
    label: "Make the little things count",
  },
  {
    text: "Great hosting is quiet work that makes every guest feel at home.",
    label: "Care, ready before they arrive",
  },
  {
    text: "A well-prepared room turns a place to stay into a place to return to.",
    label: "Create stays worth repeating",
  },
];

const steps = [
  ["Tell us about your property", "Property type, rooms, guest capacity and budget."],
  ["Pick a pack or build your kit", "Start from a ready-made pack or tailor every item."],
  ["We deliver", "Pay online or request a quotation for bulk and branded orders."],
  ["Reorder in one click", "Saved kits and property profiles make restocking quick."],
];

function HeroWelcomeArtwork() {
  const tiles = [
    { label: "Linen", image: "/images/linen.svg", className: "welcome-tile welcome-tile-linen" },
    { label: "Pantry", image: "/images/pantry.svg", className: "welcome-tile welcome-tile-pantry" },
    { label: "Housekeeping", image: "/images/housekeeping.svg", className: "welcome-tile welcome-tile-housekeeping" },
    { label: "Toiletries", image: "/images/toiletries.svg", className: "welcome-tile welcome-tile-toiletries" },
  ];

  return (
    <div className="welcome-artboard" aria-label="Welcome to StaySupply hospitality essentials">
      <span className="welcome-orbit welcome-orbit-one" />
      <span className="welcome-orbit welcome-orbit-two" />
      <span className="welcome-spark welcome-spark-one">✦</span>
      <span className="welcome-spark welcome-spark-two">◆</span>
      <span className="welcome-spark welcome-spark-three">●</span>

      {tiles.map((tile) => (
        <Link key={tile.label} to="/shop" className={tile.className} aria-label={`Explore ${tile.label}`}>
          <img src={tile.image} alt="" />
          <span>{tile.label}</span>
        </Link>
      ))}

      <div className="welcome-message">
        <span className="welcome-message-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        </span>
        <p>Welcome to</p>
        <h2>StaySupply</h2>
      </div>

      <span className="welcome-float-icon welcome-float-key">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M11 12l7-7m-3 3 3 3m-6 0 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </span>
      <span className="welcome-float-icon welcome-float-bed">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 18v-7m18 7v-5.5a2.5 2.5 0 0 0-2.5-2.5H12a3 3 0 0 0-3 3V18M3 15h18M7 10V7.5A1.5 1.5 0 0 1 8.5 6h1A1.5 1.5 0 0 1 11 7.5V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero-gradient relative isolate min-h-[650px] overflow-hidden md:min-h-[calc(100vh-72px)]">
        <div className="hero-noise absolute inset-0 -z-10 opacity-[.055]" />
        <div className="absolute -right-[13%] top-[13%] -z-10 h-[850px] w-[62%] rounded-t-full bg-[#d7f0ed] lg:top-[17%]" />
        <div className="absolute -right-[2%] top-[24%] -z-10 h-[690px] w-[20%] rounded-t-full bg-[#e1f4f1]" />
        <div className="absolute right-[3%] top-[8%] -z-10 h-40 w-40 rounded-full bg-white/70 lg:h-52 lg:w-52" />
        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-5 px-5 py-16 md:min-h-[calc(100vh-72px)] md:grid-cols-[1fr_.95fr] md:gap-3 md:px-6 md:py-12 lg:gap-8 lg:px-10">
          <div className="relative z-10 max-w-[670px]">
            <p className="hero-kicker">
              <span className="hero-kicker-icon" aria-hidden="true">✳</span>
              The thoughtful host’s supply shop
            </p>
            <h1 className="hero-title mt-6 text-[clamp(3.5rem,7.2vw,7.25rem)] font-bold leading-[.91] tracking-[-.075em] text-[#172033]">
              <span className="hidden md:block">A warm welcome</span>
              <span className="hidden md:block">starts with the</span>
              <span className="hidden md:block hero-title-accent">little things.</span>
              <span className="md:hidden">A warm welcome starts with the little things.</span>
            </h1>
            <p className="mt-5 max-w-[600px] text-lg leading-[1.6] text-[#647084] sm:text-[20px]">
              Everything your property needs to make guests feel at home—curated essentials, ready-made kits, and easy restocking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="group rounded-full bg-[#36523e] px-7 py-4 text-[16px] font-bold text-white shadow-[0_12px_28px_rgba(0,143,132,.25)] transition hover:-translate-y-0.5 hover:bg-[#284332] hover:shadow-[0_16px_34px_rgba(0,143,132,.32)]">
                Explore essentials <span className="cta-arrow" aria-hidden="true">↗</span>
              </Link>
              <Link to="/build-kit" className="rounded-full border border-[#dce3ec] bg-white/90 px-7 py-4 text-[16px] font-bold text-[#292a25] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#36523e] hover:bg-white">
                Build a custom kit <span className="cta-arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="hero-proof-row">
              <span><span className="proof-check">✓</span> Host-approved essentials</span>
              <span><span className="proof-check">✓</span> Easy repeat restocking</span>
            </div>
          </div>
          <div className="hero-visual relative mx-auto w-full max-w-[650px] md:ml-auto md:mr-0 md:max-w-[560px]">
            <HeroWelcomeArtwork />
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
              <img src={category.image} alt={`${category.title} hospitality essentials`} className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
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

      <section className="quote-section">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:py-20 lg:px-10">
          <div className="quote-section-heading">
            <p className="eyebrow">A little inspiration</p>
            <h2 className="section-title">Good stays are made by good work.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#647084] sm:text-base">
              A few reminders for the thoughtful people behind every warm welcome.
            </p>
          </div>
          <div className="quote-grid">
            {workQuotes.map((quote, index) => (
              <figure key={quote.label} className={`quote-card quote-card-${index + 1}`}>
                <span className="quote-glyph" aria-hidden="true">“</span>
                <blockquote><p>{quote.text}</p></blockquote>
                <figcaption><span className="quote-caption-mark" aria-hidden="true">✦</span>{quote.label}</figcaption>
              </figure>
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
