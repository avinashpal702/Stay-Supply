# Local email and payment setup

1. Enable 2-Step Verification on the Gmail account that will send verification emails.
2. Create a Google App Password for this application. Use the 16-character App Password, not your Gmail password.
3. Create Razorpay API keys from the Razorpay dashboard. Start with test-mode keys (`rzp_test_...`) so checkout does not collect real payments.
4. Copy `.env.example` to `.env` and set the Gmail credentials, a long random `OTP_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`. Keep `.env` private and never put the Razorpay secret in frontend code.
5. Run `npm run dev`. Vite serves the app and proxies `/api` requests to the API.

Checkout calculates the cart amount on the server from the product catalog, creates a Razorpay order in paise, and verifies the captured payment with Razorpay before showing success. Test with Razorpay test cards. Switch to live keys only when you are ready to accept real payments.

The API expires OTP codes after 10 minutes, limits verification attempts, and throttles resend requests. OTP challenges are held in memory, so restarting the API invalidates outstanding codes. Customer accounts, cart data, and verified payment summaries are stored in browser local storage; payments are recorded only in the browser that completed checkout. The `/admin` dashboard is a public demo with no role-based access control. Do not use it to manage real customer data or treat its payment list as a live Razorpay transaction report. This is not a production authentication or order-management system. When deploying the API on a server, set `HOST=0.0.0.0` and configure HTTPS, protected admin authentication, durable user/order/payment storage, and suitable production rate limiting.
