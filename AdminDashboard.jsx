import { useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { formatPrice } from "../store/CartContext";
import { useDemoData } from "../store/DemoDataContext";
import { OrderStatus } from "./CustomerDashboard";

const adminRoutes = [
  { path: "/admin", label: "Overview" },
  { path: "/admin/products", label: "Products" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/inventory", label: "Inventory" },
  { path: "/admin/orders", label: "Orders" },
  { path: "/admin/payments", label: "Payments" },
];

const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const productCategories = ["Toiletries", "Bath & Linen", "Pantry", "Housekeeping", "Welcome Kits"];

function Heading({ eyebrow = "StaySupply management", title, description, action }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h1 className="section-title">{title}</h1><p className="mt-2 text-sm text-[#74736d]">{description}</p></div>{action}</div>;
}

function Button({ children, onClick, secondary = false, type = "button" }) {
  return <button type={type} onClick={onClick} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${secondary ? "border border-[#dedbd2] bg-white text-[#36523e] hover:bg-[#f3f0e7]" : "bg-[#36523e] text-white hover:bg-[#284332]"}`}>{children}</button>;
}

export default function AdminDashboard() {
  return (
    <div className="min-h-[65vh] bg-[#f7f5ef] lg:flex">
      <DashboardSidebar routes={adminRoutes} />
      <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e4da] bg-white px-5 py-4">
            <div>
              <p className="text-sm font-bold text-[#292a25]">StaySupply admin</p>
              <p className="mt-1 text-xs text-[#77766e]">Signed in as Avinash · Demo access, this browser only</p>
            </div>
            <Link to="/" className="text-sm font-semibold text-[#36523e] hover:underline">Back to storefront</Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { products, customers, orders, payments } = useDemoData();
  const sales = orders.reduce((total, order) => total + order.total, 0);
  const pending = orders.filter((order) => order.status === "Pending" || order.status === "Processing").length;
  const lowStock = products.filter((product) => product.inventory <= 12).length;
  const verifiedPayments = payments.filter((payment) => payment.status === "Verified");
  const paymentVolume = verifiedPayments.reduce((total, payment) => total + payment.amount, 0);
  return (
    <section>
      <p className="mb-5 rounded-xl border border-[#edd8bd] bg-[#fbf2e7] px-4 py-3 text-sm text-[#80572c]">Demo dashboard: user, order, and payment data is stored only in this browser. It is not a protected admin system.</p>
      <Heading title="Overview" description="Manage the storefront, users, fulfilment and verified checkout activity." action={<Link to="/shop" className="rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white">View storefront</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Order value" value={formatPrice(sales)} note={`${orders.length} sample/demo orders`} />
        <StatCard label="Pending orders" value={pending} note="Awaiting fulfilment" />
        <StatCard label="Users" value={customers.length} note="Stored in this browser" />
        <StatCard label="Active users" value={customers.filter((customer) => customer.active).length} note="Can use demo sign-in" />
        <StatCard label="Low-stock products" value={lowStock} note="At or below 12 units" />
        <StatCard label="Active products" value={products.filter((product) => product.active).length} note={`Across ${productCategories.length} categories`} />
        <StatCard label="Verified payments" value={verifiedPayments.length} note="Recorded in this browser only" />
        <StatCard label="Payment volume" value={formatPrice(paymentVolume)} note="Verified local checkout records" />
      </div>
      <section className="mt-9 rounded-2xl border border-[#e8e4da] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold">Admin tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["/admin/products", "Manage products", `${products.length} catalogue items`],
            ["/admin/users", "Manage users", `${customers.length} browser-local accounts`],
            ["/admin/inventory", "Manage inventory", `${lowStock} low-stock items`],
            ["/admin/orders", "Manage orders", `${orders.length} demo orders`],
            ["/admin/payments", "View payments", `${verifiedPayments.length} locally recorded`],
          ].map(([to, label, note]) => (
            <Link key={to} to={to} className="rounded-xl border border-[#e8e4da] p-4 transition hover:border-[#9aaa91] hover:bg-[#fbf9f5]">
              <span className="font-semibold text-[#36523e]">{label} →</span>
              <span className="mt-1 block text-xs text-[#77766e]">{note}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-9"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Recent orders</h2><Link to="/admin/orders" className="text-sm font-bold text-[#36523e]">Manage orders →</Link></div><OrdersTable rows={orders.slice(0, 4)} /></section>
    </section>
  );
}

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useDemoData();
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const filtered = products.filter((product) => (category === "All categories" || product.category === category) && `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase()));

  function openForm(product) { setForm(product ? { ...product } : emptyProduct()); setDialog(product ? "edit" : "add"); }
  function save(event) {
    event.preventDefault();
    const values = { ...form, price: Number(form.price), moq: Number(form.moq), inventory: Number(form.inventory), image: form.image || "/images/toiletries.svg", description: form.description || `${form.name} for hospitality properties.` };
    if (dialog === "edit") updateProduct(form.id, values);
    else addProduct(values);
    setDialog(null);
  }
  function remove(product) {
    if (window.confirm(`Remove ${product.name} from the product catalogue?`)) deleteProduct(product.id);
  }

  return (
    <section>
      <Heading title="Products" description={`${products.length} items in the StaySupply catalogue.`} action={<Button onClick={() => openForm()}>+ Add product</Button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input aria-label="Search products" placeholder="Search products or SKU" value={query} onChange={(event) => setQuery(event.target.value)} className="input-field" /><select aria-label="Filter product category" value={category} onChange={(event) => setCategory(event.target.value)} className="input-field select-field sm:w-56"><option>All categories</option>{productCategories.map((item) => <option key={item}>{item}</option>)}</select></div>
      <p className="mb-4 text-sm text-[#77766e]">{filtered.length} products</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-[#e8e4da] bg-white shadow-sm"><Link to={`/shop/${product.id}`}><img src={product.image} alt={`${product.category} illustration`} className="h-40 w-full object-cover" loading="lazy" /></Link><div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#70836d]">{product.category} · {product.tier}</p><h2 className="mt-1 font-bold">{product.name}</h2><p className="mt-1 text-xs text-[#77766e]">{product.sku} · {product.unit}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.active ? "bg-[#eaf0e8] text-[#48644c]" : "bg-[#f0eee7] text-[#77766e]"}`}>{product.active ? "Active" : "Hidden"}</span></div><div className="mt-4 flex items-center justify-between"><p className="font-bold">{formatPrice(product.price)} <span className="text-xs font-normal text-[#77766e]">· stock {product.inventory}</span></p><span className="text-xs text-[#77766e]">MOQ {product.moq}</span></div><div className="mt-4 flex gap-2 border-t border-[#eeeae2] pt-3"><Button secondary onClick={() => openForm(product)}>Edit</Button><Button secondary onClick={() => updateProduct(product.id, { active: !product.active })}>{product.active ? "Hide" : "Publish"}</Button><Button secondary onClick={() => remove(product)}>Remove</Button></div></div></article>)}</div>
      {filtered.length === 0 && <Empty title="No products found" text="Try a different search or category." />}
      {dialog && <Dialog title={dialog === "edit" ? "Edit product" : "Add product"} onClose={() => setDialog(null)}><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><Field label="Product name" value={form.name} onChange={(name) => setForm({ ...form, name })} required /><label className="text-sm font-semibold">Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input-field select-field mt-2"><option value="">Select category</option>{productCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold">Tier<select value={form.tier} onChange={(event) => setForm({ ...form, tier: event.target.value })} className="input-field select-field mt-2">{["Standard", "Premium", "Luxury"].map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Price (₹)" type="number" min="1" value={form.price} onChange={(price) => setForm({ ...form, price })} required /><Field label="Unit / pack size" value={form.unit} onChange={(unit) => setForm({ ...form, unit })} required /><Field label="Minimum order quantity" type="number" min="1" value={form.moq} onChange={(moq) => setForm({ ...form, moq })} required /><Field label="Inventory quantity" type="number" min="0" value={form.inventory} onChange={(inventoryValue) => setForm({ ...form, inventory: inventoryValue })} required /><div className="sm:col-span-2"><Field label="SKU" value={form.sku} onChange={(sku) => setForm({ ...form, sku })} required /></div><div className="sm:col-span-2"><label className="text-sm font-semibold">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="2" className="input-field mt-2" /></label></div><div className="flex justify-end gap-2 pt-2 sm:col-span-2"><Button secondary onClick={() => setDialog(null)}>Cancel</Button><Button type="submit">{dialog === "edit" ? "Save changes" : "Create product"}</Button></div></form></Dialog>}
    </section>
  );
}

export function AdminCustomers() {
  const { customers, updateCustomer, orders } = useDemoData();
  const [query, setQuery] = useState("");
  const filtered = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.propertyType}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section>
      <Heading title="Users" description={`${customers.length} customer accounts saved in this browser. Pause or reactivate demo sign-in access.`} />
      <input aria-label="Search users" placeholder="Search name, email or property type" value={query} onChange={(event) => setQuery(event.target.value)} className="input-field mb-5 max-w-xl" />
      <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f3f0e7] text-xs uppercase text-[#77766e]"><tr>{["User", "Property type", "Joined", "Orders", "Lifetime value", "Status", "Actions"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr></thead><tbody className="divide-y divide-[#eeeae2]">{filtered.map((customer) => { const total = orders.filter((order) => order.customerId === customer.id).reduce((sum, order) => sum + order.total, 0); return <tr key={customer.id}><td className="px-4 py-4"><p className="font-semibold">{customer.name}</p><p className="text-xs text-[#77766e]">{customer.email}</p></td><td className="px-4 py-4">{customer.propertyType}</td><td className="px-4 py-4">{customer.joined}</td><td className="px-4 py-4">{customer.orders}</td><td className="px-4 py-4 font-semibold">{formatPrice(total)}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${customer.active ? "bg-[#eaf0e8] text-[#48644c]" : "bg-[#f0eee7] text-[#77766e]"}`}>{customer.active ? "Active" : "Paused"}</span></td><td className="px-4 py-4"><Button secondary onClick={() => updateCustomer(customer.id, { active: !customer.active })}>{customer.active ? "Pause" : "Activate"}</Button></td></tr>; })}</tbody></table></div>
      {filtered.length === 0 && <Empty title="No users found" text="Try another search." />}
    </section>
  );
}

export function AdminPayments() {
  const { payments } = useDemoData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => payments.filter((payment) =>
      `${payment.paymentId} ${payment.orderId} ${payment.customerName} ${payment.customerEmail}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    [payments, query],
  );
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <section>
      <Heading title="Payments" description="Locally recorded payments after checkout signature verification." />
      <p className="mb-5 rounded-xl border border-[#edd8bd] bg-[#fbf2e7] px-4 py-3 text-sm text-[#80572c]">
        This is browser-local demo history, not a live Razorpay transaction feed. Records are visible only in this browser and can be cleared with its site data.
      </p>
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <StatCard label="Verified payments" value={payments.length} note="Successful checkouts recorded here" />
        <StatCard label="Recorded payment total" value={formatPrice(total)} note="Not a settlement or payout report" />
      </div>
      <input aria-label="Search payments" placeholder="Search payment, order, customer or email" value={query} onChange={(event) => setQuery(event.target.value)} className="input-field mb-5 max-w-xl" />
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#f3f0e7] text-xs uppercase text-[#77766e]">
              <tr>{["Payment", "Order", "Customer", "Date", "Amount", "Status"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#eeeae2]">
              {filtered.map((payment) => (
                <tr key={payment.paymentId}>
                  <td className="px-4 py-4 font-mono text-xs">{payment.paymentId}</td>
                  <td className="px-4 py-4 font-mono text-xs">{payment.orderId}</td>
                  <td className="px-4 py-4"><p className="font-semibold">{payment.customerName}</p><p className="text-xs text-[#77766e]">{payment.customerEmail}</p></td>
                  <td className="px-4 py-4">{new Date(payment.recordedAt).toLocaleString()}</td>
                  <td className="px-4 py-4 font-semibold">{formatPrice(payment.amount)}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-semibold text-[#48644c]">{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={query ? "No payments found" : "No verified payments yet"} text={query ? "Try another search." : "Verified checkouts made from this browser will appear here. This page does not load payment history from Razorpay."} />
      )}
    </section>
  );
}

export function AdminInventory() {
  const { products, updateProduct } = useDemoData();
  const [query, setQuery] = useState("");
  const filtered = products.filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const lowCount = products.filter((product) => product.inventory <= 12).length;
  return (
    <section>
      <Heading title="Inventory" description="Monitor stock levels and update product quantities." />
      <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_220px]"><input aria-label="Search inventory" placeholder="Search product or SKU" value={query} onChange={(event) => setQuery(event.target.value)} className="input-field" /><div className="rounded-xl border border-[#edd8bd] bg-[#fbf2e7] px-4 py-3 text-sm text-[#93612c]"><strong>{lowCount}</strong> items at or below 12 units</div></div>
      <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f3f0e7] text-xs uppercase text-[#77766e]"><tr>{["Product", "SKU", "Category", "Stock level", "Availability", "Update stock"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr></thead><tbody className="divide-y divide-[#eeeae2]">{filtered.map((product) => <tr key={product.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-11 w-11 rounded-lg object-cover" /><div><p className="font-semibold">{product.name}</p><p className="text-xs text-[#77766e]">{product.unit}</p></div></div></td><td className="px-4 py-4">{product.sku}</td><td className="px-4 py-4">{product.category}</td><td className="px-4 py-4"><span className={`font-bold ${product.inventory <= 12 ? "text-[#a5682b]" : "text-[#36523e]"}`}>{product.inventory} units</span></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.inventory <= 12 ? "bg-[#fbf2e7] text-[#93612c]" : "bg-[#eaf0e8] text-[#48644c]"}`}>{product.inventory <= 12 ? "Low stock" : "In stock"}</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" aria-label={`Decrease ${product.name} inventory`} onClick={() => updateProduct(product.id, { inventory: Math.max(0, product.inventory - 1) })} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dedbd2]">−</button><button type="button" onClick={() => updateProduct(product.id, { inventory: product.inventory + 1 })} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dedbd2]" aria-label={`Increase ${product.name} inventory`}>+</button><button type="button" onClick={() => updateProduct(product.id, { inventory: product.inventory + 10 })} className="rounded-lg border border-[#dedbd2] px-2 py-1.5 text-xs font-semibold text-[#36523e]">+10 restock</button></div></td></tr>)}</tbody></table></div>
    </section>
  );
}

export function AdminOrders() {
  const { orders, updateOrder } = useDemoData();
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => orders.filter((order) => (statusFilter === "All statuses" || order.status === statusFilter) && `${order.id} ${order.customer} ${order.property}`.toLowerCase().includes(query.toLowerCase())), [orders, statusFilter, query]);
  return (
    <section>
      <Heading title="Orders" description="Review customer orders and update fulfilment status." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input aria-label="Search orders" placeholder="Search order, customer or property" value={query} onChange={(event) => setQuery(event.target.value)} className="input-field" /><select aria-label="Filter order status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field select-field sm:w-52"><option>All statuses</option>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
      <OrdersTable rows={filtered} onStatusChange={updateOrder} />
      {filtered.length === 0 && <Empty title="No matching orders" text="Try a different status or search." />}
    </section>
  );
}

function OrdersTable({ rows, onStatusChange }) {
  const { products } = useDemoData();
  return <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-[#f3f0e7] text-xs uppercase tracking-wide text-[#77766e]"><tr>{["Order", "Customer", "Property", "Items", "Date", "Total", "Status"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr></thead><tbody className="divide-y divide-[#eeeae2]">{rows.map((order) => <tr key={order.id}><td className="px-4 py-4 font-semibold text-[#36523e]">#{order.id}</td><td className="px-4 py-4">{order.customer}</td><td className="px-4 py-4">{order.property}</td><td className="px-4 py-4"><div className="group relative cursor-help">{order.lines.reduce((sum, line) => sum + line.quantity, 0)} items<span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-xl bg-[#292a25] p-3 text-xs leading-5 text-white shadow-lg group-hover:block">{order.lines.map((line) => `${products.find((product) => product.id === line.productId)?.name || "Product removed"} × ${line.quantity}`).join(" · ")}</span></div></td><td className="px-4 py-4">{order.date}</td><td className="px-4 py-4 font-semibold">{formatPrice(order.total)}</td><td className="px-4 py-4">{onStatusChange ? <select aria-label={`Status for order ${order.id}`} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)} className="input-field select-field min-w-36 py-2 text-xs">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select> : <OrderStatus status={order.status} />}</td></tr>)}</tbody></table></div>;
}

function StatCard({ label, value, note }) {
  return <article className="rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-sm"><p className="text-sm text-[#77766e]">{label}</p><p className="mt-3 text-3xl font-bold text-[#292a25]">{value}</p><p className="mt-2 text-xs text-[#85837a]">{note}</p></article>;
}

function Empty({ title, text }) {
  return <div className="rounded-2xl border border-dashed border-[#d8d4c9] bg-white px-6 py-12 text-center"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm text-[#77766e]">{text}</p></div>;
}

function Dialog({ title, children, onClose }) {
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#242621]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-[#fbf9f5] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 id="admin-dialog-title" className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#efebe3]">×</button></div>{children}</section></div>;
}

function Field({ label, value, onChange, type = "text", required = false, min }) {
  return <label className="block text-sm font-semibold">{label}<input type={type} required={required} min={min} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="input-field mt-2" /></label>;
}

function emptyProduct() {
  return { name: "", category: "", tier: "Standard", price: "", unit: "each", moq: 1, inventory: 0, stock: "In stock", sku: "", description: "", image: "/images/toiletries.svg", active: true };
}
