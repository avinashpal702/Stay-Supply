import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { formatPrice } from "../store/CartContext";
import { useDemoData } from "../store/DemoDataContext";

const customerRoutes = [
  { path: "/account", label: "Overview" },
  { path: "/account/properties", label: "My properties" },
  { path: "/account/orders", label: "My orders" },
];

function DashboardHeading({ eyebrow = "Your StaySupply account", title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title">{title}</h1>
        <p className="mt-2 text-sm text-[#74736d]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DashboardButton({ children, onClick, secondary = false, type = "button" }) {
  return <button type={type} onClick={onClick} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${secondary ? "border border-[#dedbd2] bg-white text-[#36523e] hover:bg-[#f3f0e7]" : "bg-[#36523e] text-white hover:bg-[#284332]"}`}>{children}</button>;
}

export default function CustomerDashboard() {
  const { currentUser, signOutDemo } = useDemoData();
  const navigate = useNavigate();

  return (
    <div className="min-h-[65vh] bg-[#f7f5ef] lg:flex">
      <DashboardSidebar routes={customerRoutes} />
      <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-[#e6e1d6] pb-4">
            <p className="truncate text-sm text-[#74736d]">Signed in as <span className="font-semibold text-[#292a25]">{currentUser?.name || "StaySupply guest"}</span></p>
            <button type="button" onClick={() => { signOutDemo(); navigate("/login"); }} className="shrink-0 text-sm font-semibold text-[#36523e] hover:underline">Log out</button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function CustomerOverview() {
  const { currentUser, properties: allProperties, orders: allOrders } = useDemoData();
  const location = useLocation();
  const properties = allProperties.filter((property) => property.customerId === currentUser?.id);
  const orders = allOrders.filter((order) => order.customerId === currentUser?.id);
  const recentOrders = orders.slice(0, 3);
  const totalSpend = orders.reduce((total, order) => total + order.total, 0);

  return (
    <div>
      {location.state?.welcome && <div role="status" className="mb-5 rounded-xl border border-[#d9e3d6] bg-[#edf1ea] px-4 py-3 text-sm text-[#36523e]">Your demo account is ready. Welcome to StaySupply, {currentUser?.name}!</div>}
      <p className="mb-5 text-xs text-[#8a877d]">Frontend preview with sample data. Your changes are saved in this browser.</p>
      <DashboardHeading title={`Welcome${currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : " to StaySupply"}`} description="Here is a snapshot of your properties and recent orders." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={orders.length} note="Across all your properties" />
        <StatCard label="My properties" value={properties.length} note="Manage your property profiles" />
        <StatCard label="Recent spend" value={formatPrice(totalSpend)} note="Based on sample orders" />
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <QuickAction title="Manage properties" text="Add rooms, guest capacity and locations." to="/account/properties" label="View properties" />
        <QuickAction title="Build a kit" text="Customise essentials for your next restock." to="/build-kit" label="Start building" />
      </div>
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold text-[#292a25]">Recent orders</h2><p className="mt-1 text-sm text-[#77766e]">Track the latest restocks for your properties.</p></div>
          <Link to="/account/orders" className="text-sm font-bold text-[#36523e] hover:underline">All orders →</Link>
        </div>
        <OrderTable orders={recentOrders} />
      </section>
    </div>
  );
}

export function CustomerProperties() {
  const { currentUser, properties: allProperties, addProperty, updateProperty, deleteProperty } = useDemoData();
  const properties = allProperties.filter((property) => property.customerId === currentUser?.id);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyProperty);

  function openForm(property) {
    setForm(property ? { ...property } : emptyProperty());
    setDialog(property ? "edit" : "add");
  }

  function saveProperty(event) {
    event.preventDefault();
    const values = { ...form, rooms: Number(form.rooms), guests: Number(form.guests) };
    if (dialog === "edit") updateProperty(form.id, values);
    else addProperty(values);
    setDialog(null);
  }

  return (
    <section>
      <DashboardHeading
        title="My properties"
        description="Manage the homes and rooms you restock with StaySupply."
        action={<DashboardButton onClick={() => openForm()}>+ Add property</DashboardButton>}
      />
      {properties.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <article key={property.id} className="rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-[#70836d]">{property.type}</p><h2 className="mt-1 text-xl font-bold text-[#292a25]">{property.name}</h2><p className="mt-1 text-sm text-[#77766e]">{property.location}</p></div>
                <span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-semibold text-[#48644c]">{property.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f7f5ef] p-3"><p className="text-xs text-[#77766e]">Rooms</p><p className="mt-1 font-bold">{property.rooms}</p></div>
                <div className="rounded-xl bg-[#f7f5ef] p-3"><p className="text-xs text-[#77766e]">Guest capacity</p><p className="mt-1 font-bold">{property.guests}</p></div>
              </div>
              <div className="mt-5 flex gap-2">
                <DashboardButton secondary onClick={() => openForm(property)}>Edit</DashboardButton>
                <DashboardButton secondary onClick={() => deleteProperty(property.id)}>Remove</DashboardButton>
                <Link to="/build-kit" className="ml-auto self-center text-sm font-semibold text-[#36523e] hover:underline">Build a kit →</Link>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No properties yet" text="Add a property profile to start planning your restocks." action={<DashboardButton onClick={() => openForm()}>Add your first property</DashboardButton>} />}

      {dialog && (
        <Dialog title={dialog === "edit" ? "Edit property" : "Add a property"} onClose={() => setDialog(null)}>
          <form onSubmit={saveProperty} className="grid gap-4 sm:grid-cols-2">
            <Field label="Property name" required value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <label className="text-sm font-semibold">Property type<select required value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="input-field select-field mt-2"><option value="">Select type</option>{["Airbnb", "Homestay", "Boutique Hotel", "Serviced Apartment"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="sm:col-span-2"><Field label="Location" required value={form.location} onChange={(value) => setForm({ ...form, location: value })} /></div>
            <Field label="Number of rooms" type="number" min="1" required value={form.rooms} onChange={(value) => setForm({ ...form, rooms: value })} />
            <Field label="Guest capacity" type="number" min="1" required value={form.guests} onChange={(value) => setForm({ ...form, guests: value })} />
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><DashboardButton secondary onClick={() => setDialog(null)}>Cancel</DashboardButton><DashboardButton type="submit">{dialog === "edit" ? "Save changes" : "Add property"}</DashboardButton></div>
          </form>
        </Dialog>
      )}
    </section>
  );
}

export function CustomerOrders() {
  const { currentUser, orders: allOrders } = useDemoData();
  const orders = allOrders.filter((order) => order.customerId === currentUser?.id);
  return (
    <section>
      <DashboardHeading title="My orders" description="Review order details and track restock progress." />
      {orders.length ? <OrderTable orders={orders} /> : <EmptyState title="No orders yet" text="Your product and restock kit orders will appear here." action={<Link to="/shop" className="inline-flex rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white">Browse products</Link>} />}
    </section>
  );
}

function OrderTable({ orders }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm">
      <table className="w-full min-w-[690px] text-left text-sm">
        <thead className="bg-[#f3f0e7] text-xs uppercase tracking-wide text-[#77766e]"><tr>{["Order", "Property", "Date", "Items", "Total", "Status"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#eeeae2]">
          {orders.map((order) => <tr key={order.id}><td className="px-4 py-4 font-semibold text-[#36523e]">#{order.id}</td><td className="px-4 py-4">{order.property}</td><td className="px-4 py-4">{order.date}</td><td className="px-4 py-4">{order.lines.reduce((total, line) => total + line.quantity, 0)} items</td><td className="px-4 py-4 font-semibold">{formatPrice(order.total)}</td><td className="px-4 py-4"><OrderStatus status={order.status} /></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function OrderStatus({ status }) {
  const classes = status === "Delivered" ? "bg-[#eaf0e8] text-[#48644c]" : status === "Pending" ? "bg-[#f8eee0] text-[#9b672d]" : status === "Cancelled" ? "bg-[#f7e9e5] text-[#985344]" : "bg-[#edf0f4] text-[#526077]";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}

function StatCard({ label, value, note }) {
  return <article className="rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-sm"><p className="text-sm text-[#77766e]">{label}</p><p className="mt-3 text-3xl font-bold text-[#292a25]">{value}</p><p className="mt-2 text-xs text-[#85837a]">{note}</p></article>;
}

function QuickAction({ title, text, to, label }) {
  return <article className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e4da] bg-white p-5"><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-[#77766e]">{text}</p></div><Link to={to} className="shrink-0 rounded-full bg-[#edf1ea] px-4 py-2 text-sm font-semibold text-[#36523e]">{label}</Link></article>;
}

function EmptyState({ title, text, action }) {
  return <div className="rounded-2xl border border-dashed border-[#d8d4c9] bg-white px-6 py-14 text-center"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-[#77766e]">{text}</p><div className="mt-5">{action}</div></div>;
}

function Dialog({ title, children, onClose }) {
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#242621]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[22px] bg-[#fbf9f5] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 id="dialog-title" className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#efebe3]">×</button></div>{children}</section></div>;
}

function Field({ label, value, onChange, type = "text", required = false, min }) {
  return <label className="block text-sm font-semibold">{label}<input type={type} required={required} min={min} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="input-field mt-2" /></label>;
}

function emptyProperty() {
  return { name: "", type: "", location: "", rooms: 1, guests: 2, status: "Active" };
}
