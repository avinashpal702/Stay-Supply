import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import products from "../data/product.json";
import { getOrderStageIndex, normalizeOrderStatus, ORDER_TIMELINE } from "../data/orderTracking";
import { formatPrice } from "../store/CartContext";
import { useDemoData } from "../store/DemoDataContext";

const customerRoutes = [
  { path: "/account", label: "Overview" },
  { path: "/account/properties", label: "My properties" },
  { path: "/account/restock", label: "Stock & restock" },
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
            <button type="button" onClick={() => { signOutDemo(); navigate("/login"); }} className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-[#36523e] transition hover:bg-[#e4f6f3] hover:text-[#008f84]">Log out</button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function CustomerOverview() {
  const { currentUser, properties: allProperties, orders: allOrders, propertyInventory, products } = useDemoData();
  const location = useLocation();
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const properties = allProperties.filter((property) => property.customerId === currentUser?.id);
  const orders = allOrders.filter((order) => order.customerId === currentUser?.id);
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId);
  const visibleProperties = selectedProperty ? [selectedProperty] : properties;
  const visiblePropertyIds = new Set(visibleProperties.map((property) => property.id));
  const visibleOrders = orders.filter((order) => {
    const associatedProperty = properties.find((property) => order.propertyId === property.id || order.property === property.name);
    return selectedPropertyId === "all" || associatedProperty?.id === selectedPropertyId;
  });
  const recentOrders = visibleOrders.slice(0, 3);
  const totalSpend = visibleOrders.reduce((total, order) => total + order.total, 0);
  const openOrders = visibleOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length;
  const trackedInventory = propertyInventory.filter((entry) => visiblePropertyIds.has(entry.propertyId));
  const lowStock = trackedInventory.filter((entry) => entry.onHand <= entry.reorderAt);
  const rooms = visibleProperties.reduce((total, property) => total + Number(property.rooms || 0), 0);
  const guestCapacity = visibleProperties.reduce((total, property) => total + Number(property.guests || 0), 0);
  const plannerPropertyId = selectedPropertyId === "all" ? properties[0]?.id : selectedPropertyId;

  return (
    <div>
      {location.state?.welcome && <div role="status" className="mb-5 rounded-xl border border-[#d9e3d6] bg-[#edf1ea] px-4 py-3 text-sm text-[#36523e]">Your demo account is ready. Welcome to StaySupply, {currentUser?.name}!</div>}
      <p className="mb-5 text-xs text-[#8a877d]">Frontend preview with sample data. Your changes are saved in this browser.</p>
      <DashboardHeading
        title={`Welcome${currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : " to StaySupply"}`}
        description="A property-level view of your orders, spend, and restock needs."
        action={properties.length > 1 && (
          <label className="dashboard-property-filter">
            <span>View property</span>
            <select value={selectedPropertyId} onChange={(event) => setSelectedPropertyId(event.target.value)} className="input-field select-field">
              <option value="all">All properties</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          </label>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Properties" value={visibleProperties.length} note={selectedProperty?.name || "Across your portfolio"} />
        <StatCard label="Rooms / guest capacity" value={`${rooms} / ${guestCapacity}`} note="Total capacity" />
        <StatCard label="Open orders" value={openOrders} note={`${visibleOrders.length} orders in view`} />
        <StatCard label="Restock alerts" value={lowStock.length} note="At or below property reorder level" />
        <StatCard label="Order spend" value={formatPrice(totalSpend)} note="Across selected properties" />
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <QuickAction title="Manage properties" text="Maintain locations, room counts, and guest capacity." to="/account/properties" label="View properties" />
        <QuickAction title="Plan restocks" text="Set stock levels and reorder thresholds by property." to={plannerPropertyId ? `/account/restock?property=${plannerPropertyId}` : "/account/restock"} label="Open planner" />
      </div>
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Your portfolio</p><h2 className="section-title">Properties at a glance</h2></div>
          <Link to="/account/properties" className="text-sm font-bold text-[#36523e] hover:underline">Manage properties →</Link>
        </div>
        {visibleProperties.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleProperties.map((property) => {
              const propertyOrders = orders.filter((order) => order.propertyId === property.id || order.property === property.name);
              const propertySpend = propertyOrders.reduce((total, order) => total + order.total, 0);
              const propertyAlerts = propertyInventory.filter((entry) => entry.propertyId === property.id && entry.onHand <= entry.reorderAt).length;
              return (
                <article key={property.id} className="customer-property-card">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-bold uppercase tracking-wider text-[#008f84]">{property.type}</p><h3>{property.name}</h3><p className="customer-property-location">{property.location}</p></div>
                    <span className="rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-semibold text-[#48644c]">{property.status}</span>
                  </div>
                  <div className="customer-property-metrics">
                    <span><strong>{property.rooms}</strong> rooms</span>
                    <span><strong>{property.guests}</strong> guests</span>
                    <span><strong>{propertyOrders.length}</strong> orders</span>
                    <span><strong>{formatPrice(propertySpend)}</strong> spend</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={propertyAlerts ? "text-sm font-semibold text-[#93612c]" : "text-sm font-semibold text-[#48644c]"}>{propertyAlerts ? `${propertyAlerts} restock alert${propertyAlerts === 1 ? "" : "s"}` : "Stock levels look good"}</p>
                    <Link to={`/account/restock?property=${property.id}`} className="rounded-full bg-[#36523e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#284332]">Plan restock</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Add your first property" text="Create a property profile to start tracking rooms, orders, and restock needs." action={<Link to="/account/properties" className="inline-flex rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white">Add property</Link>} />}
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Stay ahead</p><h2 className="section-title">Restock attention</h2></div>
          {plannerPropertyId && <Link to={`/account/restock?property=${plannerPropertyId}`} className="text-sm font-bold text-[#36523e] hover:underline">Open stock planner →</Link>}
        </div>
        {lowStock.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {lowStock.slice(0, 4).map((entry) => {
              const product = products.find((item) => item.id === entry.productId);
              const property = allProperties.find((item) => item.id === entry.propertyId);
              if (!product || !property) return null;
              return (
                <article key={`${entry.propertyId}-${entry.productId}`} className="restock-alert-card">
                  <div><p className="text-xs font-semibold text-[#93612c]">{property.name}</p><h3>{product.name}</h3><p>{entry.onHand} on hand · reorder at {entry.reorderAt}</p></div>
                  <Link to={`/shop/${product.id}`} className="shrink-0 rounded-full border border-[#d8c29e] px-4 py-2 text-sm font-semibold text-[#805a2f] hover:bg-[#fbf2e7]">View item</Link>
                </article>
              );
            })}
          </div>
        ) : <p className="rounded-2xl border border-[#d9e3d6] bg-[#edf1ea] p-5 text-sm text-[#48644c]">No tracked products are at their reorder level.</p>}
      </section>

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
                <Link to={`/account/restock?property=${property.id}`} className="self-center text-sm font-semibold text-[#008f84] hover:underline">Plan restock →</Link>
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

export function CustomerRestock() {
  const { currentUser, properties: allProperties, propertyInventory, products, updatePropertyInventory } = useDemoData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newProductId, setNewProductId] = useState("");
  const [error, setError] = useState("");
  const properties = allProperties.filter((property) => property.customerId === currentUser?.id);
  const requestedPropertyId = searchParams.get("property");
  const selectedPropertyId = properties.some((property) => property.id === requestedPropertyId)
    ? requestedPropertyId
    : properties[0]?.id || "";
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId);
  const trackedItems = propertyInventory
    .filter((entry) => entry.propertyId === selectedPropertyId)
    .map((entry) => ({ ...entry, product: products.find((product) => product.id === entry.productId) }))
    .filter((entry) => entry.product);
  const availableProducts = products.filter((product) => !trackedItems.some((entry) => entry.productId === product.id));
  const lowStockItems = trackedItems.filter((entry) => entry.onHand <= entry.reorderAt);
  const totalUnits = trackedItems.reduce((total, entry) => total + entry.onHand, 0);

  function updateStock(entry, field, value) {
    if (value === "") return;
    try {
      updatePropertyInventory(selectedPropertyId, entry.productId, { [field]: Number(value) });
      setError("");
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  function addProductToTracking(event) {
    event.preventDefault();
    const product = availableProducts.find((entry) => entry.id === newProductId);
    if (!product) return;
    try {
      updatePropertyInventory(selectedPropertyId, product.id, { onHand: 0, reorderAt: product.moq });
      setNewProductId("");
      setError("");
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <section>
      <DashboardHeading
        title="Stock & restock planner"
        description="Track supplies and set reorder points for each property."
        action={properties.length > 0 && (
          <label className="dashboard-property-filter">
            <span>Property</span>
            <select value={selectedPropertyId} onChange={(event) => setSearchParams({ property: event.target.value })} className="input-field select-field">
              {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          </label>
        )}
      />
      <p className="mb-5 text-xs text-[#8a877d]">Property stock levels are sample data saved in this browser. Update them after each delivery.</p>
      {!selectedProperty ? (
        <EmptyState title="Add a property to start planning" text="Create a property profile, then add the supplies you want to track." action={<Link to="/account/properties" className="inline-flex rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white">Manage properties</Link>} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Tracked products" value={trackedItems.length} note={selectedProperty.name} />
            <StatCard label="Needs restock" value={lowStockItems.length} note="At or below reorder point" />
            <StatCard label="Units on hand" value={totalUnits} note="Across tracked products" />
          </div>
          <form onSubmit={addProductToTracking} className="restock-add-form">
            <label>
              <span>Add a product to this property</span>
              <select required value={newProductId} onChange={(event) => setNewProductId(event.target.value)} className="input-field select-field">
                <option value="">Choose a product</option>
                {availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
              </select>
            </label>
            <button type="submit" disabled={!newProductId} className="rounded-full bg-[#36523e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#284332] disabled:cursor-not-allowed disabled:opacity-50">Track product</button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-[#a34335]">{error}</p>}
          {trackedItems.length ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e8e4da] bg-white shadow-sm">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-[#f3f0e7] text-xs uppercase tracking-wide text-[#77766e]"><tr>{["Product", "On hand", "Reorder at", "Status", "Next step"].map((item) => <th key={item} className="px-4 py-4 font-semibold">{item}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#eeeae2]">
                  {trackedItems.map((entry) => {
                    const needsRestock = entry.onHand <= entry.reorderAt;
                    return (
                      <tr key={entry.productId}>
                        <td className="px-4 py-4"><p className="font-semibold">{entry.product.name}</p><p className="mt-1 text-xs text-[#77766e]">{entry.product.sku} · {entry.product.unit}</p></td>
                        <td className="px-4 py-4"><label className="sr-only" htmlFor={`on-hand-${entry.productId}`}>On hand for {entry.product.name}</label><input id={`on-hand-${entry.productId}`} type="number" min="0" step="1" value={entry.onHand} onChange={(event) => updateStock(entry, "onHand", event.target.value)} className="input-field w-24 py-2" /></td>
                        <td className="px-4 py-4"><label className="sr-only" htmlFor={`reorder-at-${entry.productId}`}>Reorder level for {entry.product.name}</label><input id={`reorder-at-${entry.productId}`} type="number" min="0" step="1" value={entry.reorderAt} onChange={(event) => updateStock(entry, "reorderAt", event.target.value)} className="input-field w-24 py-2" /></td>
                        <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${needsRestock ? "bg-[#fbf2e7] text-[#93612c]" : "bg-[#eaf0e8] text-[#48644c]"}`}>{needsRestock ? "Needs restock" : "In range"}</span></td>
                        <td className="px-4 py-4"><Link to={`/shop/${entry.productId}`} className="font-semibold text-[#36523e] hover:underline">{needsRestock ? "View item →" : "Product details →"}</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="mt-6 rounded-2xl border border-dashed border-[#d8d4c9] bg-white p-8 text-center text-sm text-[#77766e]">No products are being tracked for this property yet. Add one above to create a reorder plan.</p>}
        </>
      )}
    </section>
  );
}

export function CustomerOrders() {
  const { currentUser, orders: allOrders } = useDemoData();
  const orders = allOrders.filter((order) => order.customerId === currentUser?.id);
  return (
    <section>
      <DashboardHeading title="My orders" description="Follow each order from confirmation through delivery." />
      <p className="mb-5 text-xs text-[#8a877d]">Order status and customer requests are saved in this browser preview. Carrier scans are not connected.</p>
      {orders.length ? (
        <div className="space-y-5">
          {orders.map((order) => <OrderTrackingCard key={order.id} order={order} />)}
        </div>
      ) : <EmptyState title="No orders yet" text="Your product and restock kit orders will appear here." action={<Link to="/shop" className="inline-flex rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white">Browse products</Link>} />}
    </section>
  );
}

function OrderTrackingCard({ order }) {
  const { submitOrderRequest } = useDemoData();
  const [requestType, setRequestType] = useState("");
  const [reason, setReason] = useState("");
  const [requestError, setRequestError] = useState("");
  const status = normalizeOrderStatus(order.status);
  const currentStep = getOrderStageIndex(status);
  const hasRequest = Boolean(order.customerRequest);
  const canCancel = !hasRequest && currentStep >= 0 && currentStep < ORDER_TIMELINE.indexOf("Shipped");
  const canReturn = !hasRequest && status === "Delivered";

  function submitRequest(event) {
    event.preventDefault();
    try {
      submitOrderRequest(order.id, requestType, reason);
      setRequestType("");
      setReason("");
      setRequestError("");
    } catch (error) {
      setRequestError(error.message);
    }
  }

  return (
    <article className="order-tracking-card">
      <div className="order-tracking-heading">
        <div>
          <p className="eyebrow">Order tracking</p>
          <h2>#{order.id}</h2>
          <p>Placed {order.date} · {order.property}</p>
        </div>
        <OrderStatus status={status} />
      </div>

      <OrderTimeline status={status} currentStep={currentStep} />

      <div className="order-tracking-details">
        <div><span>Tracking number</span><strong>{order.trackingNumber}</strong></div>
        <div><span>Expected delivery</span><strong>{status === "Delivered" ? "Delivered" : formatOrderDate(order.expectedDelivery)}</strong></div>
        <div><span>Items</span><strong>{order.lines.reduce((total, line) => total + line.quantity, 0)}</strong></div>
        <div><span>Order total</span><strong>{formatPrice(order.total)}</strong></div>
      </div>

      <div className="order-tracking-actions">
        <button type="button" onClick={() => downloadInvoice(order)} className="rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#284332]">Download invoice</button>
        {!hasRequest && canCancel && <button type="button" onClick={() => { setRequestType("Cancellation"); setRequestError(""); }} className="rounded-full border border-[#dedbd2] bg-white px-4 py-2.5 text-sm font-semibold text-[#36523e] transition hover:bg-[#f3f0e7]">Request cancellation</button>}
        {!hasRequest && canReturn && <button type="button" onClick={() => { setRequestType("Return"); setRequestError(""); }} className="rounded-full border border-[#dedbd2] bg-white px-4 py-2.5 text-sm font-semibold text-[#36523e] transition hover:bg-[#f3f0e7]">Request a return</button>}
      </div>
      {hasRequest && (
        <p className="order-request-status" role="status">
          {order.customerRequest.type} request submitted and awaiting review.
        </p>
      )}

      {requestType && (
        <form onSubmit={submitRequest} className="order-request-form">
          <label>
            <span>Reason for {requestType.toLowerCase()}</span>
            <textarea required rows="3" value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          {requestError && <p role="alert" className="text-sm text-[#a34335]">{requestError}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-full bg-[#36523e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#284332]">Submit request</button>
            <button type="button" onClick={() => { setRequestType(""); setReason(""); setRequestError(""); }} className="rounded-full border border-[#dedbd2] px-4 py-2.5 text-sm font-semibold text-[#36523e]">Keep order</button>
          </div>
        </form>
      )}
    </article>
  );
}

function OrderTimeline({ status, currentStep }) {
  if (status === "Cancelled") {
    return <p className="order-cancelled-state" role="status">This order was cancelled. Fulfilment has stopped.</p>;
  }

  return (
    <ol className="order-timeline" aria-label={`Order progress: ${status}`}>
      {ORDER_TIMELINE.map((step, index) => (
        <li key={step} className={`order-timeline-step ${index <= currentStep ? "is-complete" : ""} ${index === currentStep ? "is-current" : ""}`} aria-current={index === currentStep ? "step" : undefined}>
          <span className="order-timeline-marker">{index < currentStep ? "✓" : index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function formatOrderDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "To be confirmed" : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function downloadInvoice(order) {
  const itemRows = order.lines.map((line) => {
    const name = line.productName || products.find((product) => product.id === line.productId)?.name || "Order item";
    return `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(line.quantity)}</td></tr>`;
  }).join("");
  const invoice = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StaySupply invoice ${escapeHtml(order.id)}</title>
  <style>
    body{font:16px/1.5 Arial,sans-serif;color:#172033;max-width:760px;margin:48px auto;padding:0 24px}
    header{border-bottom:3px solid #36523e;padding-bottom:20px;margin-bottom:28px}
    h1{margin:0;color:#36523e}p{margin:8px 0;color:#536075}
    table{width:100%;border-collapse:collapse;margin:28px 0}
    th,td{text-align:left;padding:12px;border-bottom:1px solid #e4e9f0}
    th{background:#f3f6f4}.total{font-size:20px;font-weight:bold;text-align:right}
    button{border:0;border-radius:999px;background:#36523e;color:#fff;padding:12px 18px;font-weight:bold;cursor:pointer}
    @media print{body{margin:0 auto}button{display:none}}
  </style>
</head>
<body>
  <header><p>StaySupply</p><h1>Order invoice</h1></header>
  <p><strong>Invoice / order number:</strong> ${escapeHtml(order.id)}</p>
  <p><strong>Customer:</strong> ${escapeHtml(order.customer)}</p>
  <p><strong>Delivery location:</strong> ${escapeHtml(order.property)}</p>
  <p><strong>Order date:</strong> ${escapeHtml(order.date)}</p>
  <p><strong>Tracking number:</strong> ${escapeHtml(order.trackingNumber)}</p>
  <p><strong>Expected delivery:</strong> ${escapeHtml(formatOrderDate(order.expectedDelivery))}</p>
  <table><thead><tr><th>Item</th><th>Quantity</th></tr></thead><tbody>${itemRows}</tbody></table>
  <p class="total">Order total: ${escapeHtml(formatPrice(order.total))}</p>
  <button type="button" onclick="window.print()">Print / save as PDF</button>
</body>
</html>`;
  const url = window.URL.createObjectURL(new Blob([invoice], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `StaySupply-invoice-${String(order.id).replace(/[^a-z0-9-]/gi, "-")}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
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
  const classes = ["Delivered", "Out for delivery"].includes(status) ? "bg-[#eaf0e8] text-[#48644c]" : ["Pending", "Order placed"].includes(status) ? "bg-[#f8eee0] text-[#9b672d]" : status === "Cancelled" ? "bg-[#f7e9e5] text-[#985344]" : "bg-[#edf0f4] text-[#526077]";
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
