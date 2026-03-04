import { useState, useRef } from "react";

const T = {
  bg: "#07080C", surface: "#0D0E14", card: "#11121A", cardHover: "#161720",
  border: "#1C1D2A", accent: "#C8F135", accentDim: "rgba(200,241,53,0.08)",
  accentMid: "rgba(200,241,53,0.18)", red: "#FF4560", redDim: "rgba(255,69,96,0.1)",
  orange: "#FF8C42", orangeDim: "rgba(255,140,66,0.1)", blue: "#4DA6FF",
  blueDim: "rgba(77,166,255,0.1)", purple: "#A78BFA", purpleDim: "rgba(167,139,250,0.1)",
  text: "#E2E4F0", muted: "#6B6E8A", dim: "#1C1D2A", white: "#FFFFFF",
};

const ISSUE_RULES = [
  { id:"title_missing",  label:"Missing Title Tag",           cat:"On-Page",      sev:"critical", fix:"Add a unique <title> tag between 30–60 characters." },
  { id:"title_long",     label:"Title Too Long (>60 chars)",  cat:"On-Page",      sev:"warning",  fix:"Shorten title to under 60 characters." },
  { id:"title_short",    label:"Title Too Short (<30 chars)", cat:"On-Page",      sev:"warning",  fix:"Expand title to at least 30 characters." },
  { id:"title_dup",      label:"Duplicate Title Tag",         cat:"On-Page",      sev:"critical", fix:"Each page must have a unique title tag." },
  { id:"meta_missing",   label:"Missing Meta Description",    cat:"On-Page",      sev:"critical", fix:"Add a meta description between 120–160 characters." },
  { id:"meta_long",      label:"Meta Description Too Long",   cat:"On-Page",      sev:"warning",  fix:"Reduce meta description to under 160 characters." },
  { id:"meta_dup",       label:"Duplicate Meta Description",  cat:"On-Page",      sev:"critical", fix:"Each page must have a unique meta description." },
  { id:"h1_missing",     label:"Missing H1 Tag",              cat:"Structure",    sev:"critical", fix:"Add exactly one H1 tag per page." },
  { id:"h1_multiple",    label:"Multiple H1 Tags",            cat:"Structure",    sev:"warning",  fix:"Keep only one H1 tag per page." },
  { id:"canonical_miss", label:"Missing Canonical Tag",       cat:"Technical",    sev:"warning",  fix:"Add a self-referencing canonical tag." },
  { id:"noindex",        label:"Page is Noindexed",           cat:"Technical",    sev:"critical", fix:"Remove noindex directive if page should rank." },
  { id:"img_alt",        label:"Images Missing Alt Text",     cat:"Accessibility",sev:"warning",  fix:"Add descriptive alt attributes to all images." },
  { id:"slow_load",      label:"Slow Load Time (>3s)",        cat:"Performance",  sev:"warning",  fix:"Optimize images, enable caching, minify JS/CSS." },
  { id:"very_slow",      label:"Very Slow Load (>5s)",        cat:"Performance",  sev:"critical", fix:"Critical. Run Core Web Vitals audit immediately." },
  { id:"thin_content",   label:"Thin Content (<300 words)",   cat:"Content",      sev:"warning",  fix:"Expand to at least 600 words of relevant content." },
  { id:"broken_links",   label:"Broken Internal Links",       cat:"Technical",    sev:"critical", fix:"Fix or remove all broken internal links (404s)." },
  { id:"no_schema",      label:"No Structured Data",          cat:"Schema",       sev:"warning",  fix:"Add Schema.org markup (Article, Product, FAQ…)." },
  { id:"no_og",          label:"Missing Open Graph Tags",     cat:"Social",       sev:"warning",  fix:"Add og:title, og:description, og:image tags." },
];

const SEV_CFG = {
  critical: { color: T.red,    bg: T.redDim,    label: "CRITICAL" },
  warning:  { color: T.orange, bg: T.orangeDim, label: "WARNING"  },
  info:     { color: T.blue,   bg: T.blueDim,   label: "INFO"     },
};

const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const PAGE_SEEDS = [
  b => ({ url: b + "/",               title: "Home | Digital Growth Agency",   metaDesc: "We help brands grow through SEO and data-driven strategy.",    h1: "Grow with Data-Driven SEO", h1c: 1, can: b + "/",               noidx: false, altMiss: 0,       load: R(600,1800),  wc: R(900,2500),  bl: 0,       schema: true,  og: true,  il: R(8,20)  }),
  b => ({ url: b + "/about",          title: "About Us",                        metaDesc: "",                                                              h1: "Our Story",                 h1c: 1, can: b + "/about",          noidx: false, altMiss: R(1,4),  load: R(1200,2800), wc: R(400,1200),  bl: 0,       schema: false, og: false, il: R(3,10)  }),
  b => ({ url: b + "/services",       title: "SEO & Digital Marketing Services Agency Helping Businesses Rank Higher and Convert Better Since 2015", metaDesc: "Full-service SEO: technical, content, links.", h1: "Our Services", h1c: 1, can: b + "/services", noidx: false, altMiss: 0, load: R(800,2000), wc: R(600,1800), bl: 0, schema: true, og: true, il: R(5,15) }),
  b => ({ url: b + "/blog",           title: "Blog",                            metaDesc: "Latest insights on SEO.",                                       h1: "Blog",                      h1c: 1, can: "",                    noidx: false, altMiss: R(0,3),  load: R(2000,4500), wc: R(200,500),   bl: R(0,2),  schema: false, og: false, il: R(2,8)   }),
  b => ({ url: b + "/blog/seo-guide", title: "Complete SEO Guide 2024",         metaDesc: "Learn SEO with our comprehensive 2024 guide.",                 h1: "Complete SEO Guide 2024",   h1c: 1, can: b + "/blog/seo-guide", noidx: false, altMiss: R(0,2),  load: R(1500,3200), wc: R(2000,5000), bl: 0,       schema: true,  og: true,  il: R(6,18)  }),
  b => ({ url: b + "/contact",        title: "Contact",                         metaDesc: "Get in touch.",                                                 h1: "",                          h1c: 0, can: b + "/contact",        noidx: false, altMiss: 0,       load: R(500,1200),  wc: R(80,200),    bl: 0,       schema: false, og: false, il: R(1,5)   }),
  b => ({ url: b + "/pricing",        title: "",                                metaDesc: "",                                                              h1: "",                          h1c: 0, can: "",                    noidx: R(0,3)<1, altMiss: R(0,6), load: R(3000,7000), wc: R(150,400),   bl: R(1,5),  schema: false, og: false, il: R(1,4)   }),
  b => ({ url: b + "/case-studies",   title: "Case Studies | Success Stories",  metaDesc: "Explore our client success stories.",                           h1: "Client Success Stories",    h1c: 1, can: b + "/case-studies",  noidx: false, altMiss: R(2,8),  load: R(1800,4000), wc: R(500,1500),  bl: R(0,3),  schema: false, og: true,  il: R(4,12)  }),
  b => ({ url: b + "/faq",            title: "FAQ",                             metaDesc: "Frequently asked questions.",                                   h1: "FAQ",                       h1c: 2, can: b + "/faq",            noidx: false, altMiss: 0,       load: R(700,1800),  wc: R(400,1200),  bl: 0,       schema: true,  og: false, il: R(2,8)   }),
  b => ({ url: b + "/privacy-policy", title: "Privacy Policy",                  metaDesc: "Our privacy policy.",                                           h1: "Privacy Policy",            h1c: 1, can: b + "/privacy",       noidx: true,  altMiss: 0,       load: R(400,1000),  wc: R(600,1500),  bl: 0,       schema: false, og: false, il: R(1,3)   }),
  b => ({ url: b + "/blog/keywords",  title: "Keyword Research Guide",          metaDesc: "Master keyword research step by step.",                         h1: "Keyword Research Guide",    h1c: 1, can: b + "/blog/keywords",  noidx: false, altMiss: R(0,3),  load: R(1200,3000), wc: R(1500,4000), bl: 0,       schema: false, og: true,  il: R(4,14)  }),
  b => ({ url: b + "/team",           title: "Meet the Team",                   metaDesc: "",                                                              h1: "Meet Our Team",             h1c: 1, can: "",                    noidx: false, altMiss: R(3,10), load: R(2000,5500), wc: R(200,600),   bl: R(0,2),  schema: false, og: false, il: R(2,6)   }),
];

function computeIssues(page, allTitles, allMetas) {
  const issues = [];
  const add = id => { const r = ISSUE_RULES.find(r => r.id === id); if (r) issues.push({ ...r }); };
  if (!page.title) add("title_missing");
  else {
    if (page.title.length > 60) add("title_long");
    if (page.title.length < 30) add("title_short");
    if (allTitles.filter(t => t === page.title).length > 1) add("title_dup");
  }
  if (!page.metaDesc) add("meta_missing");
  else {
    if (page.metaDesc.length > 160) add("meta_long");
    if (allMetas.filter(m => m === page.metaDesc).length > 1) add("meta_dup");
  }
  if (!page.h1) add("h1_missing");
  if (page.h1c > 1) add("h1_multiple");
  if (!page.can) add("canonical_miss");
  if (page.noidx) add("noindex");
  if (page.altMiss > 0) add("img_alt");
  if (page.load > 5000) add("very_slow");
  else if (page.load > 3000) add("slow_load");
  if (page.wc < 300) add("thin_content");
  if (page.bl > 0) add("broken_links");
  if (!page.schema) add("no_schema");
  if (!page.og) add("no_og");
  return issues;
}

function runCrawl(baseUrl, onProgress, onDone) {
  const seeds = [...PAGE_SEEDS].sort(() => Math.random() - 0.5).slice(0, R(8, 12));
  const pages = seeds.map(s => s(baseUrl.replace(/\/$/, "")));
  const allTitles = pages.map(p => p.title);
  const allMetas  = pages.map(p => p.metaDesc);
  const results = [];
  let i = 0;
  function next() {
    if (i >= pages.length) { onDone(results); return; }
    setTimeout(() => {
      const p = pages[i];
      results.push({ ...p, issues: computeIssues(p, allTitles, allMetas) });
      i++;
      onProgress(Math.round((i / pages.length) * 100), p.url, [...results]);
      next();
    }, R(200, 500));
  }
  next();
}

const MOCK_KEYWORDS = [
  { kw: "seo agency",             pos: 4,  prev: 7,  vol: 8100,  clicks: 320, imp: 4200 },
  { kw: "technical seo services", pos: 2,  prev: 2,  vol: 3600,  clicks: 210, imp: 1800 },
  { kw: "seo consultant",         pos: 11, prev: 8,  vol: 12000, clicks: 95,  imp: 3400 },
  { kw: "local seo company",      pos: 6,  prev: 9,  vol: 5400,  clicks: 180, imp: 2100 },
  { kw: "link building service",  pos: 3,  prev: 5,  vol: 2900,  clicks: 150, imp: 980  },
  { kw: "content marketing",      pos: 15, prev: 12, vol: 4400,  clicks: 42,  imp: 2800 },
  { kw: "seo audit tool",         pos: 8,  prev: 8,  vol: 6600,  clicks: 210, imp: 3100 },
  { kw: "on page seo",            pos: 1,  prev: 3,  vol: 7200,  clicks: 540, imp: 2900 },
  { kw: "backlink checker",       pos: 24, prev: 18, vol: 14800, clicks: 15,  imp: 5200 },
  { kw: "seo reporting software", pos: 5,  prev: 6,  vol: 1800,  clicks: 110, imp: 720  },
  { kw: "competitor seo",         pos: 9,  prev: 14, vol: 3200,  clicks: 130, imp: 1650 },
  { kw: "keyword research",       pos: 19, prev: 22, vol: 9900,  clicks: 28,  imp: 4600 },
];

const HISTORY = Array.from({ length: 12 }, (_, i) => ({
  mo: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  pos: Math.max(1, Math.round(18 - i * 1.1 + R(-2, 2))),
  clicks: 800 + i * 120 + R(-80, 80),
  imp: 15000 + i * 800 + R(-500, 500),
}));

// ── atoms ──────────────────────────────────────────────────
function Pill({ sev, children }) {
  const c = SEV_CFG[sev] || SEV_CFG.info;
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 9, fontWeight: 700,
      letterSpacing: "1px", padding: "3px 7px", borderRadius: 3,
      border: `1px solid ${c.color}30`, whiteSpace: "nowrap" }}>
      {children || c.label}
    </span>
  );
}

function KPI({ label, value, color }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || T.accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: T.muted, marginTop: 6, letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Bar({ pct, color }) {
  return (
    <div style={{ height: 3, background: T.dim, borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct || 0)}%`,
        background: color || T.accent, borderRadius: 2, transition: "width .6s ease" }} />
    </div>
  );
}

function MiniChart({ data, color, invert }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const W = 280, H = 50;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = invert ? ((v - mn) / rng) * (H - 6) + 3 : H - ((v - mn) / rng) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreRing({ score }) {
  const r = 42, c = 2 * Math.PI * r, dash = (score / 100) * c;
  const color = score >= 75 ? T.accent : score >= 45 ? T.orange : T.red;
  return (
    <svg width="110" height="110">
      <circle cx="55" cy="55" r={r} fill="none" stroke={T.dim} strokeWidth="7" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 5px ${color}80)` }} />
      <text x="55" y="51" textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 24, fontWeight: 800, fill: color, fontFamily: "inherit" }}>{score}</text>
      <text x="55" y="67" textAnchor="middle"
        style={{ fontSize: 9, fill: T.muted, fontFamily: "inherit", letterSpacing: "1px" }}>SCORE</text>
    </svg>
  );
}

// ── main app ───────────────────────────────────────────────
export default function App() {
  const [nav,      setNav]      = useState("dashboard");
  const [projs,    setProjs]    = useState([
    { id: 1, name: "My Agency Site",    url: "https://myagency.com",   results: [], score: null, crawled: false, lastCrawl: null },
    { id: 2, name: "E-commerce Client", url: "https://shopclient.com", results: [], score: null, crawled: false, lastCrawl: null },
  ]);
  const [active,   setActive]   = useState(1);
  const [crawling, setCrawling] = useState(false);
  const [pct,      setPct]      = useState(0);
  const [curUrl,   setCurUrl]   = useState("");
  const [toasts,   setToasts]   = useState([]);
  const [subTab,   setSubTab]   = useState("overview");
  const [rankTab,  setRankTab]  = useState("keywords");
  const [flt,      setFlt]      = useState("all");
  const [srt,      setSrt]      = useState("issues");
  const [expanded, setExpanded] = useState(null);
  const [newName,  setNewName]  = useState("");
  const [newUrl,   setNewUrl]   = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [csvText,  setCsvText]  = useState("");
  const [mode,     setMode]     = useState("url");
  const fileRef = useRef();

  const proj    = projs.find(p => p.id === active) || projs[0];
  const results = proj?.results || [];

  function toast(msg, type = "info") {
    const id = Date.now() + Math.random();
    setToasts(t => [...t.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }

  function startCrawl() {
    if (crawling) return;
    setCrawling(true); setPct(0); setExpanded(null);
    setProjs(ps => ps.map(p => p.id === active ? { ...p, results: [] } : p));
    runCrawl(proj.url,
      (p, url, partial) => {
        setPct(p); setCurUrl(url);
        const last = partial[partial.length - 1];
        if (last?.issues.some(i => i.sev === "critical"))
          toast(`Critical: ${last.url.replace(/^https?:\/\/[^/]+/, "") || "/"}`, "critical");
        setProjs(ps => ps.map(p => p.id === active ? { ...p, results: partial } : p));
      },
      final => {
        const crit = final.reduce((a, r) => a + r.issues.filter(i => i.sev === "critical").length, 0);
        const warn = final.reduce((a, r) => a + r.issues.filter(i => i.sev === "warning").length, 0);
        const score = Math.max(0, Math.round(100 - crit * 8 - warn * 2.5));
        const ts = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        setProjs(ps => ps.map(p => p.id === active ? { ...p, results: final, score, crawled: true, lastCrawl: ts } : p));
        setCrawling(false);
        toast(`Crawl done — ${final.length} pages, ${crit} critical`, "success");
      }
    );
  }

  function addProject() {
    if (!newName || !newUrl) return;
    const id = Date.now();
    const url = newUrl.startsWith("http") ? newUrl : "https://" + newUrl;
    setProjs(ps => [...ps, { id, name: newName, url, results: [], score: null, crawled: false, lastCrawl: null }]);
    setActive(id); setShowAdd(false); setNewName(""); setNewUrl("");
  }

  const totalIssues = results.reduce((a, r) => a + r.issues.length, 0);
  const critCount   = results.reduce((a, r) => a + r.issues.filter(i => i.sev === "critical").length, 0);
  const warnCount   = results.reduce((a, r) => a + r.issues.filter(i => i.sev === "warning").length, 0);
  const avgLoad     = results.length ? (results.reduce((a, r) => a + r.load, 0) / results.length / 1000).toFixed(1) : "—";

  const filtered = results
    .filter(r => flt === "all" || r.issues.some(i => i.sev === flt))
    .sort((a, b) => {
      if (srt === "issues")   return b.issues.length - a.issues.length;
      if (srt === "critical") return b.issues.filter(x => x.sev === "critical").length - a.issues.filter(x => x.sev === "critical").length;
      if (srt === "load")     return b.load - a.load;
      return 0;
    });

  const grouped = ISSUE_RULES.map(rule => ({
    ...rule, pages: results.filter(r => r.issues.some(i => i.id === rule.id))
  })).filter(r => r.pages.length > 0)
    .sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.sev] - { critical: 0, warning: 1, info: 2 }[b.sev]) || b.pages.length - a.pages.length);

  const catMap = {};
  results.forEach(r => r.issues.forEach(i => { catMap[i.cat] = (catMap[i.cat] || 0) + 1; }));
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const NAV = [
    { id: "dashboard", ico: "⬡",  label: "Dashboard" },
    { id: "crawl",     ico: "🕸", label: "Crawler"   },
    { id: "rankings",  ico: "◈",  label: "Rankings"  },
    { id: "issues",    ico: "◉",  label: "Issues"    },
    { id: "report",    ico: "⊞",  label: "Report"    },
    { id: "settings",  ico: "⚙",  label: "Settings"  },
  ];

  const inp = { width: "100%", background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 4, fontSize: 11, fontFamily: "inherit" };
  const tabStyle = active => ({ padding: "10px 18px", background: "transparent", border: "none", borderBottom: `2px solid ${active ? T.accent : "transparent"}`, color: active ? T.accent : T.muted, fontSize: 9, letterSpacing: "2px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" });
  const btnStyle = on => ({ background: on ? T.accentMid : "transparent", border: `1px solid ${on ? T.accent : T.border}`, color: on ? T.accent : T.muted, padding: "6px 14px", borderRadius: 4, fontSize: 9, letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" });

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: T.bg, minHeight: "100vh", color: T.text, display: "flex", overflow: "hidden", height: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1C1D2A;border-radius:2px}
        input,textarea,select{font-family:inherit;outline:none}
        button{font-family:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .hov:hover{background:rgba(200,241,53,.05)!important;cursor:pointer}
        .navhov{transition:all .12s}
        .navhov:hover{background:rgba(200,241,53,.08)!important;color:${T.accent}!important;cursor:pointer}
        .btnprimary{transition:all .15s}
        .btnprimary:hover{background:${T.accent}!important;color:#000!important}
        .projtile:hover{background:rgba(255,255,255,.03)!important;cursor:pointer}
      `}</style>

      {/* TOASTS */}
      <div style={{ position: "fixed", top: 14, right: 14, zIndex: 9999, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none" }}>
        {toasts.map(t => {
          const col = t.type === "critical" ? T.red : t.type === "success" ? T.accent : T.blue;
          return (
            <div key={t.id} style={{ background: T.card, border: `1px solid ${col}40`, borderLeft: `3px solid ${col}`, borderRadius: 6, padding: "10px 14px", fontSize: 10, color: T.text, maxWidth: 300, animation: "slideIn .25s ease" }}>
              {t.msg}
            </div>
          );
        })}
      </div>

      {/* SIDEBAR */}
      <div style={{ width: 210, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1 }}>SEO<span style={{ color: T.accent }}>PILOT</span></div>
              <div style={{ fontSize: 8, color: T.muted, letterSpacing: "2px" }}>AUTOMATION SUITE</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 10px 6px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 8, color: T.muted, letterSpacing: "2px" }}>PROJECTS</span>
            <button onClick={() => setShowAdd(true)} style={{ background: "transparent", border: "none", color: T.muted, fontSize: 20, lineHeight: 1, cursor: "pointer" }}>+</button>
          </div>
          {projs.map(p => (
            <div key={p.id} className="projtile" onClick={() => setActive(p.id)}
              style={{ border: `1px solid ${active === p.id ? T.accent + "40" : T.border}`, borderRadius: 5, padding: "7px 9px", marginBottom: 4, background: active === p.id ? "rgba(200,241,53,.07)" : T.card }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, color: T.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{p.name}</div>
                {p.score !== null && <div style={{ fontSize: 10, fontWeight: 800, color: p.score >= 75 ? T.accent : p.score >= 45 ? T.orange : T.red }}>{p.score}</div>}
              </div>
              <div style={{ fontSize: 8, color: T.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.url.replace(/^https?:\/\//, "")}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px", flex: 1, overflowY: "auto" }}>
          {NAV.map(item => (
            <div key={item.id} className="navhov" onClick={() => { setNav(item.id); setSubTab("overview"); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 5, marginBottom: 2, color: nav === item.id ? T.accent : T.muted, background: nav === item.id ? "rgba(200,241,53,.08)" : "transparent", borderLeft: `2px solid ${nav === item.id ? T.accent : "transparent"}` }}>
              <span style={{ fontSize: 13 }}>{item.ico}</span>
              <span style={{ fontSize: 11 }}>{item.label}</span>
              {item.id === "issues" && critCount > 0 && (
                <span style={{ marginLeft: "auto", background: T.redDim, color: T.red, fontSize: 8, padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>{critCount}</span>
              )}
            </div>
          ))}
        </div>

        {crawling && (
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
              <span style={{ color: T.accent, animation: "blink 1s infinite" }}>● CRAWLING</span>
              <span style={{ color: T.muted }}>{pct}%</span>
            </div>
            <div style={{ height: 2, background: T.dim, borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: T.accent, transition: "width .3s ease" }} />
            </div>
            <div style={{ fontSize: 8, color: T.muted, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {curUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "11px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, lineHeight: 1 }}>{proj?.name}</div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{proj?.url}{proj?.lastCrawl && ` · ${proj.lastCrawl}`}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {proj?.score !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 12px" }}>
                <span style={{ fontSize: 9, color: T.muted }}>HEALTH</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: proj.score >= 75 ? T.accent : proj.score >= 45 ? T.orange : T.red }}>{proj.score}/100</span>
              </div>
            )}
            <button className="btnprimary" onClick={startCrawl} disabled={crawling}
              style={{ background: crawling ? T.dim : T.accentMid, border: `1px solid ${crawling ? T.border : T.accent}`, color: crawling ? T.muted : T.accent, padding: "8px 18px", borderRadius: 5, fontSize: 10, letterSpacing: "1.5px", fontWeight: 700, cursor: crawling ? "not-allowed" : "pointer", transition: "all .15s" }}>
              {crawling ? "⟳  CRAWLING…" : "▶  RUN CRAWL"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>

          {/* DASHBOARD */}
          {nav === "dashboard" && (
            <div style={{ animation: "fadeUp .25s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
                <KPI label="Health Score"    value={proj?.score ?? "—"} />
                <KPI label="Pages Crawled"   value={results.length || "—"} color={T.blue} />
                <KPI label="Critical Issues" value={critCount || "—"} color={T.red} />
                <KPI label="Warnings"        value={warnCount || "—"} color={T.orange} />
              </div>
              {results.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 12 }}>ISSUES BY CATEGORY</div>
                    {cats.map(([cat, cnt]) => (
                      <div key={cat} style={{ marginBottom: 9 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                          <span style={{ color: T.text }}>{cat}</span><span style={{ color: T.muted }}>{cnt}</span>
                        </div>
                        <Bar pct={(cnt / totalIssues) * 100} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 12 }}>PAGES NEEDING ATTENTION</div>
                    {[...results].sort((a, b) => b.issues.length - a.issues.length).slice(0, 5).map((p, i) => {
                      const crit = p.issues.filter(x => x.sev === "critical").length;
                      return (
                        <div key={i} className="hov" onClick={() => { setNav("crawl"); setSubTab("pages"); setExpanded(p.url); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, borderRadius: 4, padding: "4px 6px" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.dim, width: 18, textAlign: "center" }}>{i + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                            </div>
                            <Bar pct={(p.issues.length / 10) * 100} color={crit > 0 ? T.red : T.orange} />
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {crit > 0 && <Pill sev="critical">{crit}</Pill>}
                            <Pill sev="warning">{p.issues.filter(x => x.sev === "warning").length}</Pill>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 12 }}>LOAD TIME DISTRIBUTION</div>
                    {[
                      { label: "Fast  (<1.5s)",  pages: results.filter(r => r.load < 1500),              color: T.accent },
                      { label: "OK    (1.5–3s)", pages: results.filter(r => r.load >= 1500 && r.load < 3000), color: T.blue },
                      { label: "Slow  (3–5s)",   pages: results.filter(r => r.load >= 3000 && r.load < 5000), color: T.orange },
                      { label: "V.Slow (>5s)",   pages: results.filter(r => r.load >= 5000),              color: T.red },
                    ].map(g => (
                      <div key={g.label} style={{ marginBottom: 9 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                          <span style={{ color: T.text }}>{g.label}</span><span style={{ color: g.color }}>{g.pages.length} pages</span>
                        </div>
                        <Bar pct={(g.pages.length / results.length) * 100} color={g.color} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 12 }}>ALL PROJECTS</div>
                    {projs.map(p => (
                      <div key={p.id} className="hov" onClick={() => setActive(p.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 5, marginBottom: 4 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, color: T.text }}>{p.name}</div>
                          <div style={{ fontSize: 8, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.url.replace(/^https?:\/\//, "")}</div>
                        </div>
                        {p.score !== null
                          ? <div style={{ fontSize: 20, fontWeight: 800, color: p.score >= 75 ? T.accent : p.score >= 45 ? T.orange : T.red }}>{p.score}</div>
                          : <span style={{ fontSize: 9, color: T.muted }}>No crawl</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 12, opacity: .4 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: T.dim }}>NO DATA</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Click RUN CRAWL to audit this project</div>
                </div>
              )}
            </div>
          )}

          {/* CRAWLER */}
          {nav === "crawl" && (
            <div style={{ animation: "fadeUp .25s ease" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 18 }}>
                {["overview", "pages", "performance"].map(t => (
                  <button key={t} style={tabStyle(subTab === t)} onClick={() => setSubTab(t)}>{t.toUpperCase()}</button>
                ))}
              </div>
              {subTab === "overview" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
                    <KPI label="Pages"    value={results.length || "—"} color={T.blue} />
                    <KPI label="Issues"   value={totalIssues || "—"} color={T.orange} />
                    <KPI label="Critical" value={critCount || "—"} color={T.red} />
                    <KPI label="Warnings" value={warnCount || "—"} color={T.orange} />
                    <KPI label="Avg Load" value={avgLoad === "—" ? avgLoad : avgLoad + "s"} color={T.blue} />
                  </div>
                  {results.length === 0
                    ? <div style={{ textAlign: "center", padding: 60, color: T.muted, fontSize: 11 }}>Run a crawl to see results</div>
                    : grouped.map(issue => (
                      <div key={issue.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: "11px 14px", marginBottom: 5, display: "flex", alignItems: "center", gap: 12 }}>
                        <Pill sev={issue.sev} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: T.text, marginBottom: 3 }}>{issue.label}</div>
                          <div style={{ fontSize: 9, color: T.muted }}>{issue.fix}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120, flexShrink: 0 }}>
                          <Bar pct={(issue.pages.length / results.length) * 100} color={SEV_CFG[issue.sev]?.color} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: SEV_CFG[issue.sev]?.color, minWidth: 20, textAlign: "right" }}>{issue.pages.length}</div>
                        </div>
                      </div>
                    ))
                  }
                </>
              )}
              {subTab === "pages" && (
                <>
                  <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                    {["all", "critical", "warning"].map(f => (
                      <button key={f} style={btnStyle(flt === f)} onClick={() => setFlt(f)}>{f.toUpperCase()}</button>
                    ))}
                    <select onChange={e => setSrt(e.target.value)} value={srt}
                      style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`, color: T.muted, padding: "5px 10px", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>
                      <option value="issues">Most Issues</option>
                      <option value="critical">Critical First</option>
                      <option value="load">Slowest First</option>
                    </select>
                  </div>
                  {filtered.length === 0
                    ? <div style={{ textAlign: "center", padding: 50, color: T.muted, fontSize: 11 }}>{results.length === 0 ? "Run a crawl first" : "No pages match"}</div>
                    : filtered.map((page, i) => {
                      const crit = page.issues.filter(x => x.sev === "critical").length;
                      const warn = page.issues.filter(x => x.sev === "warning").length;
                      const open = expanded === page.url;
                      return (
                        <div key={i} style={{ background: open ? T.cardHover : T.card, border: `1px solid ${open ? T.accent + "30" : T.border}`, borderRadius: 6, marginBottom: 4, overflow: "hidden" }}>
                          <div className="hov" onClick={() => setExpanded(open ? null : page.url)}
                            style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: T.text, wordBreak: "break-all" }}>{page.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</div>
                              {page.title && <div style={{ fontSize: 9, color: T.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{page.title.substring(0, 55)}{page.title.length > 55 ? "…" : ""}</div>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              {crit > 0 && <Pill sev="critical">{crit} CRIT</Pill>}
                              {warn > 0 && <Pill sev="warning">{warn} WARN</Pill>}
                              {page.issues.length === 0 && <span style={{ fontSize: 9, color: T.accent, background: T.accentDim, padding: "3px 7px", borderRadius: 3, border: `1px solid ${T.accent}30` }}>✓ CLEAN</span>}
                              <span style={{ fontSize: 9, color: T.muted }}>{(page.load / 1000).toFixed(1)}s</span>
                              <span style={{ fontSize: 10, color: T.muted }}>{open ? "▲" : "▼"}</span>
                            </div>
                          </div>
                          {open && (
                            <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .2s ease" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, margin: "12px 0" }}>
                                {[
                                  { l: "Title Length", v: page.title ? page.title.length + " ch" : "Missing" },
                                  { l: "Meta Length",  v: page.metaDesc ? page.metaDesc.length + " ch" : "Missing" },
                                  { l: "Word Count",   v: page.wc },
                                  { l: "Load Time",    v: (page.load / 1000).toFixed(2) + "s" },
                                  { l: "H1 Count",     v: page.h1c },
                                  { l: "Int. Links",   v: page.il },
                                  { l: "Missing Alt",  v: page.altMiss },
                                  { l: "Canonical",    v: page.can ? "✓ Set" : "Missing" },
                                ].map(f => (
                                  <div key={f.l} style={{ background: T.surface, borderRadius: 4, padding: "7px 10px" }}>
                                    <div style={{ fontSize: 8, color: T.muted, letterSpacing: "1px" }}>{f.l.toUpperCase()}</div>
                                    <div style={{ fontSize: 11, color: T.text, marginTop: 3 }}>{f.v}</div>
                                  </div>
                                ))}
                              </div>
                              {page.issues.map((iss, j) => (
                                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 10px", background: SEV_CFG[iss.sev]?.bg, borderRadius: 4, marginBottom: 3 }}>
                                  <Pill sev={iss.sev} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 10, color: T.text }}>{iss.label}</div>
                                    <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}><span style={{ color: T.accent }}>Fix: </span>{iss.fix}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </>
              )}
              {subTab === "performance" && (
                results.length === 0
                  ? <div style={{ textAlign: "center", padding: 60, color: T.muted, fontSize: 11 }}>Run a crawl first</div>
                  : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[...results].sort((a, b) => b.load - a.load).map((page, i) => {
                      const color = page.load > 5000 ? T.red : page.load > 3000 ? T.orange : page.load > 1500 ? T.blue : T.accent;
                      return (
                        <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: "13px 15px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div style={{ fontSize: 10, color: T.text, flex: 1, marginRight: 10, wordBreak: "break-all" }}>{page.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color, flexShrink: 0 }}>{(page.load / 1000).toFixed(1)}s</div>
                          </div>
                          <Bar pct={Math.min(100, (page.load / 7000) * 100)} color={color} />
                          <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
                            <span style={{ fontSize: 9, color: T.muted }}>Words: {page.wc}</span>
                            <span style={{ fontSize: 9, color: T.muted }}>Links: {page.il}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>
          )}

          {/* RANKINGS */}
          {nav === "rankings" && (
            <div style={{ animation: "fadeUp .25s ease" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 18 }}>
                {["keywords", "trends"].map(t => (
                  <button key={t} style={tabStyle(rankTab === t)} onClick={() => setRankTab(t)}>{t.toUpperCase()}</button>
                ))}
              </div>
              {rankTab === "keywords" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
                    <KPI label="Tracked"    value={MOCK_KEYWORDS.length} color={T.blue} />
                    <KPI label="Top 3"      value={MOCK_KEYWORDS.filter(k => k.pos <= 3).length} color={T.accent} />
                    <KPI label="Top 10"     value={MOCK_KEYWORDS.filter(k => k.pos <= 10).length} color={T.purple} />
                    <KPI label="Tot. Clicks" value={MOCK_KEYWORDS.reduce((a, k) => a + k.clicks, 0).toLocaleString()} color={T.orange} />
                  </div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 65px 75px 75px 95px", padding: "9px 14px", borderBottom: `1px solid ${T.border}` }}>
                      {["KEYWORD","POS","PREV","CHANGE","VOLUME","CLICKS","IMPRESSIONS"].map(h => (
                        <div key={h} style={{ fontSize: 8, color: T.muted, letterSpacing: "1px" }}>{h}</div>
                      ))}
                    </div>
                    {MOCK_KEYWORDS.map((kw, i) => {
                      const diff = kw.prev - kw.pos;
                      return (
                        <div key={i} className="hov" style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 65px 75px 75px 95px", padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 11, color: T.text }}>{kw.kw}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: kw.pos <= 3 ? T.accent : kw.pos <= 10 ? T.blue : T.muted }}>{kw.pos}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{kw.prev}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? T.accent : diff < 0 ? T.red : T.muted }}>{diff > 0 ? `▲ ${diff}` : diff < 0 ? `▼ ${Math.abs(diff)}` : "—"}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{kw.vol.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: T.text }}>{kw.clicks.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{kw.imp.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {rankTab === "trends" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "Average Position", data: HISTORY.map(r => r.pos),    color: T.accent,  invert: true  },
                    { label: "Organic Clicks",    data: HISTORY.map(r => r.clicks), color: T.blue,    invert: false },
                    { label: "Impressions",       data: HISTORY.map(r => r.imp),    color: T.purple,  invert: false },
                    { label: "CTR Estimate (%)",  data: HISTORY.map(r => Math.round((r.clicks / r.imp) * 1000) / 10), color: T.orange, invert: false },
                  ].map(ch => (
                    <div key={ch.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px" }}>{ch.label.toUpperCase()}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: ch.color }}>{ch.data[ch.data.length - 1]}{ch.label.includes("%") ? "%" : ""}</div>
                      </div>
                      <MiniChart data={ch.data} color={ch.color} invert={ch.invert} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        {HISTORY.filter((_, i) => i % 3 === 0).map(r => (
                          <span key={r.mo} style={{ fontSize: 8, color: T.dim }}>{r.mo}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ISSUES */}
          {nav === "issues" && (
            <div style={{ animation: "fadeUp .25s ease" }}>
              {results.length === 0
                ? <div style={{ textAlign: "center", padding: 60, color: T.muted, fontSize: 11 }}>Run a crawl to see issues</div>
                : <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
                    <KPI label="Critical Issues" value={critCount} color={T.red} />
                    <KPI label="Warnings"        value={warnCount} color={T.orange} />
                    <KPI label="Total Issues"    value={totalIssues} color={T.blue} />
                  </div>
                  {grouped.map(issue => (
                    <div key={issue.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 15, marginBottom: 9 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                        <Pill sev={issue.sev} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: T.text, fontWeight: 500, marginBottom: 3 }}>{issue.label}</div>
                          <div style={{ fontSize: 9, color: T.muted }}><span style={{ color: T.accent }}>Fix: </span>{issue.fix}</div>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: SEV_CFG[issue.sev]?.color, flexShrink: 0 }}>{issue.pages.length}</div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {issue.pages.map((p, i) => (
                          <span key={i} className="hov" onClick={() => { setNav("crawl"); setSubTab("pages"); setExpanded(p.url); }}
                            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3, padding: "3px 8px", fontSize: 9, color: T.muted }}>
                            {p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              }
            </div>
          )}

          {/* REPORT */}
          {nav === "report" && (
            <div style={{ animation: "fadeUp .25s ease" }}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "24px 28px", maxWidth: 680 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 2 }}>SEO AUDIT REPORT</div>
                <div style={{ fontSize: 9, color: T.muted, marginBottom: 22 }}>{proj?.name} · {proj?.url} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                {results.length === 0
                  ? <div style={{ color: T.muted, fontSize: 11 }}>Run a crawl first to generate a report.</div>
                  : <>
                    <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
                      <ScoreRing score={proj?.score ?? 0} />
                      <div>
                        <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 10 }}>AUDIT SUMMARY</div>
                        {[
                          { label: "Pages Audited",      value: results.length },
                          { label: "Total Issues",        value: totalIssues, color: T.orange },
                          { label: "Critical Issues",     value: critCount,   color: T.red },
                          { label: "Warnings",            value: warnCount,   color: T.orange },
                          { label: "Avg. Load Time",      value: avgLoad === "—" ? avgLoad : avgLoad + "s" },
                          { label: "Clean Pages",         value: results.filter(r => r.issues.length === 0).length, color: T.accent },
                        ].map(row => (
                          <div key={row.label} style={{ display: "flex", gap: 16, marginBottom: 5, fontSize: 11 }}>
                            <span style={{ color: T.muted, minWidth: 160 }}>{row.label}</span>
                            <span style={{ color: row.color || T.text, fontWeight: 700 }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 12 }}>PRIORITY FIXES</div>
                      {grouped.slice(0, 7).map((issue, i) => (
                        <div key={issue.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.dim, minWidth: 22 }}>{i + 1}</div>
                          <div>
                            <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3 }}>
                              <Pill sev={issue.sev} />
                              <span style={{ fontSize: 11, color: T.text }}>{issue.label}</span>
                              <span style={{ fontSize: 9, color: T.muted }}>({issue.pages.length} pages)</span>
                            </div>
                            <div style={{ fontSize: 9, color: T.muted }}>{issue.fix}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: T.muted, letterSpacing: "2px", marginBottom: 10 }}>PAGE BREAKDOWN</div>
                      <div style={{ background: T.surface, borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 55px", padding: "8px 13px", borderBottom: `1px solid ${T.border}` }}>
                          {["PAGE", "CRIT", "WARN", "LOAD"].map(h => <div key={h} style={{ fontSize: 8, color: T.muted, letterSpacing: "1px" }}>{h}</div>)}
                        </div>
                        {[...results].sort((a, b) => b.issues.length - a.issues.length).map((p, i) => {
                          const cr = p.issues.filter(x => x.sev === "critical").length;
                          const wn = p.issues.filter(x => x.sev === "warning").length;
                          return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 55px", padding: "8px 13px", borderBottom: `1px solid ${T.border}`, fontSize: 10 }}>
                              <div style={{ color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</div>
                              <div style={{ color: cr > 0 ? T.red : T.muted }}>{cr || "—"}</div>
                              <div style={{ color: wn > 0 ? T.orange : T.muted }}>{wn || "—"}</div>
                              <div style={{ color: p.load > 3000 ? T.orange : T.muted }}>{(p.load / 1000).toFixed(1)}s</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ marginTop: 20, padding: 13, background: T.accentDim, border: `1px solid ${T.accent}20`, borderRadius: 5, fontSize: 10, color: T.muted }}>
                      <span style={{ color: T.accent, fontWeight: 700 }}>Note: </span>Connect Google Search Console in Settings for live keyword data.
                    </div>
                  </>
                }
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {nav === "settings" && (
            <div style={{ animation: "fadeUp .25s ease", maxWidth: 560 }}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 18, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 500, marginBottom: 12 }}>Crawl Mode</div>
                <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                  {["url", "csv"].map(m => (
                    <button key={m} style={btnStyle(mode === m)} onClick={() => setMode(m)}>
                      {m === "url" ? "🌐  CRAWL URL" : "📄  UPLOAD CSV"}
                    </button>
                  ))}
                </div>
                {mode === "csv" && (
                  <div>
                    <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"https://site.com/page-1\nhttps://site.com/page-2"} rows={4} style={{ ...inp, resize: "vertical", marginBottom: 8 }} />
                    <button onClick={() => fileRef.current?.click()} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted, padding: "7px 14px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>📂 Upload File</button>
                    <input ref={fileRef} type="file" accept=".csv,.txt" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setCsvText(ev.target.result); r.readAsText(f); }} style={{ display: "none" }} />
                  </div>
                )}
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 18, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 500, marginBottom: 3 }}>Google Search Console API</div>
                <div style={{ fontSize: 9, color: T.muted, marginBottom: 12 }}>Connect for real keyword rank data</div>
                <input placeholder="Paste GSC API Key…" style={{ ...inp, marginBottom: 9 }} />
                <button className="btnprimary" style={{ background: T.accentMid, border: `1px solid ${T.accent}`, color: T.accent, padding: "8px 18px", borderRadius: 4, fontSize: 10, letterSpacing: "1px", cursor: "pointer", transition: "all .15s" }}>CONNECT GSC</button>
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 18, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 500, marginBottom: 14 }}>Notifications</div>
                {[
                  { label: "Alert on Critical Issues", on: true  },
                  { label: "Alert on Ranking Drops",   on: true  },
                  { label: "Weekly Digest Email",       on: false },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                    <span style={{ fontSize: 11, color: T.text }}>{a.label}</span>
                    <div style={{ width: 34, height: 18, background: a.on ? T.accent : T.dim, borderRadius: 9, position: "relative", cursor: "pointer" }}>
                      <div style={{ width: 12, height: 12, background: T.white, borderRadius: "50%", position: "absolute", top: 3, left: a.on ? 19 : 3, transition: "left .2s" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 500, marginBottom: 12 }}>Add New Project</div>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project Name" style={{ ...inp, marginBottom: 8 }} />
                <input value={newUrl}  onChange={e => setNewUrl(e.target.value)}  placeholder="https://yoursite.com" style={{ ...inp, marginBottom: 12 }} />
                <button className="btnprimary" onClick={addProject} style={{ background: T.accentMid, border: `1px solid ${T.accent}`, color: T.accent, padding: "9px 22px", borderRadius: 4, fontSize: 10, letterSpacing: "1.5px", cursor: "pointer", transition: "all .15s" }}>+ ADD PROJECT</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 26, width: 340, animation: "fadeUp .2s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 18 }}>NEW PROJECT</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project Name"       style={{ ...inp, marginBottom: 8 }} />
            <input value={newUrl}  onChange={e => setNewUrl(e.target.value)}  placeholder="https://yoursite.com" style={{ ...inp, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btnprimary" onClick={addProject} style={{ flex: 1, background: T.accentMid, border: `1px solid ${T.accent}`, color: T.accent, padding: 10, borderRadius: 4, fontSize: 10, cursor: "pointer", transition: "all .15s" }}>CREATE</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "10px 18px", background: "transparent", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 4, fontSize: 10, cursor: "pointer" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
