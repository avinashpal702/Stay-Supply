import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import products from "../data/product.json";
import packs from "../data/packs.json";
import { formatPrice, useCart } from "../store/CartContext";
import { useDemoData } from "../store/DemoDataContext";

const categories = [
  ["All", "all"],
  ["Toiletries", "toiletries"],
  ["Bath & Linen", "linen"],
  ["Pantry", "pantry"],
  ["Housekeeping", "housekeeping"],
  ["Welcome Kits", "welcome"],
];

const RECENTLY_VIEWED_KEY = "staysupply-recently-viewed";
const PRODUCT_VIEW_COUNTS_KEY = "staysupply-product-view-counts";
const MAX_RECENTLY_VIEWED = 8;
const productsById = new Map(products.map((product) => [product.id, product]));
const catalogPosition = new Map(products.map((product, index) => [product.id, index]));

function loadRecentlyViewed() {
  const saved = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Recently viewed data is not a list.");
    return [...new Set(parsed.filter((id) => typeof id === "string" && productsById.has(id)))].slice(0, MAX_RECENTLY_VIEWED);
  } catch (error) {
    console.error("Could not load recently viewed products.", error);
    return [];
  }
}

function loadProductViewCounts() {
  const saved = window.localStorage.getItem(PRODUCT_VIEW_COUNTS_KEY);
  if (!saved) return {};
  try {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Product view data is not an object.");
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, count]) => productsById.has(id) && Number.isFinite(count) && count >= 0),
    );
  } catch (error) {
    console.error("Could not load product popularity data.", error);
    return {};
  }
}

function recordProductView(productId) {
  const recentlyViewed = [productId, ...loadRecentlyViewed().filter((id) => id !== productId)].slice(0, MAX_RECENTLY_VIEWED);
  const viewCounts = loadProductViewCounts();
  viewCounts[productId] = (viewCounts[productId] || 0) + 1;
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    window.localStorage.setItem(PRODUCT_VIEW_COUNTS_KEY, JSON.stringify(viewCounts));
  } catch (error) {
    console.error("Could not save product browsing history.", error);
  }
}

function PageIntro({ eyebrow, title, description, children }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="section-title">{title}</h1>
      {description && <p className="mt-3 max-w-3xl leading-7 text-[#74736d]">{description}</p>}
      {children}
    </div>
  );
}

function QuoteSection({ eyebrow, title, description, quotes, className = "" }) {
  return (
    <section className={`quote-section ${className}`.trim()}>
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:py-20 lg:px-10">
        <div className="quote-section-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#647084] sm:text-base">{description}</p>
        </div>
        <div className="quote-grid">
          {quotes.map((quote, index) => (
            <figure key={quote.label} className={`quote-card quote-card-${(index % 3) + 1}`}>
              <span className="quote-glyph" aria-hidden="true">“</span>
              <blockquote><p>{quote.text}</p></blockquote>
              <figcaption><span className="quote-caption-mark" aria-hidden="true">✦</span>{quote.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return <button className={`rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white transition hover:bg-[#284332] disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const [tier, setTier] = useState("all");
  const [sort, setSort] = useState("featured");
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [recentlyViewedIds] = useState(loadRecentlyViewed);
  const [viewCounts] = useState(loadProductViewCounts);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || categories.find(([, key]) => key === category)?.[0] === product.category;
      const matchesTier = tier === "all" || product.tier.toLowerCase() === tier;
      const matchesQuery = `${product.name} ${product.sku} ${product.category} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesMinPrice = minPrice === "" || product.price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === "" || product.price <= Number(maxPrice);
      const matchesAvailability = availability === "all" || product.stock === availability;
      return matchesCategory && matchesTier && matchesQuery && matchesMinPrice && matchesMaxPrice && matchesAvailability;
    });
    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "popular") {
      filtered.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0) || catalogPosition.get(a.id) - catalogPosition.get(b.id));
    }
    if (sort === "newest") filtered.sort((a, b) => catalogPosition.get(b.id) - catalogPosition.get(a.id));
    return filtered;
  }, [category, tier, sort, query, minPrice, maxPrice, availability, viewCounts]);

  const recentlyViewed = recentlyViewedIds.map((id) => productsById.get(id)).filter(Boolean);
  const hasActiveFilters = category !== "all" || tier !== "all" || availability !== "all" || query || minPrice || maxPrice;
  const resetFilters = () => {
    setQuery("");
    setTier("all");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
    setSearchParams({});
  };

  return (
    <div className="shop-page">
      <section className="about-hero shop-hero">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10">
          <div className="about-hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-icon" aria-hidden="true">✳</span>StaySupply catalogue</p>
            <h1 className="about-title">Thoughtful essentials for every arrival.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59677a] sm:text-lg">
              Browse guest-ready supplies with clear pack sizes, practical minimums, and easy repeat ordering for your property.
            </p>
            <div className="about-tags">
              <span><i aria-hidden="true" />{products.length} curated products</span>
              <span><i aria-hidden="true" />Sizes and MOQs shown</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop#catalogue" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(0,143,132,.2)] transition hover:-translate-y-0.5 hover:shadow-lg">Browse products <span className="cta-arrow" aria-hidden="true">↘</span></Link>
              <Link to="/kits" className="rounded-full border border-white bg-white/75 px-5 py-3 font-semibold text-[#292a25] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">Explore restock kits</Link>
            </div>
          </div>
          <div className="about-photo-stage shop-hero-stage">
            <span className="about-photo-orbit" aria-hidden="true" />
            <ProductImage product={products[0]} className="shop-feature-image" />
            <div className="about-photo-caption">
              <span className="about-photo-star" aria-hidden="true">✦</span>
              <span><strong>{products[0].name}</strong><small>{products[0].unit} · made for guest stays</small></span>
            </div>
            <span className="about-photo-sticker">Guest-ready essentials</span>
          </div>
        </div>
      </section>

      <section id="catalogue" className="shop-catalogue mx-auto max-w-[1320px] scroll-mt-24 px-5 py-14 sm:py-20 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Find the right fit</p>
            <h2 className="section-title">Shop the essentials.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#647084]">Prices are per listed pack. Contact us for confirmed bulk pricing and supplier availability.</p>
          </div>
          <p className="shop-sample-note">Sample prices for the frontend preview.</p>
        </div>

        <div className="shop-filter-panel">
          <div className="shop-category-tabs" role="group" aria-label="Filter by category">
            {categories.map(([label, key]) => (
              <button
                key={key}
                type="button"
                aria-pressed={category === key}
                onClick={() => setSearchParams(key === "all" ? {} : { category: key })}
                className={`shop-category-tab ${category === key ? "is-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="shop-filter-controls">
            <label className="shop-search-field">
              <span className="sr-only">Search products by name or SKU</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or SKU" aria-label="Search products by name or SKU" className="input-field" />
            </label>
            <label className="shop-price-field">
              <span>Min price (₹)</span>
              <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} aria-label="Minimum price" placeholder="No minimum" className="input-field" />
            </label>
            <label className="shop-price-field">
              <span>Max price (₹)</span>
              <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label="Maximum price" placeholder="No maximum" className="input-field" />
            </label>
            <select value={tier} onChange={(event) => setTier(event.target.value)} aria-label="Filter by quality" className="input-field select-field">
              <option value="all">All qualities</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="luxury">Luxury</option>
            </select>
            <select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by availability" className="input-field select-field">
              <option value="all">All availability</option><option value="In stock">In stock</option><option value="Low stock">Low stock</option><option value="Made to order">Made to order</option>
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" className="input-field select-field">
              <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="popular">Popularity</option><option value="newest">Newest (catalog sequence)</option>
            </select>
          </div>
        </div>
        <p className="shop-filter-note">Popularity uses product detail views on this device; newest follows the product catalog order.</p>

        <div className="shop-results-bar">
          <p><strong>{visibleProducts.length}</strong> {visibleProducts.length === 1 ? "product" : "products"} found</p>
          {hasActiveFilters && <button type="button" onClick={resetFilters}>Clear filters <span aria-hidden="true">×</span></button>}
        </div>

        {visibleProducts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} compact />)}
          </div>
        ) : (
          <div className="shop-empty-state">
            <span aria-hidden="true">⌕</span>
            <h2>No matching products</h2>
            <p>Try adjusting your search, price range, quality, availability, or category.</p>
            {hasActiveFilters && <button type="button" onClick={resetFilters} className="mt-5 rounded-full bg-[#36523e] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">Clear filters</button>}
          </div>
        )}
      </section>

      <section className="shop-recently-viewed mx-auto max-w-[1320px] px-5 pb-14 lg:px-10">
        <div className="mb-6">
          <p className="eyebrow">Pick up where you left off</p>
          <h2 className="section-title">Recently viewed products</h2>
        </div>
        {recentlyViewed.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((product) => <ProductCard key={product.id} product={product} compact />)}
          </div>
        ) : (
          <p className="shop-recently-empty">Products you view will appear here on this device.</p>
        )}
      </section>

      <QuoteSection eyebrow="For thoughtful hosts" title="The right essentials make the details feel effortless." description="Original StaySupply thoughts on keeping every room ready for its next arrival." quotes={shopQuotes} />
    </div>
  );
}

export function ProductPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const product = products.find((entry) => entry.id === productId);
  const [quantity, setQuantity] = useState(product?.moq || 1);
  useEffect(() => {
    if (product) recordProductView(product.id);
  }, [product]);
  if (!product) return <NotFoundPage />;
  const similar = products.filter((entry) => entry.category === product.category && entry.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:py-14 lg:px-10">
      <p className="mb-7 text-sm text-[#77766e]"><Link to="/shop" className="hover:text-[#36523e]">Shop</Link> / {product.category} / {product.name}</p>
      <p className="mb-6 text-xs text-[#8a877d]">Images are representative; exact packaging may vary by supplier.</p>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage product={product} className="aspect-square w-full rounded-[26px] border border-[#e8e4da] object-cover" />
        <div className="py-2">
          <div className="flex gap-2"><StockBadge stock={product.stock} /><span className="rounded-full bg-[#f0eee7] px-3 py-1 text-[11px] font-semibold lowercase text-[#77766e]">{product.tier}</span></div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#252720]">{product.name}</h1>
          <p className="mt-4 leading-7 text-[#74736d]">{product.description}</p>
          <p className="mt-5 text-2xl font-bold text-[#252720]">{formatPrice(product.price)} <span className="text-base font-normal text-[#77766e]">/ {product.unit}</span></p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <label htmlFor="product-quantity" className="text-sm font-semibold">Quantity</label>
            <input id="product-quantity" type="number" min={product.moq} step={product.moq} value={quantity} onChange={(event) => setQuantity(Math.max(product.moq, Number(event.target.value) || product.moq))} className="input-field max-w-28" />
            <span className="text-xs text-[#77766e]">MOQ {product.moq}</span>
          </div>
          <div className="mt-3 text-sm text-[#77766e]">Total <strong className="text-[#252720]">{formatPrice(quantity * product.price)}</strong> · {product.moq} minimum · 157 packs available</div>
          <PrimaryButton onClick={() => addToCart(product, quantity)} className="mt-6 min-w-48">Add to cart</PrimaryButton>
          <div className="mt-9 rounded-2xl border border-[#e7e3da] bg-white p-5">
            <h2 className="font-bold">Ordering in bulk?</h2>
            <p className="mt-2 text-sm leading-6 text-[#74736d]">Bulk pricing depends on quantity and availability. Request a quote for a confirmed price.</p>
            <Link to="/bulk-orders" className="mt-4 inline-flex rounded-full border border-[#dcd8ce] px-4 py-2 text-sm font-semibold text-[#36523e] transition hover:border-[#36523e] hover:bg-[#f9f8f3]">
              Request a bulk quote
            </Link>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold">Specifications</h2>
            <dl className="mt-4 divide-y divide-[#e9e5db] text-sm">
              {[[ "SKU", product.sku ], [ "Material", product.category === "Bath & Linen" ? "Cotton" : "Guest-ready quality" ], [ "Pack size", product.unit ], [ "Minimum order", `${product.moq} ${product.moq === 1 ? "pack" : "units"}` ], [ "Usage", "Restock as required" ]].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-3"><dt className="text-[#77766e]">{label}</dt><dd className="font-medium text-[#302f2a]">{value}</dd></div>)}
            </dl>
          </div>
        </div>
      </div>
      {similar.length > 0 && <section className="mt-16"><h2 className="section-title">Similar products</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{similar.map((entry) => <ProductCard key={entry.id} compact product={entry} />)}</div></section>}
    </div>
  );
}

function StockBadge({ stock }) {
  const style = stock === "Low stock" ? "bg-[#f8eee0] text-[#9b672d]" : stock === "In stock" ? "bg-[#eaf0e8] text-[#48644c]" : "bg-[#f0eee7] text-[#6d6c62]";
  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${style}`}>{stock}</span>;
}

export function KitsPage() {
  const { addToCart } = useCart();
  return (
    <div className="kits-page">
      <section className="about-hero kits-hero">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10">
          <div className="about-hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-icon" aria-hidden="true">✳</span>Ready when you are</p>
            <h1 className="about-title">A better stay starts with a better restock.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59677a] sm:text-lg">
              Choose a ready-made kit with clear contents and quantities, then customise it to fit your property.
            </p>
            <div className="about-tags">
              <span><i aria-hidden="true" />{packs.length} curated packs</span>
              <span><i aria-hidden="true" />Contents and pricing shown</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/build-kit" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(0,143,132,.2)] transition hover:-translate-y-0.5 hover:shadow-lg">Build a custom kit <span className="cta-arrow" aria-hidden="true">↗</span></Link>
              <Link to="/bulk-orders" className="rounded-full border border-white bg-white/75 px-5 py-3 font-semibold text-[#292a25] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">Need a bulk quote?</Link>
            </div>
          </div>
          <div className="about-photo-stage">
            <span className="about-photo-orbit" aria-hidden="true" />
            <img src="/images/welcome-kit.png" alt="A curated hospitality welcome kit with branded guest essentials" />
            <div className="about-photo-caption">
              <span className="about-photo-star" aria-hidden="true">✦</span>
              <span><strong>Thoughtful, room-ready essentials</strong><small>Start with a pack, make it your own</small></span>
            </div>
            <span className="about-photo-sticker">Ready to restock</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-14 sm:py-20 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Find your starting point</p>
            <h2 className="section-title">Restock kits for the way you host.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#647084]">Open any pack to see the products, quantities, and sample pricing. Add it as-is or tailor it in the kit builder.</p>
          </div>
          <p className="text-xs text-[#8a877d]">Contents and prices are sample figures for this preview.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {packs.map((pack) => {
            const contents = pack.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean);
            return (
              <article id={`pack-${pack.id}`} key={pack.id} className="kit-pack-card scroll-mt-28">
                <div className="kit-pack-art">
                  {contents[0] && <ProductImage product={contents[0]} className="kit-pack-art-image" />}
                  <span className="kit-pack-number">RESTOCK KIT · {String(pack.id).padStart(2, "0")}</span>
                </div>
                <div className="kit-pack-content">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#77766e]">{pack.audience}</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#20233a]">{pack.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#647084]">{pack.description}</p>
                  <p className="mt-3 text-xs font-medium text-[#77766e]">Planned for {pack.rooms} · {pack.count} products</p>
                  <details className="kit-pack-details mt-5">
                    <summary>{pack.count} included {pack.count === 1 ? "product" : "products"} <span aria-hidden="true">＋</span></summary>
                    <ul className="mt-3 space-y-2 border-l-2 border-[#dfe5dc] pl-4 text-sm text-[#6f7068]">
                      {contents.map((product) => <li key={product.id} className="flex justify-between gap-3"><span>{product.name}</span><span>{product.unit}</span></li>)}
                    </ul>
                  </details>
                  <div className="kit-pack-footer">
                    <div><p className="text-xs text-[#77766e]">Pack total</p><p className="mt-1 text-2xl font-bold text-[#20233a]">{formatPrice(pack.price)}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/build-kit?pack=${pack.id}`} className="rounded-full border border-[#dcd8ce] px-4 py-2.5 text-sm font-semibold text-[#36523e] transition hover:bg-[#e4f6f3]">Customise</Link>
                      <PrimaryButton onClick={() => addToCart({ id: `kit-${pack.id}`, name: pack.name, price: pack.price, moq: 1, unit: "pack", image: "/images/welcome.svg", category: "Restock Kits", tier: "Kit" })} className="px-4 py-2.5 text-sm">Add pack</PrimaryButton>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <QuoteSection eyebrow="The thoughtful host’s checklist" title="A smooth stay is built on small details." description="A few StaySupply thoughts on keeping every arrival feeling considered." quotes={kitQuotes} />
    </div>
  );
}

export function BuildKitPage() {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [rooms, setRooms] = useState(2);
  const [guests, setGuests] = useState(4);
  const [budget, setBudget] = useState("balanced");
  const [selected, setSelected] = useState(products.slice(0, 8).map((product) => product.id));
  const { addToCart } = useCart();
  const params = useSearchParams()[0];
  const pack = packs.find((entry) => String(entry.id) === params.get("pack"));
  const navigate = useNavigate();
  const steps = ["Property", "Details", "Budget", "Products", "Summary", "Checkout"];
  const chosenProducts = products.filter((product) => selected.includes(product.id));
  const kitTotal = chosenProducts.reduce((total, product) => total + product.price, 0);

  function toggleProduct(id) {
    setSelected((current) => current.includes(id) ? current.filter((productId) => productId !== id) : [...current, id]);
  }

  function continueFlow() {
    if (step === 0 && !propertyType) return;
    if (step < steps.length - 1) setStep((current) => current + 1);
    else {
      addToCart({ id: `custom-kit-${Date.now()}`, componentIds: chosenProducts.map((product) => product.id), name: `Custom restock kit · ${rooms} rooms`, price: kitTotal, moq: 1, unit: "kit", image: "/images/welcome.svg", category: "Restock Kits", tier: "Custom" });
      navigate("/cart");
    }
  }

  function back() {
    if (step > 0) setStep((current) => current - 1);
    else navigate("/kits");
  }

  return (
    <div className="mx-auto max-w-[1050px] px-5 py-12 sm:py-16 lg:px-10">
      <PageIntro eyebrow="Personalised restocking" title="Build your own restock kit" description="Six short steps. Quantities are worked out per product, so you do not over-order towels or under-order shampoo." />
      {pack && <p className="mb-6 rounded-xl bg-[#edf1ea] p-4 text-sm text-[#405d49]">Customising the {pack.name}. Choose the options that suit your property.</p>}
      <ol className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {steps.map((label, index) => <li key={label} className={`rounded-xl px-2 py-3 text-center text-xs font-semibold ${step === index ? "bg-[#36523e] text-white" : step > index ? "bg-[#e7ece3] text-[#36523e]" : "bg-[#f0eee7] text-[#86847c]"}`}><span className="block text-[10px] uppercase tracking-wide">Step {index + 1}</span><span className="mt-1 block">{label}</span></li>)}
      </ol>
      <div className="min-h-[330px] rounded-[22px] border border-[#e7e3da] bg-white p-6 sm:p-8">
        {step === 0 && <><h2 className="text-xl font-bold">What type of property?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Airbnb", "Entire home or apartment"], ["Homestay", "Rooms in a family home"], ["Boutique Hotel", "Small, design-led hotel"], ["Serviced Apartment", "Longer-stay units"]].map(([title, detail]) => <button key={title} type="button" onClick={() => setPropertyType(title)} className={`rounded-2xl border p-5 text-left ${propertyType === title ? "border-[#4b694f] bg-[#edf1ea]" : "border-[#e8e4da] hover:border-[#abb8a7]"}`}><strong className="block">{title}</strong><span className="mt-1 block text-sm text-[#77766e]">{detail}</span></button>)}</div></>}
        {step === 1 && <><h2 className="text-xl font-bold">Tell us about your property</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Number of rooms<input type="number" min="1" value={rooms} onChange={(event) => setRooms(Math.max(1, Number(event.target.value)))} className="input-field mt-2" /></label><label className="text-sm font-semibold">Guest capacity<input type="number" min="1" value={guests} onChange={(event) => setGuests(Math.max(1, Number(event.target.value)))} className="input-field mt-2" /></label></div><p className="mt-4 text-sm text-[#77766e]">Property type: {propertyType}</p></>}
        {step === 2 && <><h2 className="text-xl font-bold">Choose a monthly budget</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["essentials", "Essentials", "Keep the basics covered"], ["balanced", "Balanced", "Comfort and value"], ["premium", "Premium", "A more elevated guest stay"]].map(([value, title, detail]) => <button key={value} type="button" onClick={() => setBudget(value)} className={`rounded-2xl border p-5 text-left ${budget === value ? "border-[#4b694f] bg-[#edf1ea]" : "border-[#e8e4da]"}`}><strong className="block">{title}</strong><span className="mt-1 block text-sm text-[#77766e]">{detail}</span></button>)}</div></>}
        {step === 3 && <><h2 className="text-xl font-bold">Choose your products</h2><p className="mt-2 text-sm text-[#77766e]">Select essentials for {rooms} rooms and up to {guests} guests.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8e4da] p-3"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleProduct(product.id)} className="h-4 w-4 accent-[#36523e]" /><ProductImage product={product} className="h-12 w-12 rounded-lg object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{product.name}</strong><span className="text-xs text-[#77766e]">{product.unit}</span></span><span className="text-sm font-semibold">{formatPrice(product.price)}</span></label>)}</div></>}
        {step === 4 && <><h2 className="text-xl font-bold">Review your restock kit</h2><p className="mt-2 text-sm text-[#77766e]">{propertyType} · {rooms} rooms · {guests} guests · {budget} budget</p><ul className="mt-5 divide-y divide-[#eeeae2]">{chosenProducts.map((product) => <li key={product.id} className="flex justify-between gap-4 py-3 text-sm"><span>{product.name}</span><span className="font-semibold">{formatPrice(product.price)}</span></li>)}</ul><p className="mt-5 flex justify-between border-t border-[#e8e4da] pt-5 text-lg font-bold"><span>Estimated total</span><span>{formatPrice(kitTotal)}</span></p></>}
        {step === 5 && <><h2 className="text-xl font-bold">Ready for your first restock?</h2><p className="mt-3 max-w-xl leading-7 text-[#74736d]">Your custom kit includes {chosenProducts.length} products for {rooms} rooms. Add it to your cart to review the order.</p><p className="mt-5 text-2xl font-bold">{formatPrice(kitTotal)}</p></>}
      </div>
      <div className="mt-5 flex justify-between"><button type="button" onClick={back} className="rounded-full border border-[#dedbd2] px-5 py-3 font-semibold text-[#505149] hover:bg-[#f3f0e7]">Back</button><PrimaryButton onClick={continueFlow} disabled={(step === 0 && !propertyType) || (step === 3 && selected.length === 0)}>{step === 5 ? "Add kit to cart" : "Next"}</PrimaryButton></div>
    </div>
  );
}

export function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 sm:py-16 lg:px-10">
      <PageIntro title="Your cart" description="Review your products and quantities before checking out." />
      {items.length === 0 ? <div className="rounded-[22px] border border-[#e8e4da] bg-white px-6 py-16 text-center"><h2 className="text-2xl font-bold">Your cart is empty</h2><p className="mt-2 text-[#77766e]">Add products or a ready-made pack to get started.</p><div className="mt-6 flex justify-center gap-3"><Link to="/shop" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white">Shop products</Link><Link to="/kits" className="rounded-full border border-[#dedbd2] px-5 py-3 font-semibold text-[#36523e]">Browse kits</Link></div></div> : <div className="grid gap-7 lg:grid-cols-[1fr_330px]"><div className="space-y-3">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e8e4da] bg-white p-4"><ProductImage product={item} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-40 flex-1"><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-sm text-[#77766e]">{item.unit} · {formatPrice(item.price)} each</p></div><label className="sr-only" htmlFor={`quantity-${item.id}`}>Quantity for {item.name}</label><input id={`quantity-${item.id}`} type="number" min={item.moq} value={item.quantity} onChange={(event) => updateQuantity(item.id, event.target.value)} className="input-field w-24" /><p className="w-24 text-right font-bold">{formatPrice(item.price * item.quantity)}</p><button type="button" onClick={() => removeFromCart(item.id)} className="px-2 text-sm text-[#8f6254] hover:underline">Remove</button></article>)}</div><aside className="h-fit rounded-2xl border border-[#e8e4da] bg-white p-5"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-4 flex justify-between border-b border-[#eeeae2] pb-4 text-sm"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div><p className="mt-4 text-xs leading-5 text-[#77766e]">Delivery is free; no extra checkout charges are added in this demo.</p><Link to="/checkout" className="mt-5 block rounded-full bg-[#36523e] px-5 py-3 text-center font-semibold text-white hover:bg-[#284332]">Continue to checkout</Link></aside></div>}
    </div>
  );
}

export function BulkOrdersPage() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event) { event.preventDefault(); setSubmitted(true); }
  return (
    <div className="bulk-orders-page">
      <section className="about-hero bulk-hero">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10">
          <div className="about-hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-icon" aria-hidden="true">✳</span>For growing properties</p>
            <h1 className="about-title">Bulk essentials, shaped around your stay.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59677a] sm:text-lg">
              Tell us what your property needs. Request larger quantities, branded guest essentials, or a restock plan built for your rooms.
            </p>
            <div className="about-tags">
              <span><i aria-hidden="true" />Flexible quantities</span>
              <span><i aria-hidden="true" />Custom branding options</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/bulk-orders#bulk-request" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(0,143,132,.2)] transition hover:-translate-y-0.5 hover:shadow-lg">Start a quote <span className="cta-arrow" aria-hidden="true">↘</span></Link>
              <Link to="/kits" className="rounded-full border border-white bg-white/75 px-5 py-3 font-semibold text-[#292a25] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">Browse restock kits</Link>
            </div>
          </div>
          <div className="about-photo-stage">
            <span className="about-photo-orbit" aria-hidden="true" />
            <img src="/images/welcome-kit.png" alt="Example of a branded hospitality welcome kit prepared for guests" />
            <div className="about-photo-caption">
              <span className="about-photo-star" aria-hidden="true">✦</span>
              <span><strong>Make it your property’s own</strong><small>Explore custom branded guest essentials</small></span>
            </div>
            <span className="about-photo-sticker">Made for your rooms</span>
          </div>
        </div>
      </section>

      <section className="bulk-order-content mx-auto grid max-w-[1320px] gap-6 px-5 py-14 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
        <aside className="about-story-card bulk-how-card">
          <p className="eyebrow">A simple process</p>
          <h2 className="section-title">From your brief to a clearer restock.</h2>
          <div className="about-plan-list">
            {[
              ["01", "Tell us what you need", "Share products, room counts, quantities, and timing."],
              ["02", "We prepare a quote", "Your request is reviewed for quantities and availability."],
              ["03", "Confirm the details", "Agree on the final products, branding, pricing, and delivery."],
            ].map(([number, title, description]) => (
              <div className="about-plan-step" key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </div>
            ))}
          </div>
          <p className="bulk-preview-note">This frontend preview does not send your request to a supplier.</p>
        </aside>

        <div id="bulk-request" className="bulk-form-shell">
          <div className="bulk-form-heading">
            <p className="eyebrow">Your quotation request</p>
            <h2>Tell us about your property.</h2>
            <p>Required fields are marked by the browser. Add as much detail as you have.</p>
          </div>
          {submitted ? (
            <div role="status" className="bulk-success-state">
              <span aria-hidden="true">✓</span>
              <h3>Thanks — your quotation request is ready.</h3>
              <p>This preview does not send data to a supplier. Our team would follow up using your contact details.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bulk-form-grid">
              {[["Property / company name", "text"], ["Contact person", "text"], ["Email", "email"], ["Phone / WhatsApp", "tel"]].map(([label, type]) => (
                <label key={label} className="text-sm font-semibold">{label}<input required type={type} className="input-field mt-2" /></label>
              ))}
              <label className="text-sm font-semibold sm:col-span-2">Required products<textarea required placeholder="e.g. 200 bath towels, 500 shampoo bottles, 300 slippers" rows="3" className="input-field mt-2" /></label>
              <label className="text-sm font-semibold">Approximate quantities / rooms<input required className="input-field mt-2" placeholder="e.g. 12 rooms, monthly" /></label>
              <label className="text-sm font-semibold">Expected delivery date<input type="date" className="input-field mt-2" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Logo upload (for branded products)<input type="file" accept=".png,.svg,.pdf" className="input-field mt-2" /><span className="mt-1 block text-xs font-normal text-[#77766e]">PNG, SVG or PDF. Preview only: the file is not uploaded.</span></label>
              <label className="text-sm font-semibold sm:col-span-2">Special requirements<textarea rows="3" className="input-field mt-2" /></label>
              <div className="sm:col-span-2"><PrimaryButton type="submit">Request quotation <span aria-hidden="true">↗</span></PrimaryButton></div>
            </form>
          )}
        </div>
      </section>

      <QuoteSection eyebrow="For thoughtful operators" title="Good supply makes good hosting easier." description="Original StaySupply thoughts on planning ahead and keeping guest essentials close at hand." quotes={bulkQuotes} />
    </div>
  );
}

const kitQuotes = [
  { text: "The right kit saves time without cutting corners on the welcome.", label: "Ready for the next arrival" },
  { text: "A clear list today makes tomorrow’s restock feel easy.", label: "Know what is in every pack" },
  { text: "Start with what your rooms need, then make the details your own.", label: "Your property, your rhythm" },
];

const bulkQuotes = [
  { text: "The best bulk order is the one that fits the way your property actually runs.", label: "Quantities that make sense" },
  { text: "A little planning keeps the essentials ready for every arrival.", label: "Plan ahead with confidence" },
  { text: "Your welcome can carry your signature, right down to the details.", label: "Make the experience your own" },
];

const shopQuotes = [
  { text: "Good hosting starts with having the right essentials close at hand.", label: "The details guests notice" },
  { text: "Small things, stocked well, make every arrival feel expected.", label: "Ready for the next stay" },
  { text: "Thoughtful supplies help the day run smoothly behind the scenes.", label: "Care in every room" },
];

const aboutQuotes = [
  {
    text: "The best hospitality begins before check-in—with care in every detail.",
    label: "The work before the welcome",
  },
  {
    text: "A well-stocked room is a promise that someone thought ahead.",
    label: "Preparation is a kind of care",
  },
  {
    text: "When the essentials feel effortless, guests remember how the stay felt.",
    label: "Make the stay feel easy",
  },
];

export function AboutPage() {
  const plans = [
    ["01", "Start with the essentials", "A considered marketplace and custom restock kits for everyday guest needs."],
    ["02", "Make reordering simpler", "Property profiles, repeat procurement, and clearer inventory visibility."],
    ["03", "Build for the whole operation", "A longer-term vision for procurement, consumption, teams, and suppliers."],
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10">
          <div className="about-hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-icon" aria-hidden="true">✳</span>Our story</p>
            <h1 className="about-title">Hospitality is the art of making people <span>feel at home.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59677a] sm:text-lg">
              StaySupply is building a simpler way for Airbnb hosts, homestays, and boutique hotels in India to source and restock the essentials behind a thoughtful stay.
            </p>
            <div className="about-tags">
              <span><i aria-hidden="true" /> Jaipur-first pilot</span>
              <span><i aria-hidden="true" /> Made for thoughtful hosts</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/kits" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(0,143,132,.2)] transition hover:-translate-y-0.5 hover:shadow-lg">Explore restock kits <span className="cta-arrow" aria-hidden="true">↗</span></Link>
              <Link to="/contact" className="rounded-full border border-white bg-white/75 px-5 py-3 font-semibold text-[#292a25] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">Get in touch</Link>
            </div>
          </div>

          <div className="about-photo-stage">
            <span className="about-photo-orbit" aria-hidden="true" />
            <img src="/images/welcome-kit.png" alt="A curated StaySupply welcome set with a branded bottle, notebook, and travel accessories" />
            <div className="about-photo-caption">
              <span className="about-photo-star" aria-hidden="true">✦</span>
              <span><strong>A warmer welcome</strong><small>Thoughtful essentials, ready for arrival</small></span>
            </div>
            <span className="about-photo-sticker">The details make the stay</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-5 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:px-10">
        <article className="about-story-card about-problem-card">
          <span className="about-section-mark" aria-hidden="true">01</span>
          <p className="eyebrow">The challenge</p>
          <h2 className="section-title">Great stays take a lot of little jobs.</h2>
          <ul className="about-problem-list">
            <li>Essentials come from too many suppliers.</li>
            <li>Quality, pricing, and quantities can change with every order.</li>
            <li>Small properties need flexible restocks—not warehouse-sized minimums.</li>
            <li>When supplies run out, routine work becomes an emergency.</li>
          </ul>
        </article>

        <article className="about-story-card about-plan-card">
          <span className="about-section-mark" aria-hidden="true">02</span>
          <p className="eyebrow">Our direction</p>
          <h2 className="section-title">Make restocking feel like one less thing.</h2>
          <div className="about-plan-list">
            {plans.map(([number, title, description]) => (
              <div className="about-plan-step" key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <QuoteSection eyebrow="A few thoughts on hospitality" title="Care is in the details." description="Original StaySupply thoughts on the work that makes a stay feel special." quotes={aboutQuotes} className="about-quote-section" />

      <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-10">
        <p className="text-xs text-[#89877f]">StaySupply is a working name; trademark and domain checks are pending.</p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signInDemo } = useDemoData();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Sorry, we couldn't find a valid email address. Check it and try again.");
      return;
    }

    setError("");
    const result = signInDemo(normalizedEmail);
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate("/account");
  }

  return (
    <AuthShell title="Welcome back">
      <p className="mt-2 text-sm leading-6 text-[#77766e]">Enter the email address on your account. No verification code is needed.</p>
      <form noValidate onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Email
          <input type="email" required maxLength="254" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} className="input-field mt-2" />
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#f7e9e5] px-4 py-3 text-sm text-[#985344]">{error}</p>}
        <PrimaryButton type="submit" className="w-full">Log in</PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-[#77766e]">New here? <Link to="/signup" className="font-semibold text-[#36523e]">Create an account</Link></p>
    </AuthShell>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useDemoData();
  const [form, setForm] = useState({ name: "", email: "", propertyType: "" });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Enter your full name to create an account.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Sorry, we couldn't find a valid email address. Check it and try again.");
      return;
    }
    if (!form.propertyType) {
      setError("Choose your property type to continue.");
      return;
    }

    const result = registerCustomer({
      name: form.name,
      email: form.email,
      propertyType: form.propertyType,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate("/account", { replace: true, state: { welcome: true } });
  }

  return (
    <AuthShell title="Create your account">
      <p className="mt-2 text-sm leading-6 text-[#77766e]">Create your profile with a valid email address. No verification code is needed.</p>
      <form noValidate onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Full name
          <input type="text" required minLength="2" maxLength="80" autoComplete="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} className="input-field mt-2" />
        </label>
        <label className="block text-sm font-semibold">Email
          <input type="email" required maxLength="254" autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="input-field mt-2" />
        </label>
        <label className="block text-sm font-semibold">Property type
          <select required value={form.propertyType} onChange={(event) => updateField("propertyType", event.target.value)} className="input-field select-field mt-2">
            <option value="">Select your property type</option>
            <option>Airbnb</option><option>Homestay</option><option>Boutique Hotel</option><option>Serviced Apartment</option>
          </select>
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#f7e9e5] px-4 py-3 text-sm text-[#985344]">{error}</p>}
        <p className="text-xs leading-5 text-[#88867d]">We check the email format only. Profile data is saved locally in this demo.</p>
        <PrimaryButton type="submit" className="w-full">Create account</PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-[#77766e]">Already registered? <Link to="/login" className="font-semibold text-[#36523e]">Log in</Link></p>
    </AuthShell>
  );
}

function AuthShell({ title, children }) {
  return <div className="mx-auto max-w-[480px] px-5 py-14 sm:py-20"><div className="rounded-[24px] border border-[#e8e4da] bg-white p-7 shadow-sm sm:p-9"><h1 className="text-3xl font-bold tracking-tight">{title}</h1>{children}</div></div>;
}

export function AccountPage() {
  return <div className="mx-auto max-w-[1100px] px-5 py-12 sm:py-16 lg:px-10"><p className="mb-5 text-xs text-[#8a877d]">Frontend preview with sample data. Changes you make live in this browser only.</p><PageIntro title="Welcome to StaySupply" description="Here is a snapshot of your properties and orders." /><div className="grid gap-4 sm:grid-cols-3">{[["Total orders", "12", "Sample figure"], ["My properties", "3", ""], ["Recent spend", "₹12,270", "Last orders shown below"]].map(([label, value, note]) => <div key={label} className="rounded-2xl border border-[#e8e4da] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#85837a]">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p>{note && <p className="mt-2 text-xs text-[#85837a]">{note}</p>}</div>)}</div><h2 className="mt-10 text-xl font-bold">Quick actions</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><ActionCard title="Build a kit" text="Customise essentials" link="/build-kit" label="Start" /><ActionCard title="Reorder" text="Repeat a previous purchase" link="/shop" label="Open" /></div><section className="mt-10 rounded-2xl border border-[#e8e4da] bg-white p-6"><h2 className="text-xl font-bold">Recent order</h2><p className="mt-4 text-sm">Order #SS1024 · Haveli Stay, Jaipur</p><p className="mt-1 text-sm text-[#77766e]">22 Oct 2026 · ₹9,770</p><p className="mt-3 inline-flex rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-semibold text-[#48644c]">Delivered</p><p className="mt-4"><Link to="/account/orders" className="text-sm font-semibold text-[#36523e]">All orders →</Link></p></section></div>;
}

function ActionCard({ title, text, link, label }) {
  return <article className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e4da] bg-white p-5"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-[#77766e]">{text}</p></div><Link to={link} className="rounded-full bg-[#edf1ea] px-4 py-2 text-sm font-semibold text-[#36523e]">{label}</Link></article>;
}

export function AdminPage() {
  return <div className="mx-auto max-w-[1200px] px-5 py-12 sm:py-16 lg:px-10"><p className="mb-5 text-xs text-[#8a877d]">Frontend preview with sample data. Changes you make live in this browser only.</p><PageIntro title="Overview" description="Sample figures for the frontend preview." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Total sales", "₹32,318"], ["Today's orders", "1"], ["Pending orders", "3"], ["Total customers", "4"], ["Repeat customers", "2"], ["Low-stock products", "3"], ["Pending quotations", "2"], ["Monthly revenue", "₹91k"]].map(([title, value]) => <div key={title} className="rounded-2xl border border-[#e8e4da] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#85837a]">{title}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>)}</div><section className="mt-9 rounded-2xl border border-[#e8e4da] bg-white p-6"><h2 className="text-lg font-bold">Monthly revenue (₹ thousands)</h2><div className="mt-6 flex h-48 items-end gap-3 border-b border-[#e8e4da] pb-2">{[38,52,47,66,74,91].map((value,index)=><div key={value} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs">{value}</span><div className="w-full rounded-t-lg bg-[#69866a]" style={{height:`${value*1.35}px`}} /><span className="text-xs text-[#77766e]">{["May","Jun","Jul","Aug","Sep","Oct"][index]}</span></div>)}</div></section><section className="mt-8 rounded-2xl border border-[#e8e4da] bg-white p-6"><h2 className="text-lg font-bold">Recent activity (audit log)</h2><ul className="mt-4 space-y-4 text-sm"><li>Changed order SS1026 status to Processing <span className="block text-xs text-[#8a877d]">Admin (Priya) · 2 hours ago</span></li><li>Updated price of Bath Towel 600 GSM Cotton <span className="block text-xs text-[#8a877d]">Admin (Priya) · Yesterday</span></li><li>New quotation request from Haveli Stay <span className="block text-xs text-[#8a877d]">Admin (Priya) · Yesterday</span></li></ul></section><div className="mt-8 flex flex-wrap gap-3"><Link to="/shop" className="rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white">Manage products</Link><Link to="/bulk-orders" className="rounded-full border border-[#dedbd2] px-5 py-3 font-semibold text-[#36523e]">View quotations</Link></div></div>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(event) { event.preventDefault(); setSent(true); }
  const questions = [["Where do you deliver?", "We are currently piloting in Jaipur. Get in touch to discuss delivery to your property."], ["What is the minimum order?", "Minimum order quantities are shown on every product. Many essentials can be ordered in small packs."], ["Can I get GST invoices?", "GST invoicing will be confirmed during checkout once supplier onboarding is complete."], ["How do returns work?", "Please see our shipping and returns information for the preview policy."], ["Are the prices final?", "No. Prices are sample figures for this frontend preview and are subject to supplier confirmation."]];
  return <div className="mx-auto max-w-[1120px] px-5 py-12 sm:py-16 lg:px-10"><PageIntro title="Contact and support" description="Have a question about an order, a product or a custom restock? Send us a message." /><div className="grid gap-8 lg:grid-cols-[1fr_.85fr]"><div>{sent ? <div role="status" className="rounded-2xl bg-[#edf1ea] p-6 text-sm text-[#36523e]">Thanks for reaching out. This preview does not send messages, but your form has been completed.</div> : <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#e8e4da] bg-white p-6"><label className="block text-sm font-semibold">Name<input required className="input-field mt-2" /></label><label className="block text-sm font-semibold">Email<input required type="email" className="input-field mt-2" /></label><label className="block text-sm font-semibold">Topic<select className="input-field select-field mt-2"><option>Product question</option><option>Order support</option><option>Partnership</option></select></label><label className="block text-sm font-semibold">Message<textarea required rows="4" className="input-field mt-2" /></label><PrimaryButton type="submit">Send message</PrimaryButton></form>}<div className="mt-5 rounded-2xl bg-[#f3f0e7] p-5"><p className="font-bold">WhatsApp support</p><p className="mt-1 text-sm text-[#77766e]">Chat for quick order questions. Number to be added at launch.</p><button type="button" disabled className="mt-3 rounded-full border border-[#dedbd2] px-4 py-2 text-sm font-semibold text-[#8a877d]">WhatsApp (coming soon)</button></div></div><section id="faq"><h2 className="text-2xl font-bold">Frequently asked questions</h2><div className="mt-4 divide-y divide-[#e8e4da] rounded-2xl border border-[#e8e4da] bg-white px-5">{questions.map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 text-sm leading-6 text-[#77766e]">{answer}</p></details>)}</div></section></div></div>;
}

export function LegalPage() {
  const { legalPage } = useParams();
  const pages = {
    "shipping-returns": ["Shipping and returns", ["Draft content for the frontend preview, not final legal text.", "Delivery timelines and charges will be confirmed at checkout once our logistics partners are finalised.", "Unopened and undamaged goods may be returned within the window stated on your invoice. Custom-branded products cannot be returned."]],
    terms: ["Terms and conditions", ["This is draft content for the frontend preview, not final legal text.", "Prices and product availability may change while supplier pricing is being confirmed.", "Orders and quotations shown in this preview are sample data and are not submitted to a supplier."]],
    privacy: ["Privacy policy", ["This is draft content for the frontend preview, not final legal text.", "The frontend preview stores cart items in your browser only.", "No account, payment or quotation information is sent to a backend service in this demo."]],
  };
  const [title, paragraphs] = pages[legalPage] || pages.terms;
  return <div className="mx-auto max-w-[850px] px-5 py-14 sm:py-20"><PageIntro title={title} /><article className="space-y-5 rounded-2xl border border-[#e8e4da] bg-white p-7 text-sm leading-7 text-[#686860]">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div>;
}

export function CustomerOrdersPage() {
  return <div className="mx-auto max-w-[1100px] px-5 py-12 sm:py-16 lg:px-10"><PageIntro title="All orders" description="A preview of recent property restocks." /><div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#f3f0e7] text-xs uppercase text-[#77766e]"><tr>{["Order", "Property", "Date", "Total", "Status"].map((item)=><th key={item} className="px-5 py-4">{item}</th>)}</tr></thead><tbody className="divide-y divide-[#eeeae2]"><tr><td className="px-5 py-4 font-semibold">SS1024</td><td>Haveli Stay, Jaipur</td><td>22 Oct 2026</td><td>₹9,770</td><td>Delivered</td></tr><tr><td className="px-5 py-4 font-semibold">SS1018</td><td>Haveli Stay, Jaipur</td><td>08 Oct 2026</td><td>₹2,500</td><td>Processing</td></tr></tbody></table></div></div>;
}

export function NotFoundPage() {
  return <div className="mx-auto max-w-[700px] px-5 py-24 text-center"><p className="eyebrow">404 · Page not found</p><h1 className="mt-3 text-4xl font-bold">We couldn't find that page.</h1><p className="mt-3 text-[#77766e]">The link may have changed, or the page may have moved.</p><Link to="/" className="mt-7 inline-flex rounded-full bg-[#36523e] px-5 py-3 font-semibold text-white">Back to home</Link></div>;
}
