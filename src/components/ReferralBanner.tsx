import React, { useState } from "react";
import { Settings } from "../types";
import { dbService } from "../services/dbService";

export default function ReferralBanner({ settings, onBookWithCode }: { settings?: Settings; onBookWithCode?: (code: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referrerInput, setReferrerInput] = useState("");
  const [showLookup, setShowLookup] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ 
    countReferred: number; 
    grossEarned: number; 
    totalRedeemed: number; 
    netAvailableBalance: number; 
    codeUsed: string; 
    checked: boolean 
  } | null>(null);

  if (settings?.referralEnabled === false) return null;

  const headline = settings?.referralHeadline || "Refer a Neighbor or Friend — Give ₦1,000, Get ₦1,000!";
  const minOrderAmount = settings?.referralMinOrder || "5000";
  const description = settings?.referralDescription || `Word-of-mouth is our pride. Share your unique phone number referral code with a friend or neighbor in Abuja. When they book any service of ₦${Number(minOrderAmount).toLocaleString()} or more, they get ₦1,000 off, and YOU earn ₦1,000 reward credit!`;
  const discountAmount = settings?.referralDiscountAmount || "1000";
  const codePrefix = settings?.referralCodePrefix || "REF";

  // Build clean personalized referral code based on user's unique phone number input or default
  const cleanPhoneInput = referrerInput.trim().replace(/[^0-9]/g, "");
  const promoCode = cleanPhoneInput ? `${codePrefix}-${cleanPhoneInput}` : `${codePrefix}-08160880608`;

  const shareLink = `${window.location.origin}${window.location.pathname}?ref=${promoCode}`;
  const shareText = `Hey! I use KTT Home & Laundry Services in Abuja. Use my referral link or code *${promoCode}* to get ₦${Number(discountAmount).toLocaleString()} off your first booking of ₦${Number(minOrderAmount).toLocaleString()}+! 🧼🏠 Order here: ${shareLink}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCheckBalance = async () => {
    if (!lookupQuery.trim()) return;
    setSearching(true);
    try {
      const allBookings = await dbService.getBookings();
      const rawQuery = lookupQuery.trim();
      const queryCleanDigits = rawQuery.replace(/[^0-9]/g, "");
      const queryCleanLower = rawQuery.toLowerCase();
      
      // Filter bookings where referral code was applied
      const singleReward = Number(discountAmount);

      // Friends referred: bookings placed by OTHER phone numbers using this code/phone
      const friendBookings = allBookings.filter(b => {
        if (!b.referralCodeApplied) return false;
        const codeMatch = b.referralCodeApplied.toLowerCase().includes(queryCleanLower) || 
                          (queryCleanDigits.length >= 6 && b.referralCodeApplied.includes(queryCleanDigits));
        if (!codeMatch) return false;

        // Ensure booking was not placed by the referrer themselves
        const bookingPhoneDigits = (b.phone || "").replace(/[^0-9]/g, "");
        if (queryCleanDigits.length >= 6 && bookingPhoneDigits.length >= 6) {
          return !bookingPhoneDigits.includes(queryCleanDigits) && !queryCleanDigits.includes(bookingPhoneDigits);
        }
        return true;
      });

      // Redeemed bookings: bookings placed by THIS referrer where they redeemed discount credits
      const redeemedBookings = allBookings.filter(b => {
        const bookingPhoneDigits = (b.phone || "").replace(/[^0-9]/g, "");
        const isReferrerPhone = queryCleanDigits.length >= 6 && bookingPhoneDigits.length >= 6 &&
          (bookingPhoneDigits.includes(queryCleanDigits) || queryCleanDigits.includes(bookingPhoneDigits));
        
        return isReferrerPhone && (Number(b.referralDiscountAmount || 0) > 0 || !!b.referralCodeApplied);
      });

      const countReferred = friendBookings.length;
      const grossEarned = countReferred * singleReward;
      
      const totalRedeemed = redeemedBookings.reduce((sum, b) => sum + Number(b.referralDiscountAmount || singleReward), 0);
      const netAvailableBalance = Math.max(0, grossEarned - totalRedeemed);

      setLookupResult({
        countReferred,
        grossEarned,
        totalRedeemed,
        netAvailableBalance,
        codeUsed: rawQuery.toUpperCase(),
        checked: true
      });
    } catch (err) {
      console.error("Failed to check referral earnings:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div 
      style={{
        background: "linear-gradient(135deg, #162416 0%, #0A140A 100%)",
        border: "1px solid rgba(57, 255, 20, 0.35)",
        borderRadius: 20,
        padding: "26px 28px",
        margin: "24px 0 32px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(57, 255, 20, 0.2)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background glow circle */}
      <div 
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(57,255,20,0.15) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(57, 255, 20, 0.12)", border: "1px solid rgba(57, 255, 20, 0.3)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "var(--neon-lime)", marginBottom: 12 }}>
            <span>🤝</span> 2-WAY REFERRAL &amp; REWARD PROGRAM
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
            {headline}
          </h3>
          <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.55, margin: "0 0 16px 0", maxWidth: 580 }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", fontSize: 12, color: "#aaa" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#39FF14", fontWeight: 700 }}>
              ✓ Friend saves ₦{Number(discountAmount).toLocaleString()}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#39FF14", fontWeight: 700 }}>
              ✓ You earn ₦{Number(discountAmount).toLocaleString()} reward credit
            </span>
          </div>

          <button
            onClick={() => setShowLookup(!showLookup)}
            style={{
              marginTop: 14,
              background: "rgba(57, 255, 20, 0.1)",
              border: "1px solid rgba(57, 255, 20, 0.3)",
              color: "#39FF14",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            🔍 {showLookup ? "Hide Credit Lookup" : "Check My Referral Earnings & Balance"}
          </button>
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 12, minWidth: 280, width: "100%", maxWidth: 360 }}>
          {/* Personalized Generator */}
          <div style={{ background: "#0D170D", border: "1px solid rgba(57, 255, 20, 0.3)", borderRadius: 12, padding: "12px 14px" }}>
            <label style={{ fontSize: 11, textTransform: "uppercase", color: "#39FF14", fontWeight: 800, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Generate Phone Number Referral Code
            </label>
            <input 
              type="tel" 
              placeholder="Enter your Phone Number e.g. 08160880608"
              value={referrerInput}
              onChange={e => setReferrerInput(e.target.value)}
              style={{
                width: "100%",
                background: "#050A05",
                border: "1px solid #223A22",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                outline: "none",
                marginBottom: 8
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>Your Unique Code:</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#39FF14", fontFamily: "monospace" }}>{promoCode}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button 
                  onClick={copyCode}
                  style={{
                    background: copied ? "#39FF14" : "rgba(255,255,255,0.1)",
                    color: copied ? "#000" : "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {copied ? "✓ Copied" : "📋 Code"}
                </button>
                <button 
                  onClick={copyLink}
                  style={{
                    background: copiedLink ? "#39FF14" : "rgba(57,255,20,0.18)",
                    color: copiedLink ? "#000" : "#39FF14",
                    border: "1px solid rgba(57,255,20,0.4)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {copiedLink ? "✓ Link Copied" : "🔗 Link"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <a 
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                background: "#25D366",
                color: "#000",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              💬 Share on WhatsApp
            </a>
            {onBookWithCode && (
              <button
                onClick={() => onBookWithCode(promoCode)}
                style={{
                  flex: 1,
                  background: "var(--neon-lime)",
                  color: "#0A0A0A",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4
                }}
              >
                🏷️ Claim ₦{Number(discountAmount).toLocaleString()} Off
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Earnings & Reward Credit Balance Lookup Drawer */}
      {showLookup && (
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(57, 255, 20, 0.2)", background: "#0A140A", borderRadius: 12, padding: 18 }}>
          <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 800, color: "#39FF14" }}>
            💳 Check Your Accumulated Referral Earnings &amp; Credits
          </h4>
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#aaa" }}>
            Enter your phone number or referral code (e.g. <code>08160880608</code> or <code>REF-08160880608</code>) to see how many friends booked with your link and how much reward credit you have earned!
          </p>

          <div style={{ display: "flex", gap: 8, maxWidth: 480 }}>
            <input 
              type="tel" 
              placeholder="Enter phone number e.g. 08160880608"
              value={lookupQuery}
              onChange={e => { setLookupQuery(e.target.value); setLookupResult(null); }}
              style={{
                flex: 1,
                background: "#000",
                border: "1px solid #223A22",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13
              }}
            />
            <button
              onClick={handleCheckBalance}
              disabled={searching}
              style={{
                background: "#39FF14",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {searching ? "Searching..." : "Check Balance"}
            </button>
          </div>

          {lookupResult && lookupResult.checked && (
            <div style={{ marginTop: 14, background: "#112211", border: "1px solid #39FF14", borderRadius: 10, padding: "16px 18px" }}>
              {lookupResult.countReferred > 0 || lookupResult.totalRedeemed > 0 ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                    📊 Referral Statement for <code style={{ color: "#39FF14" }}>{lookupResult.codeUsed}</code>:
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", fontSize: 13 }}>
                    <div style={{ background: "#050F05", padding: "10px 14px", borderRadius: 8, border: "1px solid #1A3A1A", flex: "1 1 140px" }}>
                      <div style={{ color: "#888", fontSize: 11, uppercase: "true" }}>Friends Referred</div>
                      <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{lookupResult.countReferred} person(s)</div>
                      <div style={{ color: "#39FF14", fontSize: 11 }}>+₦{lookupResult.grossEarned.toLocaleString()} earned</div>
                    </div>

                    <div style={{ background: "#050F05", padding: "10px 14px", borderRadius: 8, border: "1px solid #1A3A1A", flex: "1 1 140px" }}>
                      <div style={{ color: "#888", fontSize: 11 }}>Credits Spent/Used</div>
                      <div style={{ color: lookupResult.totalRedeemed > 0 ? "#FF6B6B" : "#aaa", fontSize: 16, fontWeight: 800 }}>
                        -₦{lookupResult.totalRedeemed.toLocaleString()}
                      </div>
                      <div style={{ color: "#888", fontSize: 11 }}>Redeemed on bookings</div>
                    </div>

                    <div style={{ background: "#0A200A", padding: "10px 14px", borderRadius: 8, border: "1px solid #39FF14", flex: "1 1 160px" }}>
                      <div style={{ color: "#39FF14", fontSize: 11, fontWeight: 700 }}>AVAILABLE CREDIT BALANCE</div>
                      <div style={{ color: "#39FF14", fontSize: 20, fontWeight: 900 }}>
                        ₦{lookupResult.netAvailableBalance.toLocaleString()}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 11 }}>Net available to spend</div>
                    </div>
                  </div>

                  {lookupResult.netAvailableBalance > 0 ? (
                    onBookWithCode && (
                      <button
                        onClick={() => onBookWithCode(lookupResult.codeUsed)}
                        style={{
                          marginTop: 14,
                          background: "linear-gradient(90deg, #39FF14, #28C80F)",
                          color: "#000",
                          border: "none",
                          borderRadius: 8,
                          padding: "10px 18px",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        🛍️ Book &amp; Apply Available ₦{lookupResult.netAvailableBalance.toLocaleString()} Credit →
                      </button>
                    )
                  ) : (
                    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 6, color: "#bbb", fontSize: 12 }}>
                      💡 You have redeemed all your earned referral credits! Share your referral link with another neighbor to earn another ₦{Number(discountAmount).toLocaleString()} when they book!
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "#bbb", fontSize: 13 }}>
                  ℹ️ No completed bookings found yet for phone / code <code>{lookupResult.codeUsed}</code>. Once your friend completes a booking of ₦{Number(minOrderAmount).toLocaleString()}+ with your referral link or code, your ₦{Number(discountAmount).toLocaleString()} reward credit will show up here!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

