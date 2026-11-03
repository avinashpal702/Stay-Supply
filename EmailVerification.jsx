
import { useState, useEffect } from "react";
import "./EmailVerification.css";

export default function EmailVerification({ onVerified }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setTimeout(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendOTP = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to send OTP.");
      }

      setOtpSent(true);
      setOtp("");
      setResendTimer(60);
      setMessage("OTP sent successfully! Check your email inbox.");
    } catch (err) {
      setError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.verified !== true) {
        throw new Error(
          data.message || data.error || "Invalid or expired OTP."
        );
      }

      setVerified(true);
      setMessage("Your email has been verified successfully!");

      if (typeof onVerified === "function") {
        onVerified(email.trim());
      }
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setMessage("");
    setResendTimer(0);
  };

  return (
    <div className="email-verification">
      <div className="verification-card">
        <div className="verification-icon">
          {verified ? "✓" : "✉"}
        </div>

        <h2>
          {verified ? "Email Verified" : "Verify Your Email"}
        </h2>

        <p className="verification-description">
          {verified
            ? "Your email address has been successfully verified."
            : "Enter your email address to receive a one-time verification code."}
        </p>

        {!verified && (
          <>
            <label htmlFor="verification-email">Email Address</label>

            <input
              id="verification-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={otpSent || loading}
              autoComplete="email"
              required
            />

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </button>
            ) : (
              <>
                <label htmlFor="verification-otp">
                  Enter 6-Digit OTP
                </label>

                <input
                  id="verification-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <div className="verification-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={sendOTP}
                    disabled={loading || resendTimer > 0}
                  >
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    className="text-button"
                    onClick={changeEmail}
                    disabled={loading}
                  >
                    Change Email
                  </button>
                </div>

                <p className="otp-hint">
                  The OTP expires after 10 minutes.
                </p>
              </>
            )}
          </>
        )}

        {message && (
          <p className="verification-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="verification-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
