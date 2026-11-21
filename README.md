# StaySupply

StaySupply is a hospitality-supply storefront and property restocking demo for homestays, Airbnb hosts, boutique hotels, and serviced apartments. It brings guest essentials, ready-made kits, custom kit building, property-level stock planning, and order follow-up into one responsive web experience.

The project is intentionally a **frontend-focused prototype**. Its catalogue and sample orders are illustrative. Customer accounts, properties, inventory edits, order activity, and payment summaries are stored in the browser rather than a shared production database.

## What the application includes

### Hospitality storefront and visual experience

- A responsive landing page that introduces the service, links to the product categories, highlights sample kits, and explains the restocking flow.
- Category-led shopping for toiletries, bath and linen, pantry supplies, housekeeping products, and welcome kits.
- Restyled Shop, About, Restock Kits, and Bulk Orders pages, with hospitality-focused imagery, original quote sections, product photography, and responsive layouts.
- Product imagery and descriptions intended to help identify the kind of item being sold. Images are representative; exact packaging and supplier products may differ.
- Updated navigation and cart presentation, mobile-friendly layouts, and clearer hover and focus states.
- Contact and quotation forms that demonstrate the intended experience but do not send submissions to a supplier or support team.

### Product discovery and filtering

The Shop page supports:

- Search by product name, SKU, category, or description.
- Category filtering.
- Minimum and maximum price filters in INR.
- Quality filters for Standard, Premium, and Luxury products.
- Availability filters for In stock, Low stock, and Made to order.
- Sorting by featured order, price (low to high or high to low), popularity, and newest.
- Recently viewed products, saved on the current device.
- A result count, clear-filters action, and an empty state when no products match.

Popularity is based on product-detail views recorded in this browser. “Newest” follows the product catalogue sequence because the sample catalogue does not contain publication dates. Availability and prices are sample catalogue values, not a live supplier feed.

### Ready-made packs and custom kit building

- Browse ready-made restock packs, review their listed contents, and add a pack to the cart.
- Start a custom kit from a ready-made pack or build one from scratch.
- Work through a six-step builder covering property type, rooms, guest capacity, budget, product selection, and review.
- Select products, see an estimated total, and add the resulting kit to the cart.
- Product pages show SKU, pack size, minimum order quantity (MOQ), availability, price, and similar products.

The builder is a planning aid for this prototype. It does not create supplier orders or automatically calculate a final property-specific consumption forecast.

### Cart, checkout, and payment

- Add products and kits to the cart, update quantities, remove items, and see an order subtotal.
- Preserve minimum order quantities when customers select product quantities.
- Collect delivery details at checkout and associate an order with one of the customer's saved properties when available.
- Create a server-side Razorpay order using the server catalogue, then verify the payment signature with the API before recording a successful checkout.
- Show the resulting order reference, tracking number, and estimated delivery date after payment.

Razorpay checkout requires server-side test credentials. Do not put secret keys in frontend code. Without a configured Razorpay API, the storefront can still be explored, but checkout cannot complete a real payment.

### Email-only demo accounts

- Sign up with a full name, a validly formatted email address, and a property type. A new account is created immediately without sending or entering a verification code.
- Log in by entering the email address of an existing active demo account. No password or verification code is requested.
- Prevent duplicate account creation and direct existing users to the login page.
- Show an error for malformed email addresses or email addresses that do not match an account at login.

Email validation checks the address's **format only**. Without an email challenge, the application cannot confirm that an inbox exists or that the person entering the address controls it. This email-only flow is for the local demo and is not secure authentication.

Seeded customer emails for trying the demo include:

- `alex.morgan@example.com`
- `jordan.lee@example.com`
- `sam.taylor@example.com`
- `riley.chen@example.com`

New accounts created through the signup page are stored in the current browser and are not shared across devices.

### Customer property-management dashboard

The customer area is designed around the properties being restocked:

- **Overview:** filter the dashboard by property and review rooms, guest capacity, open orders, order spend, and low-stock alerts.
- **Property profiles:** add, edit, or remove property profiles with a name, property type, location, room count, guest capacity, and status.
- **Property-level restock planner:** select a property, add catalogue products to its tracking list, and update on-hand quantities and reorder thresholds.
- **Restock alerts:** identify tracked products at or below their reorder threshold and follow a link to the product.
- **Property-linked orders:** choose a saved property during checkout so that new orders can be included in that property's overview.
- **Order history:** inspect order status and tracking details for the signed-in demo customer.

Property stock is separate from the catalogue-wide inventory shown in the admin area. Both are browser-local sample data; changing one is not a physical warehouse update and does not reserve stock.

### Order tracking and service requests

Customer orders display a six-stage fulfilment timeline:

`Order placed → Confirmed → Packed → Shipped → Out for delivery → Delivered`

Each order includes a demo tracking number, an estimated delivery date, item and total summaries, and an invoice download. The downloaded invoice is an HTML file that can be printed or saved as a PDF from the browser.

Customers can submit:

- A cancellation request while the order is still before **Shipped**.
- A return request after the order is **Delivered**.

Only one request is accepted per order in the demo. Submitted requests and fulfilment changes are stored locally and shown in the admin order view. These are sample status updates, not carrier scans; no courier integration or live location tracking is connected.

### Admin dashboard

The public demo admin area includes:

- An overview of sample order value, pending orders, users, low-stock products, and browser-recorded payment activity.
- Product search and category filters, plus product creation, editing, hiding/publishing, and removal.
- Inventory search and quantity adjustments.
- Customer search and the ability to pause or reactivate demo sign-in access.
- Order search, status filters, and fulfilment status updates using the same order timeline.
- Customer cancellation and return requests attached to their orders.
- Searchable, browser-local records of payments verified by checkout.

The admin route is **not protected by role-based authentication**. Its displayed data is for demonstration only; do not use it to manage real customers, inventory, orders, or financial reporting.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Hospitality storefront landing page |
| `/shop` | Product catalogue, search, filters, and recently viewed products |
| `/shop/:productId` | Product details and add-to-cart |
| `/kits` | Ready-made restock packs |
| `/build-kit` | Step-by-step custom kit builder |
| `/bulk-orders` | Bulk and branded order quotation form preview |
| `/about` | StaySupply story and hospitality information |
| `/contact` | Contact form and FAQ preview |
| `/cart` | Cart contents and subtotal |
| `/checkout` | Delivery details and Razorpay checkout |
| `/login` | Email-only sign-in for existing active demo accounts |
| `/signup` | Create a browser-local account with a validly formatted email |
| `/account` | Customer dashboard overview |
| `/account/properties` | Manage property profiles |
| `/account/restock` | Property-level stock and reorder planner |
| `/account/orders` | Customer order timeline, invoice, and request actions |
| `/admin` | Public demo administration dashboard |
| `/admin/products` | Manage sample catalogue products |
| `/admin/users` | Search and pause/reactivate demo customers |
| `/admin/inventory` | View and adjust catalogue-wide sample inventory |
| `/admin/orders` | Search orders and update fulfilment status |
| `/admin/payments` | Search locally recorded verified payments |

## Technology

- React 18
- Vite 5
- React Router 6
- Tailwind CSS 3 and project-specific CSS
- Express.js API
- Razorpay Node.js SDK and browser checkout
- Nodemailer for the API's optional OTP endpoints

## Project layout

```text
stay-supply/
├── public/
│   ├── data/
│   └── images/
├── src/
│   ├── components/       # Shared storefront and navigation components
│   ├── data/             # Product, kit, and order tracking data
│   ├── pages/            # Storefront, account, and admin pages
│   ├── store/            # Cart, checkout, and browser-local demo state
│   ├── App.jsx           # Application routes
│   ├── index.css
│   └── main.jsx
├── .env.example
├── OTP_SETUP.md          # Optional API OTP endpoint setup
├── package.json
├── server.cjs            # Express payment API and optional OTP endpoints
├── netlify.toml
└── README.md
```

## Run locally

### Requirements

- Node.js 18 or newer
- npm

### Install and start

```bash
npm install
npm run dev
```

The development command starts both the Express API (default port `3001`) and the Vite frontend (default port `5173`). Open the Vite URL printed in the terminal.

You can run only the frontend when exploring the demo:

```bash
npm run dev:web
```

The API is needed for Razorpay payment creation and verification. The current signup and login screens do not call the API's OTP endpoints.

### Available scripts

```bash
npm run dev        # Start API and frontend together
npm run dev:api    # Start the Express API
npm run dev:web    # Start the Vite frontend
npm run build      # Create a production frontend build in dist/
npm run preview    # Preview the production build
npm run start:api  # Start the API without Vite
npm test           # Placeholder; no automated test suite is configured
```

## Environment and API configuration

Browsing the frontend does not require credentials. Copy `.env.example` to `.env` only when configuring API-backed features:

```bash
cp .env.example .env
```

In Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

For Razorpay test checkout, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the API server. Use test-mode credentials first. Keep the secret key in the server environment and never expose it in Vite variables or committed files.

The following variables are also available:

| Variable | Purpose |
| --- | --- |
| `PORT` | Express API port; defaults to `3001` |
| `HOST` | API bind address |
| `FRONTEND_ORIGINS` | Comma-separated allowed browser origins for API CORS |
| `VITE_API_BASE_URL` | Public API origin for a separately hosted frontend; leave empty for local Vite proxying |
| `RAZORPAY_KEY_ID` | Razorpay key ID used by the API and checkout |
| `RAZORPAY_KEY_SECRET` | Private Razorpay secret used only by the API |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `OTP_SECRET` | Used only by the optional API OTP endpoints; not required by the current signup or login UI |

The API still contains OTP send/verify endpoints, but the current customer screens do not use them. See [OTP_SETUP.md](./OTP_SETUP.md) only if you specifically need to configure those standalone endpoints.

## Data, persistence, and demo boundaries

- Cart, demo customer profiles, properties, product edits, property stock, orders, customer requests, and locally recorded payment summaries are saved in browser storage.
- Data is isolated to the browser and site origin where it was created. It is not synchronized to another device or account database.
- Clearing the browser's site data removes the locally saved demo state.
- Product catalogue prices, stock values, order totals, and delivery dates are sample values.
- Contact and bulk quotation forms display a preview confirmation; they do not submit data to a backend or send files.
- The order timeline can be updated in the admin demo, but carrier events are not connected.
- Email-only account access and the public admin page are not production authentication or authorization.
- The optional API keeps OTP challenges in memory. If used, a server restart clears outstanding codes; it is not used by current signup or login.

## Deployment notes

The included `netlify.toml` configures the frontend build and client-side route fallback. Netlify hosts the static frontend; it does not run the Express API. Razorpay checkout requires the API to be deployed separately on a Node.js host.

For a deployed payment demo:

1. Deploy the frontend with `npm run build` and publish `dist/`.
2. Deploy `server.cjs` separately with `npm run start:api`.
3. Configure the Razorpay test credentials on the API host.
4. Set `HOST=0.0.0.0` and `FRONTEND_ORIGINS` to the exact HTTPS frontend origins.
5. Set the frontend's `VITE_API_BASE_URL` to the API's HTTPS origin and rebuild/redeploy the frontend.

The app's accounts, property data, stock planner, orders, and admin data remain browser-local even after deployment. A production service would need persistent server-side storage, real authentication and access control, protected administration, and a proper order/inventory system. For real deployments, also use HTTPS, production rate limits, secure secret management, and appropriate payment-provider configuration.

## License

This repository does not currently include a formal license file.
