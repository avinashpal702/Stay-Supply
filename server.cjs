require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const products = require("./src/data/product.json");
const packs = require("./src/data/packs.json");

const app = express();
const port = Number(process.env.PORT) || 3001;
const otpLifetimeMs = 10 * 60 * 1000;
const resendWaitMs = 60 * 1000;
const maxAttempts = 5;
const otpSecret = process.env.OTP_SECRET || crypto.randomBytes(32);
const codes = new Map();
const sendWindows = new Map();
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

const productsById = new Map(products.map((product) => [product.id, product]));
const kitPrices = new Map(packs.map((pack) => [`kit-${pack.id}`, pack.price]));

function getCartTotalInRupees(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new Error("Your cart is empty or contains too many items.");
  }

  return items.reduce((total, item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string") {
      throw new Error("The cart contains an invalid product.");
    }
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) {
      throw new Error("The cart contains an invalid quantity.");
    }

    let unitPrice;
    if (productsById.has(item.id)) {
      const product = productsById.get(item.id);
      if (quantity < product.moq) {
        throw new Error(`${product.name} requires a minimum quantity of ${product.moq}.`);
      }
      unitPrice = product.price;
    } else if (kitPrices.has(item.id)) {
      unitPrice = kitPrices.get(item.id);
    } else if (item.id.startsWith("custom-kit-")) {
      if (
        !Array.isArray(item.componentIds) ||
        item.componentIds.length === 0 ||
        item.componentIds.length > products.length ||
        new Set(item.componentIds).size !== item.componentIds.length ||
        item.componentIds.some((id) => !productsById.has(id))
      ) {
        throw new Error("The custom kit contains an invalid product.");
      }
      unitPrice = item.componentIds.reduce((sum, id) => sum + productsById.get(id).price, 0);
    } else {
      throw new Error("The cart contains an unavailable product. Please update your cart.");
    }

    const lineTotal = unitPrice * quantity;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(total + lineTotal)) {
      throw new Error("The cart total is invalid.");
    }
    return total + lineTotal;
  }, 0);
}

app.post("/api/payment/create-order", async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: "Razorpay is not configured on the server." });
  }

  let amount;
  try {
    amount = getCartTotalInRupees(req.body?.items) * 100;
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return res.status(400).json({ error: "The cart total must be at least ₹1." });
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `ss_${Date.now()}`,
      notes: {
        customer_name: String(req.body?.customer?.name || "").slice(0, 100),
        customer_email: String(req.body?.customer?.email || "").slice(0, 100),
        customer_phone: String(req.body?.customer?.contact || "").slice(0, 20),
        shipping_address: String(req.body?.customer?.address || "").slice(0, 200),
        shipping_city: String(req.body?.customer?.city || "").slice(0, 100),
        shipping_pincode: String(req.body?.customer?.pincode || "").slice(0, 10),
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error("Create payment order failed:", error.message);
    return res.status(502).json({ error: "Could not create payment order. Check the Razorpay server configuration and try again." });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ verified: false, error: "Razorpay is not configured on the server." });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpayKeySecret ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        verified: false,
        error: "Payment verification details are missing.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    const valid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!valid) {
      return res.status(400).json({
        verified: false,
        error: "Payment signature verification failed.",
      });
    }

    const [payment, order] = await Promise.all([
      razorpay.payments.fetch(razorpay_payment_id),
      razorpay.orders.fetch(razorpay_order_id),
    ]);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== order.amount ||
      payment.currency !== order.currency ||
      order.amount_paid < order.amount
    ) {
      return res.status(400).json({
        verified: false,
        error: "The payment has not been captured for the full order amount.",
      });
    }

    return res.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification failed:", error.message);
    return res.status(502).json({ verified: false, error: "Unable to verify payment with Razorpay. Please contact support before retrying." });
  }
});

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function codeDigest(code) {
  return crypto.createHmac("sha256", otpSecret).update(code).digest();
}

function rateLimitByIp(ip) {
  const now = Date.now();
  const current = sendWindows.get(ip);
  if (!current || now - current.startedAt >= 60 * 60 * 1000) {
    sendWindows.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 10;
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: password },
  });
}

app.post("/api/auth/send-otp", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!validEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const now = Date.now();
  const previous = codes.get(email);
  if (previous && now - previous.sentAt < resendWaitMs) {
    const retryAfter = Math.ceil((resendWaitMs - (now - previous.sentAt)) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ error: `Please wait ${retryAfter} seconds before requesting another code.` });
  }
  if (rateLimitByIp(req.ip)) {
    return res.status(429).json({ error: "Too many code requests. Please try again later." });
  }

  const transporter = createTransporter();
  if (!transporter) {
    return res.status(503).json({ error: "Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env." });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  try {
    await transporter.sendMail({
      from: `"StaySupply" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your StaySupply verification code",
      text: `Your StaySupply verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your StaySupply verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error("Could not send StaySupply verification email.", error);
    return res.status(502).json({ error: "We couldn't send your verification email. Please try again shortly." });
  }

  codes.set(email, { digest: codeDigest(code), sentAt: now, expiresAt: now + otpLifetimeMs, attempts: 0 });
  return res.json({ message: "A verification code has been sent to your email address." });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!validEmail(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Enter the 6-digit code sent to your email." });
  }

  const challenge = codes.get(email);
  if (!challenge || challenge.expiresAt <= Date.now()) {
    codes.delete(email);
    return res.status(400).json({ error: "That code has expired or was not requested. Please request a new code." });
  }
  if (challenge.attempts >= maxAttempts) {
    codes.delete(email);
    return res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
  }

  challenge.attempts += 1;
  const submittedDigest = codeDigest(code);
  if (!crypto.timingSafeEqual(challenge.digest, submittedDigest)) {
    return res.status(400).json({ error: "That code is incorrect. Please check the email and try again." });
  }

  codes.delete(email);
  return res.json({ verified: true });
});

const host = process.env.HOST || "127.0.0.1";
app.listen(port, host, () => {
  console.log(`StaySupply OTP API listening on http://${host}:${port}`);
});
