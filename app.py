import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Trilogy Home Sales Tracker",
    page_icon="🏡",
    layout="wide",
)

# ── Sidebar: CSV Upload Instructions ─────────────────────────────────────────

with st.sidebar:
    st.markdown("## 📥 Load Real Data from Redfin")
    st.markdown("---")

    st.markdown("### Step 1 — Get Active Listings")
    st.markdown(
        "1. Go to **[redfin.com](https://www.redfin.com/zipcode/94513)**\n"
        "2. Search: `Trilogy at the Vineyards Brentwood CA 94513`\n"
        "3. Set status filter to **For Sale** (include Pending)\n"
        "4. Scroll down → click **☰ Download All**\n"
        "5. Upload that CSV below:"
    )
    listings_file = st.file_uploader("For Sale CSV", type="csv", key="listings")

    st.markdown("---")
    st.markdown("### Step 2 — Get Recent Sales")
    st.markdown(
        "1. Same search on Redfin\n"
        "2. Set status filter to **Sold** · last 6 months\n"
        "3. Click **☰ Download All**\n"
        "4. Upload that CSV below:"
    )
    sold_file = st.file_uploader("Sold Homes CSV", type="csv", key="sold")

    st.markdown("---")
    st.caption("Data stays in your browser session only. Re-upload anytime to refresh.")

# ── Redfin CSV Parser ─────────────────────────────────────────────────────────

REDFIN_COL_MAP = {
    "ADDRESS": "address",
    "BEDS": "beds",
    "BATHS": "baths",
    "SQUARE FEET": "sqft",
    "YEAR BUILT": "yearBuilt",
    "PRICE": "listPrice",
    "$/SQUARE FEET": "pricePerSqft",
    "DAYS ON MARKET": "daysOnMarket",
    "STATUS": "status",
    "SOLD DATE": "saleDate",
    "SALE TYPE": "saleType",
    "HOA/MONTH": "hoa",
}

def parse_money(val):
    try:
        return int(str(val).replace("$", "").replace(",", "").strip())
    except Exception:
        return 0

def parse_redfin_csv(file):
    """Read a Redfin CSV, normalise columns, return a list of dicts."""
    try:
        # Redfin sometimes adds a disclaimer row at top — skip non-header rows
        raw = file.read().decode("utf-8", errors="replace")
        file.seek(0)
        # Find the header line (contains "ADDRESS")
        lines = raw.splitlines()
        header_idx = next((i for i, l in enumerate(lines) if "ADDRESS" in l.upper()), 0)
        df = pd.read_csv(file, skiprows=header_idx)
        df.columns = [c.strip().upper() for c in df.columns]

        records = []
        for _, row in df.iterrows():
            def g(col, default=""):
                return row.get(col, default)

            records.append({
                "address":      str(g("ADDRESS", "Unknown")).split(",")[0].strip().title(),
                "beds":         int(g("BEDS", 0) or 0),
                "baths":        float(g("BATHS", 0) or 0),
                "sqft":         parse_money(g("SQUARE FEET", 0)),
                "yearBuilt":    int(g("YEAR BUILT", 0) or 0),
                "listPrice":    parse_money(g("PRICE", 0)),
                "salePrice":    parse_money(g("PRICE", 0)),
                "pricePerSqft": parse_money(g("$/SQUARE FEET", 0)),
                "daysOnMarket": int(g("DAYS ON MARKET", 0) or 0),
                "status":       str(g("STATUS", "Active")).strip().title(),
                "saleDate":     str(g("SOLD DATE", "")).strip(),
                "hasPool":      False,
                "features":     "",
            })
        return records
    except Exception as e:
        st.sidebar.error(f"Could not read CSV: {e}")
        return []

# ── Load data ─────────────────────────────────────────────────────────────────

active_data = parse_redfin_csv(listings_file) if listings_file else []
sold_data   = parse_redfin_csv(sold_file)     if sold_file   else []

using_real_data = bool(active_data or sold_data)

# ── Fallback sample data (shown when no CSV uploaded) ────────────────────────

SAMPLE_LISTINGS = [
    {"address": "1204 Chardonnay Dr",  "beds": 2, "baths": 2, "sqft": 1842, "status": "Active",
     "listPrice": 699000, "daysOnMarket": 26, "pricePerSqft": 379, "yearBuilt": 2007,
     "hasPool": False, "features": "Granite Counters · Stainless Appliances · Solar"},
    {"address": "823 Merlot Ln",       "beds": 2, "baths": 2, "sqft": 1960, "status": "Active",
     "listPrice": 720000, "daysOnMarket": 39, "pricePerSqft": 367, "yearBuilt": 2005,
     "hasPool": False, "features": "Upgraded Flooring · Chef's Kitchen"},
    {"address": "415 Cabernet Ct",     "beds": 2, "baths": 2, "sqft": 1720, "status": "Active",
     "listPrice": 649000, "daysOnMarket": 16, "pricePerSqft": 377, "yearBuilt": 2008,
     "hasPool": False, "features": "Cul-de-Sac · New HVAC · Crown Molding"},
    {"address": "2210 Vineyard Ave",   "beds": 3, "baths": 2, "sqft": 2105, "status": "Active",
     "listPrice": 799000, "daysOnMarket": 34, "pricePerSqft": 380, "yearBuilt": 2006,
     "hasPool": True,  "features": "Pool & Spa · Extended Garage · Solar"},
    {"address": "937 Riesling Way",    "beds": 2, "baths": 2, "sqft": 1842, "status": "Pending",
     "listPrice": 675000, "daysOnMarket": 52, "pricePerSqft": 366, "yearBuilt": 2009,
     "hasPool": False, "features": "Updated Baths · New Appliances"},
    {"address": "1748 Sauvignon St",   "beds": 2, "baths": 2, "sqft": 1680, "status": "Active",
     "listPrice": 629000, "daysOnMarket":  7, "pricePerSqft": 374, "yearBuilt": 2010,
     "hasPool": False, "features": "Fresh Paint · Near Clubhouse"},
]

SAMPLE_SALES = [
    {"address": "622 Zinfandel Dr",   "beds": 2, "baths": 2, "sqft": 1842,
     "listPrice": 689000, "salePrice": 683000, "saleDate": "Jan 14, 2026", "daysOnMarket": 44, "pricePerSqft": 371},
    {"address": "310 Pinot Noir Pl",  "beds": 2, "baths": 2, "sqft": 1720,
     "listPrice": 645000, "salePrice": 651000, "saleDate": "Jan 22, 2026", "daysOnMarket": 43, "pricePerSqft": 378},
    {"address": "1512 Tempranillo Ct","beds": 3, "baths": 2, "sqft": 2250,
     "listPrice": 849000, "salePrice": 835000, "saleDate": "Jan 8, 2026",  "daysOnMarket": 54, "pricePerSqft": 371},
    {"address": "784 Grenache Rd",    "beds": 2, "baths": 2, "sqft": 1842,
     "listPrice": 669000, "salePrice": 662000, "saleDate": "Dec 5, 2025",  "daysOnMarket": 38, "pricePerSqft": 359},
    {"address": "2045 Syrah Ln",      "beds": 2, "baths": 2, "sqft": 1960,
     "listPrice": 715000, "salePrice": 708000, "saleDate": "Nov 30, 2025", "daysOnMarket": 46, "pricePerSqft": 361},
    {"address": "508 Viognier Way",   "beds": 2, "baths": 2, "sqft": 1680,
     "listPrice": 629000, "salePrice": 625000, "saleDate": "Oct 28, 2025", "daysOnMarket": 38, "pricePerSqft": 372},
]

ACTIVE_LISTINGS = active_data if active_data else SAMPLE_LISTINGS
RECENT_SALES    = sold_data   if sold_data   else SAMPLE_SALES

# ── My Home ───────────────────────────────────────────────────────────────────

MY_HOME = {
    "address": "Trilogy at the Vineyards, Brentwood CA 94513",
    "beds": 2, "baths": 2, "sqft": 1842, "yearBuilt": 2006,
    "garage": 2, "hasPool": False,
    "estimatedValue": 685000,
    "estimatedValueLow": 655000,
    "estimatedValueHigh": 715000,
}

# ── Computed stats ────────────────────────────────────────────────────────────

def compute_stats(listings, sales):
    active  = [h for h in listings if h.get("status", "").lower() not in ("sold", "pending")]
    pending = [h for h in listings if h.get("status", "").lower() == "pending"]
    comps   = [h for h in sales if
               h.get("beds") == MY_HOME["beds"] and
               h.get("baths") == MY_HOME["baths"] and
               abs((h.get("sqft") or 0) - MY_HOME["sqft"]) <= 200]

    def avg(lst, key):
        vals = [h[key] for h in lst if h.get(key)]
        return int(sum(vals) / len(vals)) if vals else 0

    def med(lst, key):
        vals = sorted(h[key] for h in lst if h.get(key))
        n = len(vals)
        return int((vals[n//2 - 1] + vals[n//2]) / 2) if n >= 2 else (vals[0] if vals else 0)

    return {
        "active": active, "pending": pending, "comps": comps,
        "avgListPrice":    avg(listings, "listPrice"),
        "medianListPrice": med(listings, "listPrice"),
        "avgSalePrice":    avg(sales,    "salePrice"),
        "avgPricePerSqft": avg(sales,    "pricePerSqft"),
        "avgDaysOnMarket": avg(sales,    "daysOnMarket"),
        "compAvgSale":     avg(comps,    "salePrice"),
        "compAvgPpsf":     avg(comps,    "pricePerSqft"),
        "compAvgDOM":      avg(comps,    "daysOnMarket"),
        "listToSale":      (avg(sales, "salePrice") / avg(sales, "listPrice") * 100) if avg(sales, "listPrice") else 0,
    }

stats = compute_stats(ACTIVE_LISTINGS, RECENT_SALES)

def fmt(n):
    return f"${n:,.0f}"

# ── Header ────────────────────────────────────────────────────────────────────

data_badge = (
    "🟢 Live Redfin data loaded" if using_real_data
    else "🟡 Sample data — upload Redfin CSVs in the sidebar to see real listings"
)

st.markdown(f"""
<div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 1.2rem 1.5rem; border-radius: 12px; margin-bottom: 0.5rem;">
    <h2 style="color:white; margin:0; font-size:1.4rem;">🏡 Trilogy at the Vineyards</h2>
    <p style="color:#d1fae5; margin:0.2rem 0 0; font-size:0.85rem;">Brentwood, CA 94513</p>
</div>
<p style="font-size:0.8rem; margin-bottom:1rem;">{data_badge}</p>
""", unsafe_allow_html=True)

tab1, tab2, tab3 = st.tabs(["◉ Overview", "🏷 For Sale", "✓ Recent Sales"])

# ── Tab 1: Overview ───────────────────────────────────────────────────────────

with tab1:
    st.subheader("My Home")
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown(f"**{MY_HOME['address']}**")
        st.caption(f"{MY_HOME['beds']} bed · {MY_HOME['baths']} bath · {MY_HOME['sqft']:,} sqft · Built {MY_HOME['yearBuilt']} · {MY_HOME['garage']}-car garage")
    with col2:
        st.metric("Estimated Value", fmt(MY_HOME["estimatedValue"]),
                  delta=f"Range: {fmt(MY_HOME['estimatedValueLow'])} – {fmt(MY_HOME['estimatedValueHigh'])}")
    with col3:
        st.metric("Price per Sqft", f"${MY_HOME['estimatedValue'] // MY_HOME['sqft']}")

    st.divider()

    st.subheader("Market Snapshot")
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Active Listings", len(stats["active"]), delta=f"{len(stats['pending'])} pending")
    c2.metric("Avg List Price",  fmt(stats["avgListPrice"]))
    c3.metric("Avg Sale Price",  fmt(stats["avgSalePrice"]),
              delta=f"{stats['listToSale']:.1f}% of list" if stats["listToSale"] else None)
    c4.metric("Avg $/Sqft",      f"${stats['avgPricePerSqft']}")
    c5.metric("Avg Days on Mkt", stats["avgDaysOnMarket"])

    st.divider()

    st.subheader("2bd / 2ba Comparables · Like Mine")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("My Est. Value",    fmt(MY_HOME["estimatedValue"]))
    c2.metric("Comp Avg Sale",    fmt(stats["compAvgSale"]))
    c3.metric("Comp Avg $/Sqft",  f"${stats['compAvgPpsf']}")
    c4.metric("Comp Avg DOM",     f"{stats['compAvgDOM']} days")

    if not using_real_data:
        st.info("Upload your Redfin CSVs in the **sidebar** to populate this dashboard with real listings and sales from Trilogy at the Vineyards.")

# ── Tab 2: For Sale ───────────────────────────────────────────────────────────

with tab2:
    st.subheader("Homes For Sale · Trilogy at the Vineyards")
    if not using_real_data:
        st.warning("Showing sample data. Upload a Redfin 'For Sale' CSV in the sidebar to see real listings.")

    filter_comps = st.toggle("Show 2bd/2ba Comps Only")

    listings = ACTIVE_LISTINGS
    if filter_comps:
        listings = [h for h in listings if
                    h.get("beds") == MY_HOME["beds"] and
                    h.get("baths") == MY_HOME["baths"] and
                    abs((h.get("sqft") or 0) - MY_HOME["sqft"]) <= 200]

    if not listings:
        st.info("No listings match the current filter.")
    else:
        cols = st.columns(3)
        for i, home in enumerate(listings):
            with cols[i % 3]:
                is_comp = (home.get("beds") == MY_HOME["beds"] and
                           home.get("baths") == MY_HOME["baths"] and
                           abs((home.get("sqft") or 0) - MY_HOME["sqft"]) <= 200)
                status = home.get("status", "Active")
                status_icon = "🟡" if status.lower() == "pending" else "🟢"
                comp_badge  = " · 🔵 Comp" if is_comp else ""
                st.markdown(f"{status_icon} **{home['address']}**{comp_badge}")
                sqft = home.get("sqft") or 0
                yr   = home.get("yearBuilt") or "?"
                st.caption(f"{home.get('beds',0)}bd · {home.get('baths',0)}ba · {sqft:,} sqft · Built {yr}")
                diff = home.get("listPrice", 0) - MY_HOME["estimatedValue"]
                diff_str = (f"+{fmt(diff)}" if diff > 0 else fmt(diff))
                st.metric("List Price", fmt(home.get("listPrice", 0)),
                          delta=diff_str if is_comp else None)
                dom  = home.get("daysOnMarket", 0)
                ppsf = home.get("pricePerSqft", 0)
                st.caption(f"${ppsf}/sqft · {dom} days on market")
                if home.get("features"):
                    st.caption(f"✦ {home['features']}")
                st.markdown("---")

# ── Tab 3: Recent Sales ───────────────────────────────────────────────────────

with tab3:
    st.subheader("Recent Sales · Trilogy at the Vineyards")
    if not using_real_data:
        st.warning("Showing sample data. Upload a Redfin 'Sold' CSV in the sidebar to see real sales.")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("2bd/2ba Avg Sale",   fmt(stats["compAvgSale"]))
    col2.metric("2bd/2ba Avg $/Sqft", f"${stats['compAvgPpsf']}")
    col3.metric("My Est. Value",       fmt(MY_HOME["estimatedValue"]))
    col4.metric("Comp Avg DOM",        f"{stats['compAvgDOM']} days")

    st.divider()

    if RECENT_SALES:
        df_sales = pd.DataFrame(RECENT_SALES)
        df_sales["Comp?"] = df_sales.apply(
            lambda r: "✓" if (r.get("beds") == MY_HOME["beds"] and
                              r.get("baths") == MY_HOME["baths"] and
                              abs((r.get("sqft") or 0) - MY_HOME["sqft"]) <= 200) else "",
            axis=1
        )
        df_sales["List Price"] = df_sales["listPrice"].apply(fmt)
        df_sales["Sale Price"] = df_sales["salePrice"].apply(fmt)
        df_sales["$/Sqft"]     = df_sales["pricePerSqft"].apply(lambda x: f"${x}")
        df_sales["DOM"]        = df_sales["daysOnMarket"]

        show_cols = ["address", "beds", "baths", "sqft", "List Price", "Sale Price", "$/Sqft", "DOM", "saleDate", "Comp?"]
        show_cols = [c for c in show_cols if c in df_sales.columns]

        st.dataframe(
            df_sales[show_cols].rename(columns={
                "address": "Address", "beds": "Beds", "baths": "Baths",
                "sqft": "Sqft", "saleDate": "Sale Date",
            }),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.info("No sales data. Upload a Redfin 'Sold' CSV in the sidebar.")

st.markdown("""
<div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #e2e8f0; text-align:center; font-size:0.75rem; color:#94a3b8;">
Trilogy at the Vineyards · Brentwood CA 94513 · Data sourced from Redfin exports.
For the most accurate valuations, consult a licensed real estate professional.
</div>
""", unsafe_allow_html=True)
