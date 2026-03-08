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

    st.markdown("### How to Download")
    st.markdown(
        "1. Go to **[redfin.com](https://www.redfin.com/zipcode/94513)**\n"
        "2. Search: `Trilogy at the Vineyards Brentwood CA 94513`\n"
        "3. Set status filter to **All** (For Sale + Pending + Sold)\n"
        "4. Scroll down → click **☰ Download All**\n"
        "5. Upload that single CSV below:"
    )
    combined_file = st.file_uploader("Redfin CSV (all statuses)", type="csv", key="combined")

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
    if val is None or str(val).strip() in ("", "nan", "N/A", "—", "-"):
        return 0
    try:
        return int(float(str(val).replace("$", "").replace(",", "").strip()))
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
        df = pd.read_csv(file, skiprows=header_idx, dtype=str)
        df.columns = [c.strip().upper() for c in df.columns]

        # Show detected columns in sidebar for debugging
        with st.sidebar.expander("🔍 CSV columns detected", expanded=False):
            st.write(list(df.columns))

        records = []
        for _, row in df.iterrows():
            def g(col, default=""):
                val = row.get(col, default)
                if pd.isna(val) if not isinstance(val, str) else False:
                    return default
                v = str(val).strip()
                return default if v in ("", "nan", "N/A") else v

            # Redfin uses PRICE for active/pending list price AND sold price.
            # Some exports also have SALE PRICE or CLOSE PRICE — try those first.
            price_raw = (g("SALE PRICE") or g("CLOSE PRICE") or g("SOLD PRICE") or g("PRICE", "0"))
            price = parse_money(price_raw)

            status = str(g("STATUS", "Active")).strip().title()

            records.append({
                "address":      str(g("ADDRESS", "Unknown")).split(",")[0].strip().title(),
                "beds":         int(float(g("BEDS", 0) or 0)),
                "baths":        float(g("BATHS", 0) or 0),
                "sqft":         parse_money(g("SQUARE FEET", 0)),
                "yearBuilt":    int(float(g("YEAR BUILT", 0) or 0)),
                "listPrice":    price,
                "salePrice":    price if status.lower() == "sold" else 0,
                "pricePerSqft": parse_money(g("$/SQUARE FEET", 0)),
                "daysOnMarket": int(float(g("DAYS ON MARKET", 0) or 0)),
                "status":       status,
                "saleDate":     str(g("SOLD DATE", "")).strip(),
                "hasPool":      False,
                "features":     "",
            })
        return records
    except Exception as e:
        st.sidebar.error(f"Could not read CSV: {e}")
        import traceback
        st.sidebar.text(traceback.format_exc())
        return []

# ── Load data ─────────────────────────────────────────────────────────────────

def split_by_status(records):
    """Split a combined Redfin export into listings (active/pending) and sold."""
    listings, sold = [], []
    for r in records:
        if r.get("status", "").lower() == "sold":
            sold.append(r)
        else:
            listings.append(r)
    return listings, sold

if combined_file:
    all_records = parse_redfin_csv(combined_file)
    active_data, sold_data = split_by_status(all_records)
else:
    active_data, sold_data = [], []

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

MY_HOME_SQFT = 1842

def estimate_value(sales, listings):
    """Estimate home value from last-12-month comp sales + active comp list prices."""
    from datetime import date, timedelta
    cutoff = date.today() - timedelta(days=365)

    def parse_date(s):
        for fmt in ("%b %d, %Y", "%Y-%m-%d", "%m/%d/%Y", "%B %d, %Y"):
            try:
                return pd.to_datetime(s, format=fmt).date()
            except Exception:
                pass
        try:
            return pd.to_datetime(s).date()
        except Exception:
            return None

    # 1. Last-12-month comp sales (exact sqft match)
    recent_comps = [
        h for h in sales
        if h.get("sqft") == MY_HOME_SQFT
        and h.get("salePrice", 0) > 0
        and (parse_date(h.get("saleDate", "")) or date.min) >= cutoff
    ]

    sale_prices = sorted(h["salePrice"] for h in recent_comps)

    if sale_prices:
        n = len(sale_prices)
        median = int((sale_prices[(n-1)//2] + sale_prices[n//2]) / 2)
        low  = min(sale_prices)
        high = max(sale_prices)
        source = f"Median of {n} comp sale{'s' if n>1 else ''} (last 12 mo)"
    else:
        # Fallback: active comp list prices
        active_comps = [
            h for h in listings
            if h.get("sqft") == MY_HOME_SQFT and h.get("listPrice", 0) > 0
        ]
        prices = sorted(h["listPrice"] for h in active_comps)
        if prices:
            n = len(prices)
            median = int((prices[(n-1)//2] + prices[n//2]) / 2)
            low  = min(prices)
            high = max(prices)
            source = f"Avg of {n} active comp list price{'s' if n>1 else ''} (no recent sales)"
        else:
            median, low, high = 685000, 655000, 715000
            source = "Default estimate (no comp data found)"

    return median, low, high, source

est_value, est_low, est_high, est_source = estimate_value(RECENT_SALES, ACTIVE_LISTINGS)

MY_HOME = {
    "address": "Trilogy at the Vineyards, Brentwood CA 94513",
    "beds": 2, "baths": 2, "sqft": MY_HOME_SQFT, "yearBuilt": 2006,
    "garage": 2, "hasPool": False,
    "estimatedValue":     est_value,
    "estimatedValueLow":  est_low,
    "estimatedValueHigh": est_high,
    "estimatedValueSource": est_source,
}

# ── Computed stats ────────────────────────────────────────────────────────────

def compute_stats(listings, sales):
    active  = [h for h in listings if h.get("status", "").lower() not in ("sold", "pending")]
    pending = [h for h in listings if h.get("status", "").lower() == "pending"]
    comps   = [h for h in sales if h.get("sqft") == MY_HOME["sqft"]]

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
        st.caption(MY_HOME["estimatedValueSource"])
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

    st.subheader("Comparables · 1,842 Sqft")
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

    filter_comps = st.toggle("Show 1,842 Sqft Comps Only")

    listings = ACTIVE_LISTINGS
    if filter_comps:
        listings = [h for h in listings if h.get("sqft") == MY_HOME["sqft"]]

    if not listings:
        st.info("No listings match the current filter.")
    else:
        cols = st.columns(3)
        for i, home in enumerate(listings):
            with cols[i % 3]:
                is_comp = home.get("sqft") == MY_HOME["sqft"]
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
    col1.metric("Comp Avg Sale",   fmt(stats["compAvgSale"]))
    col2.metric("Comp Avg $/Sqft", f"${stats['compAvgPpsf']}")
    col3.metric("My Est. Value",   fmt(MY_HOME["estimatedValue"]))
    col4.metric("Comp Avg DOM",    f"{stats['compAvgDOM']} days")

    st.divider()

    if RECENT_SALES:
        show_comps_only = st.toggle("Show 1,842 Sqft Comps Only", key="sales_comps")

        df_sales = pd.DataFrame(RECENT_SALES)
        df_sales["Comp?"] = df_sales["sqft"].apply(
            lambda s: "✓" if s == MY_HOME["sqft"] else ""
        )

        if show_comps_only:
            df_sales = df_sales[df_sales["sqft"] == MY_HOME["sqft"]]

        df_sales["List Price"] = df_sales["listPrice"].apply(fmt)
        df_sales["Sale Price"] = df_sales["salePrice"].apply(fmt)
        df_sales["$/Sqft"]     = df_sales["pricePerSqft"].apply(lambda x: f"${x}")
        df_sales["DOM"]        = df_sales["daysOnMarket"]

        show_cols = ["address", "beds", "baths", "sqft", "List Price", "Sale Price", "$/Sqft", "DOM", "saleDate", "Comp?"]
        show_cols = [c for c in show_cols if c in df_sales.columns]

        if df_sales.empty:
            st.info("No 1,842 sqft sales found in this dataset.")
        else:
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
