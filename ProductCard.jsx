import { Link } from "react-router-dom";
import { formatPrice, useCart } from "../store/CartContext";

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();

  return (
    <article className={`group overflow-hidden rounded-[20px] border border-[#e9e5db] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(47,54,44,.1)] ${compact ? "" : "h-full"}`}>
      <Link to={`/shop/${product.id}`} className="relative block overflow-hidden bg-[#efeee6]">
        <img
          src={product.image}
          alt={`${product.category} illustration`}
          loading="lazy"
          className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${compact ? "h-48" : "h-56"}`}
        />
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.stock === "Low stock" ? "bg-[#f8eee0] text-[#9b672d]" : "bg-[#eaf0e8] text-[#48644c]"}`}>
            {product.stock}
          </span>
          <span className="text-[11px] font-semibold lowercase text-[#8a877d]">{product.tier}</span>
        </div>
        <Link to={`/shop/${product.id}`} className="mt-3 block">
          <h3 className="text-[16px] font-semibold leading-6 text-[#292a25]">{product.name}</h3>
          <p className="mt-1 text-[13px] text-[#77766e]">{product.unit} · MOQ {product.moq}</p>
        </Link>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-bold text-[#292a25]">{formatPrice(product.price)}</p>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="rounded-full border border-[#dcd8ce] px-4 py-2 text-sm font-semibold text-[#36523e] transition hover:border-[#36523e] hover:bg-[#36523e] hover:text-white"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
