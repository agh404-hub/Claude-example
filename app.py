import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Trilogy Home Sales Tracker",
    page_icon="🏡",
    layout="wide",
)

# ── Data ─────────────────────────────────────────────────────────────────────

MY_HOME = {
    "address": "1678 Provence Ln, Trilogy at the Vineyards, Brentwood CA 94513",
    "beds": 2, "baths": 2, "sqft": 1842, "yearBuilt": 2006,
    "garage": 2, "hasPool": False,
    "estimatedValue": 685000,
    "estimatedValueLow": 655000,
    "estimatedValueHigh": 715000,
    "lastUpdated": "March 1, 2026",
}

ACTIVE_LISTINGS = [
    {"id": "a1", "address": "1204 Chardonnay Dr", "beds": 2, "baths": 2, "sqft": 1842,
     "status": "Active", "listPrice": 699000, "daysOnMarket": 26, "pricePerSqft": 379,
     "yearBuilt": 2007, "hasPool": False,
     "features": "Granite Counters · Stainless Appliances · Walk-in Closet · Solar"},
    {"id": "a2", "address": "823 Merlot Ln", "beds": 2, "baths": 2, "sqft": 1960,
     "status": "Active", "listPrice": 720000, "daysOnMarket": 39, "pricePerSqft": 367,
     "yearBuilt": 2005, "hasPool": False,
     "features": "Upgraded Flooring · Chef's Kitchen · Plantation Shutters"},
    {"id": "a3", "address": "415 Cabernet Ct", "beds": 2, "baths": 2, "sqft": 1720,
     "status": "Active", "listPrice": 649000, "daysOnMarket": 16, "pricePerSqft": 377,
     "yearBuilt": 2008, "hasPool": False,
     "features": "Cul-de-Sac · Vaulted Ceilings · New HVAC · Crown Molding"},
    {"id": "a4", "address": "2210 Vineyard Ave", "beds": 3, "baths": 2, "sqft": 2105,
     "status": "Active", "listPrice": 799000, "daysOnMarket": 34, "pricePerSqft": 380,
     "yearBuilt": 2006, "hasPool": True,
     "features": "Pool & Spa · Gourmet Kitchen · Extended Garage · Solar"},
    {"id": "a5", "address": "937 Riesling Way", "beds": 2, "baths": 2, "sqft": 1842,
     "status": "Pending", "listPrice": 675000, "daysOnMarket": 52, "pricePerSqft": 366,
     "yearBuilt": 2009, "hasPool": False,
     "features": "Updated Baths · New Appliances · Pergola Patio"},
    {"id": "a6", "address": "1748 Sauvignon St", "beds": 2, "baths": 2, "sqft": 1680,
     "status": "Active", "listPrice": 629000, "daysOnMarket": 7, "pricePerSqft": 374,
     "yearBuilt": 2010, "hasPool": False,
     "features": "Fresh Paint · New Carpet · Artificial Turf · Near Clubhouse"},
]

RECENT_SALES = [
    {"address": "622 Zinfandel Dr", "beds": 2, "baths": 2, "sqft": 1842,
     "listPrice": 689000, "salePrice": 683000, "saleDate": "Jan 14, 2026",
     "daysOnMarket": 44, "pricePerSqft": 371, "hasPool": False},
    {"address": "310 Pinot Noir Pl", "beds": 2, "baths": 2, "sqft": 1720,
     "listPrice": 645000, "salePrice": 651000, "saleDate": "Jan 22, 2026",
     "daysOnMarket": 43, "pricePerSqft": 378, "hasPool": False},
    {"address": "1512 Tempranillo Ct", "beds": 3, "baths": 2, "sqft": 2250,
     "listPrice": 849000, "salePrice": 835000, "saleDate": "Jan 8, 2026",
     "daysOnMarket": 54, "pricePerSqft": 371, "hasPool": True},
    {"address": "784 Grenache Rd", "beds": 2, "baths": 2, "sqft": 1842,
     "listPrice": 669000, "salePrice": 662000, "saleDate": "Dec 5, 2025",
     "daysOnMarket": 38, "pricePerSqft": 359, "hasPool": False},
    {"address": "2045 Syrah Ln", "beds": 2, "baths": 2, "sqft": 1960,
     "listPrice": 715000, "salePrice": 708000, "saleDate": "Nov 30, 2025",
     "daysOnMarket": 46, "pricePerSqft": 361, "hasPool": False},
    {"address": "508 Viognier Way", "beds": 2, "baths": 2, "sqft": 1680,
     "listPrice": 629000, "salePrice": 625000, "saleDate": "Oct 28, 2025",
     "daysOnMarket": 38, "pricePerSqft": 372, "hasPool": False},
    {"address": "1122 Barbera Blvd", "beds": 3, "baths": 2, "sqft": 2105,
     "listPrice": 759000, "salePrice": 750000, "saleDate": "Oct 15, 2025",
     "daysOnMarket": 40, "pricePerSqft": 356, "hasPool": False},
    {"address": "379 Roussanne Ct", "beds": 2, "baths": 2, "sqft": 1842,
     "listPrice": 659000, "salePrice": 658000, "saleDate": "Sep 25, 2025",
     "daysOnMarket": 38, "pricePerSqft": 357, "hasPool": False},
]

MARKET_STATS = {
    "avgListPrice": 710167, "medianListPrice": 687000,
    "avgSalePrice": 684000, "medianSalePrice": 672500,
    "avgPricePerSqft": 371, "avgDaysOnMarket": 43,
    "totalActiveListing": 5, "totalSoldLast90Days": 5,
    "listToSaleRatio": 0.983, "monthsOfInventory": 3.0,
}

COMP_STATS = {
    "avgListPrice": 687000, "medianListPrice": 675000,
    "avgSalePrice": 667500, "avgPricePerSqft": 367,
    "avgDaysOnMarket": 41, "count": 6, "estimatedValue": 685000,
}

PRICE_TREND = [
    {"month": "Mar 2025", "avgPrice": 648000, "medianPrice": 635000, "salesVolume": 4, "avgPricePerSqft": 347},
    {"month": "Apr 2025", "avgPrice": 655000, "medianPrice": 642000, "salesVolume": 6, "avgPricePerSqft": 351},
    {"month": "May 2025", "avgPrice": 668000, "medianPrice": 655000, "salesVolume": 8, "avgPricePerSqft": 356},
    {"month": "Jun 2025", "avgPrice": 679000, "medianPrice": 665000, "salesVolume": 9, "avgPricePerSqft": 360},
    {"month": "Jul 2025", "avgPrice": 685000, "medianPrice": 671000, "salesVolume": 7, "avgPricePerSqft": 364},
    {"month": "Aug 2025", "avgPrice": 672000, "medianPrice": 660000, "salesVolume": 6, "avgPricePerSqft": 362},
    {"month": "Sep 2025", "avgPrice": 665000, "medianPrice": 652000, "salesVolume": 5, "avgPricePerSqft": 358},
    {"month": "Oct 2025", "avgPrice": 671000, "medianPrice": 658000, "salesVolume": 7, "avgPricePerSqft": 360},
    {"month": "Nov 2025", "avgPrice": 678000, "medianPrice": 665000, "salesVolume": 5, "avgPricePerSqft": 363},
    {"month": "Dec 2025", "avgPrice": 683000, "medianPrice": 670000, "salesVolume": 4, "avgPricePerSqft": 366},
    {"month": "Jan 2026", "avgPrice": 680000, "medianPrice": 667000, "salesVolume": 3, "avgPricePerSqft": 368},
    {"month": "Feb 2026", "avgPrice": 690000, "medianPrice": 678000, "salesVolume": 5, "avgPricePerSqft": 372},
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def fmt(n):
    return f"${n:,.0f}"

def pct_diff(a, b):
    return ((a - b) / b) * 100

# ── Header ────────────────────────────────────────────────────────────────────

st.markdown("""
<div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 1.2rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
    <h2 style="color:white; margin:0; font-size:1.4rem;">🏡 Trilogy at the Vineyards</h2>
    <p style="color:#d1fae5; margin:0.2rem 0 0; font-size:0.85rem;">Brentwood, CA 94513 · Last updated March 8, 2026</p>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3, tab4 = st.tabs(["◉ Overview", "🏷 For Sale", "✓ Recent Sales", "↗ Trends"])

# ── Tab 1: Overview ───────────────────────────────────────────────────────────

with tab1:
    # My Home panel
    st.subheader("My Home")
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown(f"**{MY_HOME['address']}**")
        st.caption(f"{MY_HOME['beds']} bed · {MY_HOME['baths']} bath · {MY_HOME['sqft']:,} sqft · Built {MY_HOME['yearBuilt']} · {MY_HOME['garage']}-car garage")
    with col2:
        st.metric("Estimated Value", fmt(MY_HOME["estimatedValue"]),
                  delta=f"Range: {fmt(MY_HOME['estimatedValueLow'])} – {fmt(MY_HOME['estimatedValueHigh'])}")
    with col3:
        per_sqft = MY_HOME["estimatedValue"] // MY_HOME["sqft"]
        st.metric("Price per Sqft", f"${per_sqft}")

    st.divider()

    # Market Snapshot
    st.subheader("Market Snapshot · All Homes")
    c1, c2, c3, c4, c5 = st.columns(5)
    pending = sum(1 for h in ACTIVE_LISTINGS if h["status"] == "Pending")
    c1.metric("Active Listings", MARKET_STATS["totalActiveListing"], delta=f"{pending} pending")
    c2.metric("Avg List Price", f"${MARKET_STATS['avgListPrice']//1000:.0f}K",
              delta="Median $687K")
    c3.metric("Avg Sale Price", f"${MARKET_STATS['avgSalePrice']//1000:.0f}K",
              delta=f"{MARKET_STATS['listToSaleRatio']*100:.1f}% of list")
    c4.metric("Avg $/Sqft", f"${MARKET_STATS['avgPricePerSqft']}", delta="+3.9% YoY")
    c5.metric("Avg Days on Market", MARKET_STATS["avgDaysOnMarket"],
              delta=f"{MARKET_STATS['monthsOfInventory']} mo inventory")

    st.divider()

    # 2bd/2ba Comparables
    st.subheader("2bd / 2ba Comparables · Like Mine")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("My Est. Value", fmt(MY_HOME["estimatedValue"]),
              delta=f"${MY_HOME['estimatedValue']//MY_HOME['sqft']}/sqft")
    c2.metric("Avg Comp Sale", fmt(COMP_STATS["avgSalePrice"]),
              delta=f"${COMP_STATS['avgPricePerSqft']}/sqft")
    c3.metric("Median Comp List", fmt(COMP_STATS["medianListPrice"]))
    c4.metric("Avg DOM (Comps)", f"{COMP_STATS['avgDaysOnMarket']} days")

    st.divider()

    # Price trend preview chart
    st.subheader("Price Trend (12 months)")
    df_trend = pd.DataFrame(PRICE_TREND)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df_trend["month"], y=df_trend["avgPrice"],
                             name="Avg Price", line=dict(color="#10b981", width=2.5)))
    fig.add_trace(go.Scatter(x=df_trend["month"], y=df_trend["medianPrice"],
                             name="Median Price", line=dict(color="#6ee7b7", width=2, dash="dot")))
    fig.add_hline(y=MY_HOME["estimatedValue"], line_dash="dash", line_color="#f59e0b",
                  annotation_text="My Est. Value", annotation_position="top left")
    fig.update_layout(height=300, margin=dict(t=20, b=20), legend=dict(orientation="h"),
                      yaxis_tickformat="$,.0f", xaxis_tickangle=-30)
    st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # Active listings preview (first 3)
    st.subheader("Active Listings (preview)")
    active = [h for h in ACTIVE_LISTINGS if h["status"] == "Active"]
    cols = st.columns(3)
    for i, home in enumerate(active[:3]):
        with cols[i]:
            is_comp = home["beds"] == MY_HOME["beds"] and home["baths"] == MY_HOME["baths"] and abs(home["sqft"] - MY_HOME["sqft"]) <= 200
            badge = "🟢 Comp" if is_comp else ""
            st.markdown(f"**{home['address']}** {badge}")
            st.caption(f"{home['beds']}bd · {home['baths']}ba · {home['sqft']:,} sqft")
            st.metric("List Price", fmt(home["listPrice"]), delta=f"${home['pricePerSqft']}/sqft · {home['daysOnMarket']} DOM")

# ── Tab 2: For Sale ───────────────────────────────────────────────────────────

with tab2:
    st.subheader("Homes For Sale · Trilogy at the Vineyards")

    filter_comps = st.toggle("Show 2bd/2ba Comps Only")

    listings = ACTIVE_LISTINGS
    if filter_comps:
        listings = [h for h in listings if
                    h["beds"] == MY_HOME["beds"] and
                    h["baths"] == MY_HOME["baths"] and
                    abs(h["sqft"] - MY_HOME["sqft"]) <= 200]

    if not listings:
        st.info("No listings match the current filter.")
    else:
        cols = st.columns(3)
        for i, home in enumerate(listings):
            with cols[i % 3]:
                is_comp = home["beds"] == MY_HOME["beds"] and home["baths"] == MY_HOME["baths"] and abs(home["sqft"] - MY_HOME["sqft"]) <= 200
                status_color = "🟡" if home["status"] == "Pending" else "🟢"
                st.markdown(f"{status_color} **{home['address']}**")
                st.caption(f"{home['beds']}bd · {home['baths']}ba · {home['sqft']:,} sqft · Built {home['yearBuilt']}")
                diff = home["listPrice"] - MY_HOME["estimatedValue"]
                diff_str = f"+{fmt(diff)}" if diff > 0 else fmt(diff)
                st.metric("List Price", fmt(home["listPrice"]), delta=diff_str if is_comp else None)
                st.caption(f"${home['pricePerSqft']}/sqft · {home['daysOnMarket']} days on market")
                if home.get("features"):
                    st.caption(f"✦ {home['features']}")
                st.markdown("---")

# ── Tab 3: Recent Sales ───────────────────────────────────────────────────────

with tab3:
    st.subheader("Recent Sales · Trilogy at the Vineyards")

    # Comp banner
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("2bd/2ba Avg Sale", fmt(COMP_STATS["avgSalePrice"]))
    col2.metric("2bd/2ba Avg $/Sqft", f"${COMP_STATS['avgPricePerSqft']}")
    col3.metric("My Est. Value", fmt(MY_HOME["estimatedValue"]))
    col4.metric("Avg DOM (Comps)", f"{COMP_STATS['avgDaysOnMarket']} days")

    st.divider()

    # Sales table
    df_sales = pd.DataFrame(RECENT_SALES)
    df_sales["Comp?"] = df_sales.apply(
        lambda r: "✓" if r["beds"] == MY_HOME["beds"] and r["baths"] == MY_HOME["baths"] and abs(r["sqft"] - MY_HOME["sqft"]) <= 200 else "",
        axis=1
    )
    df_sales["List Price"] = df_sales["listPrice"].apply(fmt)
    df_sales["Sale Price"] = df_sales["salePrice"].apply(fmt)
    df_sales["$/Sqft"] = df_sales["pricePerSqft"].apply(lambda x: f"${x}")
    df_sales["DOM"] = df_sales["daysOnMarket"]

    st.dataframe(
        df_sales[["address", "beds", "baths", "sqft", "List Price", "Sale Price", "$/Sqft", "DOM", "saleDate", "Comp?"]].rename(columns={
            "address": "Address", "beds": "Beds", "baths": "Baths", "sqft": "Sqft",
            "saleDate": "Sale Date",
        }),
        use_container_width=True,
        hide_index=True,
    )

# ── Tab 4: Trends ─────────────────────────────────────────────────────────────

with tab4:
    st.subheader("Market Trends · 12-Month History")

    df_trend = pd.DataFrame(PRICE_TREND)
    first, last = PRICE_TREND[0], PRICE_TREND[-1]
    price_pct = (last["avgPrice"] - first["avgPrice"]) / first["avgPrice"] * 100
    ppsf_pct = (last["avgPricePerSqft"] - first["avgPricePerSqft"]) / first["avgPricePerSqft"] * 100
    peak = max(PRICE_TREND, key=lambda x: x["avgPrice"])

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Price Change YoY", f"+{price_pct:.1f}%",
              delta=f"+${(last['avgPrice']-first['avgPrice'])//1000:.0f}K avg")
    c2.metric("$/Sqft Change YoY", f"+{ppsf_pct:.1f}%",
              delta=f"+${last['avgPricePerSqft']-first['avgPricePerSqft']}/sqft")
    c3.metric("Peak Avg Price", fmt(peak["avgPrice"]), delta=peak["month"])
    my_ppsf = MY_HOME["estimatedValue"] // MY_HOME["sqft"]
    c4.metric("My Home vs Market", f"${my_ppsf}/sqft",
              delta=f"Market avg: ${last['avgPricePerSqft']}/sqft")

    st.divider()

    # Main trend chart
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df_trend["month"], y=df_trend["avgPrice"],
                             name="Avg Price", line=dict(color="#10b981", width=3),
                             fill="tozeroy", fillcolor="rgba(16,185,129,0.08)"))
    fig.add_trace(go.Scatter(x=df_trend["month"], y=df_trend["medianPrice"],
                             name="Median Price", line=dict(color="#6ee7b7", width=2, dash="dot")))
    fig.add_hline(y=MY_HOME["estimatedValue"], line_dash="dash", line_color="#f59e0b", line_width=2,
                  annotation_text=f"My Est. Value ({fmt(MY_HOME['estimatedValue'])})",
                  annotation_position="top left")
    fig.update_layout(height=380, margin=dict(t=20, b=20),
                      legend=dict(orientation="h"), yaxis_tickformat="$,.0f",
                      xaxis_tickangle=-30, yaxis_title="Price")
    st.plotly_chart(fig, use_container_width=True)

    # Sales volume bar
    fig2 = px.bar(df_trend, x="month", y="salesVolume",
                  title="Monthly Sales Volume",
                  color_discrete_sequence=["#10b981"])
    fig2.update_layout(height=240, margin=dict(t=40, b=20), xaxis_tickangle=-30,
                       yaxis_title="# Sales", xaxis_title="")
    st.plotly_chart(fig2, use_container_width=True)

    st.divider()

    # Monthly table (newest first)
    st.subheader("Monthly Breakdown")
    df_display = df_trend.copy()[::-1].reset_index(drop=True)
    df_display["Avg Price"] = df_display["avgPrice"].apply(fmt)
    df_display["Median Price"] = df_display["medianPrice"].apply(fmt)
    df_display["$/Sqft"] = df_display["avgPricePerSqft"].apply(lambda x: f"${x}")
    df_display["Sales Vol."] = df_display["salesVolume"]
    st.dataframe(
        df_display[["month", "Avg Price", "Median Price", "$/Sqft", "Sales Vol."]].rename(columns={"month": "Month"}),
        use_container_width=True,
        hide_index=True,
    )

st.markdown("""
<div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #e2e8f0; text-align:center; font-size:0.75rem; color:#94a3b8;">
Data shown is for Trilogy at the Vineyards, Brentwood CA 94513. Market data is representative and updated monthly.
For the most accurate valuations, consult a licensed real estate professional.
</div>
""", unsafe_allow_html=True)
