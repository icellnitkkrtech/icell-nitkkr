import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/layout/Footer";

// ── Same MOCK_BLOGS as BlogsPage — in production this comes from your API ──────
// Import this from a shared data file once you connect to the backend
const MOCK_BLOGS = [
  {
    id: 1,
    title: "What is Positive Pay System and how does it work?",
    description: "Understand how the Positive Pay System adds an extra layer of security to cheque transactions in banking.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=500&fit=crop",
    category: "Finance",
    author: "Arjun Sharma",
    date: "Feb 2026",
    status: "approved",
    content: `## What is Positive Pay System?

The Positive Pay System is an automated fraud detection mechanism introduced by the Reserve Bank of India (RBI) to add an extra layer of security to high-value cheque transactions.

## How Does It Work?

When you issue a cheque above ₹50,000, you submit the cheque details — date, amount, payee name — to your bank via net banking, mobile app, or branch visit. When the cheque is presented for clearing, the bank cross-verifies these details. Any mismatch gets flagged before the payment is processed.

## Key Benefits

**Enhanced Security:** Drastically reduces cheque fraud and forgery.

**Peace of Mind:** You're alerted immediately if someone tampers with your cheque.

**Mandatory for High Value:** RBI mandates this for cheques of ₹5 lakh and above.

## How to Register

1. Log in to your bank's net banking portal
2. Navigate to "Positive Pay System" under cheque services
3. Enter cheque details before issuing
4. Confirm submission — done!

## Conclusion

The Positive Pay System is a simple but powerful tool for protecting your finances. If you regularly issue high-value cheques, make it a habit to register them before dispatch.`,
    links: ["https://rbi.org.in", "https://npci.org.in"],
    tableOfContents: [
      { id: "what-is", label: "What is Positive Pay System?" },
      { id: "how-it-works", label: "How Does It Work?" },
      { id: "benefits", label: "Key Benefits" },
      { id: "register", label: "How to Register" },
      { id: "conclusion", label: "Conclusion" },
    ],
  },
  {
    id: 2,
    title: "How to choose the right interest payout frequency for your Fixed Deposits?",
    description: "Monthly, quarterly, or at maturity — picking the right FD payout schedule can significantly impact your returns.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&h=500&fit=crop",
    category: "Technology",
    author: "Priya Menon",
    date: "Feb 2026",
    status: "approved",
    content: `## The Main Difference: Growth vs. Income

Before you book a Fixed Deposit, ask yourself one question: **Will I need the money now, or later?**

- **Cumulative (Grow It):** You don't touch the interest. The bank adds it back to your principal, and you earn interest on interest through compounding.
- **Non-Cumulative (Spend It):** Choose monthly, quarterly, half-yearly, or yearly payouts. The principal stays safe, but interest hits your bank account regularly.

## Why Choose a Cumulative Payout?

Think of it like a snowball rolling downhill — the longer it rolls, the bigger it gets. Your interest stays in the bank and gets added back to your original deposit.

**Who is this for?**
- Long-term savers with a goal 3–5 years away
- Investors who already have steady income
- Anyone wanting to maximize final returns

## Why Choose Monthly or Quarterly Payout?

If you pick monthly payout, the bank transfers interest to your savings account every month — like earning rent on a house you own.

**Who is this for?**
- Senior citizens supplementing pension
- Households needing steady cash flow
- Anyone who wants liquidity without breaking the FD

## Final Thoughts

Choosing the right payout frequency is about making your money fit your lifestyle. Whether you need regular income or want your savings to grow, the right FD structure gets you there.`,
    links: ["https://www.dcbbank.com"],
    tableOfContents: [
      { id: "difference", label: "The Main Difference: Growth vs. Income" },
      { id: "cumulative", label: "Why Choose a Cumulative Payout?" },
      { id: "non-cumulative", label: "Why Choose Monthly or Quarterly?" },
      { id: "conclusion", label: "Final Thoughts" },
    ],
  },
  {
    id: 3,
    title: "7 Ways to Improve the Security of Your Mobile Banking App",
    description: "From biometric locks to two-factor authentication, here's how you can keep your mobile banking safe.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&h=500&fit=crop",
    category: "Cyber Security",
    author: "Startup",
    date: "Dec 2025",
    status: "approved",
    content: `## Why Mobile Banking Security Matters

With over 500 million mobile banking users in India, cybercriminals are more active than ever. Here are 7 proven ways to keep your account safe.

## 1. Enable Biometric Authentication

Use fingerprint or face recognition instead of just a PIN. Biometrics are much harder to steal or replicate.

## 2. Use Two-Factor Authentication (2FA)

Always enable 2FA. Even if someone gets your password, they still need your OTP to log in.

## 3. Keep Your App Updated

Banks release security patches regularly. An outdated app is a vulnerable app.

## 4. Avoid Public Wi-Fi

Never access your banking app on public Wi-Fi. Use mobile data or a trusted VPN.

## 5. Set Strong, Unique Passwords

Use a password manager to generate strong passwords. Avoid birthdays or simple sequences.

## 6. Monitor Transaction Alerts

Enable SMS and email alerts for every transaction so you spot unauthorized activity immediately.

## 7. Log Out After Every Session

Never leave your banking session open. Always log out completely after use.

## Conclusion

Mobile banking security is not optional — it's essential. Follow these 7 steps and you'll be significantly safer online.`,
    links: [],
    tableOfContents: [
      { id: "why", label: "Why Mobile Banking Security Matters" },
      { id: "biometric", label: "1. Enable Biometric Authentication" },
      { id: "2fa", label: "2. Use Two-Factor Authentication" },
      { id: "update", label: "3. Keep Your App Updated" },
      { id: "wifi", label: "4. Avoid Public Wi-Fi" },
      { id: "password", label: "5. Set Strong Passwords" },
      { id: "alerts", label: "6. Monitor Transaction Alerts" },
      { id: "logout", label: "7. Log Out After Every Session" },
    ],
  },
  {
    id: 4, title: "Features and Benefits of DCB WOW Rupay Platinum Debit Card", description: "Explore the exciting rewards, cashback offers, and lifestyle privileges.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=500&fit=crop", category: "Finance", author: "Sanya Kapoor", date: "Nov 2025", status: "approved", content: `## What is the DCB WOW Rupay Platinum Debit Card?\n\nThe DCB WOW Rupay Platinum Debit Card is a feature-packed debit card designed for customers who want more from their everyday banking.\n\n## Key Features\n\n**Cashback Rewards:** Earn cashback on groceries, fuel, and online shopping every month.\n\n**Zero Annual Fee:** No hidden charges.\n\n**Contactless Payments:** Tap and pay at any NFC-enabled terminal.\n\n## Lifestyle Benefits\n\n- Complimentary access to select domestic airport lounges\n- Personal accident cover up to ₹2 lakh included\n- Fuel Surcharge Waiver on every fuel transaction\n\n## Conclusion\n\nApply at your nearest DCB Bank branch today.`, links: [], tableOfContents: [{ id: "what", label: "What is the Card?" }, { id: "features", label: "Key Features" }, { id: "lifestyle", label: "Lifestyle Benefits" }],
  },
  {
    id: 5, title: "Top Reasons Why You Should Switch to Mobile Banking", description: "Discover why millions of Indians are ditching traditional banking for convenience.", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=500&fit=crop", category: "Finance", author: "Vikram Iyer", date: "Dec 2025", status: "approved", content: `## The Mobile Banking Revolution\n\nIndia now has over 500 million smartphone users, and mobile banking has transformed how we manage money.\n\n## Reason 1: 24/7 Availability\n\nYour bank is open at 3 AM. Transfer money, check balances, pay bills — without leaving your house.\n\n## Reason 2: Instant Transfers\n\nUPI and IMPS let you transfer money in seconds.\n\n## Reason 3: Better Spending Insights\n\nMobile apps categorize your spending and show where your money goes each month.\n\n## Conclusion\n\nMobile banking is no longer a luxury — it's a necessity.`, links: [], tableOfContents: [{ id: "revolution", label: "The Mobile Banking Revolution" }, { id: "availability", label: "24/7 Availability" }, { id: "transfers", label: "Instant Transfers" }],
  },
  {
    id: 6, title: "Benefits of Gold Loan: Unlocking Value from Your Gold", description: "Gold sitting idle? Learn how to unlock its financial potential.", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=900&h=500&fit=crop", category: "Finance", author: "Deepa Nair", date: "Dec 2025", status: "approved", content: `## What is a Gold Loan?\n\nA gold loan is a secured loan where you pledge your gold jewellery as collateral to get quick cash.\n\n## Why Choose a Gold Loan?\n\n**Quick Disbursement:** Get funds within hours.\n\n**Minimal Documentation:** Just your ID proof and the gold itself.\n\n**Lower Interest Rates:** Much lower than personal loans.\n\n## Conclusion\n\nA gold loan is one of the smartest ways to get emergency funds without selling your precious assets.`, links: [], tableOfContents: [{ id: "what", label: "What is a Gold Loan?" }, { id: "why", label: "Why Choose a Gold Loan?" }],
  },
  {
    id: 7, title: "A Checklist to Ensure Timely GST Return Filing", description: "Never miss a GST deadline again with this comprehensive checklist.", image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=900&h=500&fit=crop", category: "Finance", author: "Ankit Gupta", date: "Aug 2025", status: "approved", content: `## Why GST Compliance Matters\n\nMissing a GST deadline means late fees and notices. This checklist ensures you never miss one.\n\n## Monthly Checklist\n\n- Collect all purchase and sales invoices\n- File GSTR-1 by the 11th\n- Pay GST liability by the 20th\n\n## Conclusion\n\nGST compliance is not complicated — it just requires a system.`, links: ["https://www.gst.gov.in"], tableOfContents: [{ id: "why", label: "Why Compliance Matters" }, { id: "monthly", label: "Monthly Checklist" }],
  },
  {
    id: 8, title: "Money Transfer Tips for Indian Students Studying Abroad", description: "Save on fees and get better exchange rates with these practical tips.", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=500&fit=crop", category: "Startup", author: "Meera Pillai", date: "Nov 2025", status: "approved", content: `## The Challenge of Sending Money Abroad\n\nFor Indian students studying abroad, receiving money from home can be expensive if you don't know the right methods.\n\n## Tip 1: Compare Exchange Rates Daily\n\nApps like Wise, Remitly, and XE.com let you compare rates in real time.\n\n## Tip 2: Use Wise\n\nWise uses the real mid-market exchange rate with transparent fees.\n\n## Conclusion\n\nSmart money management abroad starts with understanding your options.`, links: ["https://wise.com"], tableOfContents: [{ id: "challenge", label: "The Challenge" }, { id: "rates", label: "Compare Exchange Rates" }, { id: "wise", label: "Use Wise" }],
  },
  {
    id: 9, title: "RBI Repo Rate Reforms: Does it Affect Fixed Deposit Interest Rate?", description: "Every time the RBI changes the repo rate, FD investors take notice.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&h=500&fit=crop", category: "Startup", author: "Kabir Bose", date: "Feb 2026", status: "approved", content: `## What is the Repo Rate?\n\nThe repo rate is the rate at which RBI lends money to commercial banks.\n\n## The Direct Connection to FD Rates\n\nWhen RBI raises the repo rate, banks typically raise FD interest rates too.\n\n## What Should FD Investors Do?\n\n**When rates are rising:** Opt for shorter FD tenures (6–12 months).\n\n**When rates are falling:** Lock in longer tenures immediately.\n\n## Conclusion\n\nThe repo rate is your early warning system for FD rate changes.`, links: ["https://rbi.org.in"], tableOfContents: [{ id: "what", label: "What is the Repo Rate?" }, { id: "connection", label: "Connection to FD Rates" }, { id: "strategy", label: "Investment Strategy" }],
  },
];

// ── Markdown-style content renderer ──────────────────────────────────────────
function RenderContent({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "24px", fontWeight: 400, color: "#fff",
          margin: "36px 0 14px", paddingBottom: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          letterSpacing: "-0.02em",
        }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: "24px 0 10px" }}>
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        listItems.push(
          <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.8, marginBottom: "6px" }}>
            {renderInline(lines[i].replace(/^[-*] /, ""))}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ paddingLeft: "20px", margin: "12px 0" }}>{listItems}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(
          <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.8, marginBottom: "8px" }}>
            {renderInline(lines[i].replace(/^\d+\. /, ""))}
          </li>
        );
        i++;
      }
      elements.push(<ol key={`ol-${i}`} style={{ paddingLeft: "22px", margin: "12px 0" }}>{listItems}</ol>);
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} style={{ color: "rgba(255,255,255,0.62)", fontSize: "15.5px", lineHeight: 1.85, margin: "0 0 16px" }}>
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

// Handle **bold** and inline text
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ── Share Button ──────────────────────────────────────────────────────────────
function ShareButton({ icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noreferrer"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.6)",
        textDecoration: "none", transition: "all 0.2s", fontSize: "14px",
      }}
      title={label}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
    >
      {icon}
    </a>
  );
}

// ── Related Blog Card ─────────────────────────────────────────────────────────
function RelatedCard({ blog, onClick }) {
  return (
    <div
      onClick={() => onClick(blog)}
      style={{
        cursor: "pointer", borderRadius: "14px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        transition: "all 0.25s",
      }}
      onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.16)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
    >
      <img src={blog.image} alt={blog.title} style={{ width: "100%", height: "130px", objectFit: "cover" }} />
      <div style={{ padding: "14px" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{blog.category}</span>
        <p style={{ color: "#fff", fontSize: "13px", fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.4, margin: "6px 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.title}</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0 }}>{blog.author} · {blog.date}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  // Find blog by id (string from URL params → convert to number)
  const blog = MOCK_BLOGS.find((b) => b.id === parseInt(id));

  // Related blogs: same category, excluding current
  const related = MOCK_BLOGS.filter((b) => b.id !== blog?.id && b.category === blog?.category).slice(0, 3);
  const moreBlogs = related.length < 3
    ? [...related, ...MOCK_BLOGS.filter(b => b.id !== blog?.id && b.category !== blog?.category)].slice(0, 3)
    : related;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!blog) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "8px" }}>Blog not found</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>The blog you're looking for doesn't exist or was removed.</p>
          <button onClick={() => navigate("/blogs")} style={{ padding: "10px 24px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
            ← Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog.title);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── HERO BANNER (matches the reference UI style) ── */}
      <section style={{ paddingTop: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          {/* Back button */}
          <button
            onClick={() => navigate("/blogs")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 16px", borderRadius: "999px", marginBottom: "24px",
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.45)", fontSize: "12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", marginTop: "16px",
            }}
          >
            ← Back to Blogs
          </button>

          {/* Hero card — split layout matching reference */}
          <div style={{
            borderRadius: "24px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid", gridTemplateColumns: "1fr 1fr",
            minHeight: "320px", position: "relative",
            background: "#111",
          }}>
            {/* Left: title + meta */}
            <div style={{
              padding: "48px 48px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              background: "linear-gradient(135deg, #141414 0%, #1a1a2e 100%)",
              position: "relative", zIndex: 1,
            }}>
              {/* Category + date row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{
                  padding: "5px 14px", borderRadius: "999px", fontSize: "11px",
                  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                }}>
                  {blog.category}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{blog.date}</span>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(22px, 2.5vw, 34px)",
                fontWeight: 400, color: "#fff",
                margin: "0 0 20px", lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}>
                {blog.title}
              </h1>

              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {blog.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, margin: 0 }}>{blog.author}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0 }}>Author · {blog.date}</p>
                </div>
              </div>

              {/* Share icons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginRight: "4px" }}>Share:</span>
                <ShareButton icon="𝕏" label="Share on X" href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} />
                <ShareButton icon="in" label="Share on LinkedIn" href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`} />
                <ShareButton icon="f" label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} />
              </div>
            </div>

            {/* Right: hero image */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={blog.image}
                alt={blog.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "320px" }}
              />
              {/* Overlay gradient on left edge to blend with text panel */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,20,20,0.4) 0%, transparent 40%)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "48px", alignItems: "flex-start" }}>

          {/* ── LEFT: Article content ── */}
          <article>
            {/* Short description highlight */}
            <div style={{
              padding: "20px 24px", borderRadius: "14px", marginBottom: "36px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "3px solid rgba(255,255,255,0.3)",
            }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                {blog.description}
              </p>
            </div>

            {/* Full content */}
            <RenderContent content={blog.content} />

            {/* Related links */}
            {blog.links && blog.links.length > 0 && (
              <div style={{
                marginTop: "40px", padding: "20px 24px", borderRadius: "14px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
                  Related Links
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {blog.links.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noreferrer" style={{
                      color: "rgba(255,255,255,0.55)", fontSize: "13px", textDecoration: "none",
                      display: "flex", alignItems: "center", gap: "6px", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
                    >
                      <span style={{ fontSize: "10px" }}>↗</span> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              marginTop: "40px", padding: "18px 22px", borderRadius: "12px",
              background: "rgba(255,200,0,0.04)", border: "1px solid rgba(255,200,0,0.1)",
            }}>
              <p style={{ color: "rgba(255,200,0,0.5)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
                Disclaimer
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>
                Information on this page is for informational purposes only and does not constitute financial advice. Readers are advised to consult financial professionals for personalized advice before making decisions.
              </p>
            </div>
          </article>

          {/* ── RIGHT: Sticky sidebar ── */}
          <aside style={{ position: "sticky", top: "100px" }}>

            {/* Table of Contents */}
            {blog.tableOfContents && blog.tableOfContents.length > 0 && (
              <div style={{
                padding: "22px", borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "20px",
              }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
                  Table of Contents
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {blog.tableOfContents.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSection(i)}
                      style={{
                        textAlign: "left", padding: "8px 10px", borderRadius: "8px",
                        background: activeSection === i ? "rgba(255,255,255,0.07)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: activeSection === i ? "#fff" : "rgba(255,255,255,0.45)",
                        fontSize: "13px", lineHeight: 1.4, transition: "all 0.2s",
                        borderLeft: activeSection === i ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onMouseEnter={e => { if (activeSection !== i) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                      onMouseLeave={e => { if (activeSection !== i) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div style={{
              padding: "20px", borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "20px",
            }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>About the Author</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {blog.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: 0 }}>{blog.author}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>Society Member</p>
                </div>
              </div>
            </div>

            {/* Share card */}
            <div style={{
              padding: "20px", borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Share this Post</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <ShareButton icon="𝕏" label="Share on X" href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} />
                <ShareButton icon="in" label="Share on LinkedIn" href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`} />
                <ShareButton icon="f" label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── RELATED BLOGS ── */}
      {moreBlogs.length > 0 && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <h2 style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>
              You Might Also Like
            </h2>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
            <button
              onClick={() => navigate("/blogs")}
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
            >
              View all →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
            {moreBlogs.map((b) => (
              <RelatedCard key={b.id} blog={b} onClick={(blog) => navigate(`/blog/${blog.id}`)} />
            ))}
          </div>
        </section>
      )}

      
    </div>
  );
}
