import { useState, useEffect, useRef, useCallback } from "react";

// ── LOADING SCREEN ────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse2 { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 28 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #1e2230", borderTopColor: "#6c63ff", borderRightColor: "#ff6b9d", animation: "spin 1.2s linear infinite" }} />
        <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: "2px solid #1a1d26", borderBottomColor: "#00d4aa", animation: "spin 2s linear infinite reverse" }} />
        <div style={{ position: "absolute", inset: 12, borderRadius: "50%", overflow: "hidden", background: "#111318", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>⚡</div>
      </div>
      <h2 style={{ color: "#e8eaf0", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 26, margin: "0 0 6px", animation: "fadeIn .8s ease .3s both" }}>Nexus Chat</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 6, animation: "fadeIn .8s ease .6s both" }}>
        <span style={{ color: "#8b90a8", fontSize: 12, animation: "pulse2 1.5s ease-in-out infinite" }}>Loading...</span>
      </div>
      <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 28px", animation: "fadeIn .8s ease 1s both" }}>
        <span style={{ color: "#4a4f68", fontSize: 12 }}>by Xitorque Studio</span>
        <span style={{ color: "#4a4f68", fontSize: 12 }}>Chat with Mashori</span>
      </div>
    </div>
  );
}

const API = "https://nexus-backend-production-1e49.up.railway.app";
const WS  = "wss://nexus-backend-production-1e49.up.railway.app";

const api = {
  async req(method, path, body, token) {
    const h = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    const r = await fetch(`${API}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : null });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || "Error"); }
    return r.json();
  },
  get:   (p, t)    => api.req("GET", p, null, t),
  post:  (p, b, t) => api.req("POST", p, b, t),
  patch: (p, b, t) => api.req("PATCH", p, b, t),
  del:   (p, t)    => api.req("DELETE", p, null, t),
};

async function loginReq(username, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password })
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || "Login failed"); }
  return r.json();
}

// ── THEME SYSTEM ──────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: { p: "#0a0b0f", s: "#111318", t: "#1a1d26", h: "#1e2230", a: "#252a3a" },
    tx: { p: "#e8eaf0", s: "#8b90a8", m: "#4a4f68" },
    br: { d: "#1e2230", s: "#141720" },
    name: "Dark"
  },
  midnight: {
    bg: { p: "#050810", s: "#0d1120", t: "#131928", h: "#192035", a: "#1e2840" },
    tx: { p: "#dce8ff", s: "#7890b8", m: "#3a4f70" },
    br: { d: "#192035", s: "#0d1120" },
    name: "Midnight"
  },
  forest: {
    bg: { p: "#080e0a", s: "#0d1810", t: "#122015", h: "#162818", a: "#1a3020" },
    tx: { p: "#d8f0de", s: "#7aad88", m: "#3a6048" },
    br: { d: "#162818", s: "#0d1810" },
    name: "Forest"
  },
  rose: {
    bg: { p: "#0e080c", s: "#1a0e15", t: "#22121c", h: "#2a1525", a: "#32182c" },
    tx: { p: "#f0d8e8", s: "#b07a9a", m: "#684060" },
    br: { d: "#2a1525", s: "#1a0e15" },
    name: "Rose"
  },
  light: {
    bg: { p: "#f5f6fa", s: "#ffffff", t: "#eef0f7", h: "#e5e8f2", a: "#dde1f0" },
    tx: { p: "#1a1d26", s: "#4a4f68", m: "#8b90a8" },
    br: { d: "#dde1f0", s: "#e5e8f2" },
    name: "Light"
  }
};

const WALLPAPERS = [
  { id: "none", name: "None", preview: "transparent" },
  { id: "dots", name: "Dots", preview: "#1a1d26" },
  { id: "grid", name: "Grid", preview: "#1e2230" },
  { id: "waves", name: "Waves", preview: "#1a2230" },
  { id: "stars", name: "Stars", preview: "#080a14" },
  { id: "gradient1", name: "Aurora", preview: "linear-gradient(135deg,#0d1120,#1a0d20)" },
  { id: "gradient2", name: "Ocean", preview: "linear-gradient(135deg,#080e14,#0d1820)" },
];

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥", "🎉", "💯"];

const STATUS_OPTIONS = [
  { value: "online", label: "🟢 Online", color: "#00d4aa" },
  { value: "away", label: "🟡 Away", color: "#ffd166" },
  { value: "busy", label: "🔴 Busy", color: "#ff4757" },
  { value: "offline", label: "⚫ Offline", color: "#4a4f68" },
];

const ac = { p: "#6c63ff", s: "#ff6b9d", g: "#00d4aa", y: "#ffd166", r: "#ff4757" };

const Spin = ({ size = 20 }) => (
  <div style={{ width: size, height: size, border: `3px solid #1e223033`, borderTopColor: ac.p, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
);

// ── WALLPAPER RENDERER ────────────────────────────────────────
function WallpaperBG({ wallpaper, theme }) {
  const th = THEMES[theme] || THEMES.dark;
  if (!wallpaper || wallpaper === "none") return null;

  const svgs = {
    dots: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='1.5' fill='${encodeURIComponent(th.br.d)}'/></svg>`,
    grid: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M40 0L0 0 0 40' fill='none' stroke='${encodeURIComponent(th.br.d)}' stroke-width='0.5'/></svg>`,
    waves: `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='20'><path d='M0 10 Q20 0 40 10 Q60 20 80 10' fill='none' stroke='${encodeURIComponent(th.br.d)}' stroke-width='0.8'/></svg>`,
    stars: `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='10' cy='10' r='1' fill='#ffffff18'/><circle cx='40' cy='25' r='0.7' fill='#ffffff12'/><circle cx='55' cy='50' r='1.2' fill='#ffffff10'/></svg>`,
  };

  const gradients = {
    gradient1: "linear-gradient(135deg, #0d1120 0%, #1a0d20 50%, #0d1120 100%)",
    gradient2: "linear-gradient(135deg, #080e14 0%, #0d1820 50%, #080e14 100%)",
  };

  if (gradients[wallpaper]) return (
    <div style={{ position: "absolute", inset: 0, background: gradients[wallpaper], opacity: 0.6, zIndex: 0 }} />
  );

  if (svgs[wallpaper]) return (
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,${svgs[wallpaper]}")`, opacity: 0.5, zIndex: 0 }} />
  );
  return null;
}

// ── AVATAR ────────────────────────────────────────────────────
function Av({ user, size = 40, dot = false, statusColor = null }) {
  const cols = ["#6c63ff","#ff6b9d","#00d4aa","#ffd166","#ff4757"];
  const col = cols[((user?.username || "").charCodeAt(0) || 0) % cols.length];
  const init = (user?.name || user?.username || "?").slice(0, 2).toUpperCase();
  const statCol = statusColor || (user?.status === "online" ? ac.g : user?.status === "away" ? ac.y : user?.status === "busy" ? ac.r : "#4a4f68");
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `${col}22`, border: `2px solid ${col}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: col, overflow: "hidden" }}>
        {user?.avatar_base64 ? <img src={user.avatar_base64} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : init}
      </div>
      {dot && <div style={{ position: "absolute", bottom: 1, right: 1, width: size * 0.27, height: size * 0.27, borderRadius: "50%", background: statCol, border: `2px solid var(--bg-p, #0a0b0f)` }} />}
    </div>
  );
}

function Toast({ msg, type = "ok" }) {
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "err" ? ac.r : ac.g, color: "#fff", borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px #0006", animation: "fadeIn .3s ease" }}>{msg}</div>;
}

function Toggle({ label, desc, val, set }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid var(--br-s)` }}>
      <div>
        <div style={{ color: "var(--tx-p)", fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ color: "var(--tx-m)", fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => set(!val)} style={{ width: 44, height: 24, borderRadius: 12, background: val ? ac.p : "var(--bg-h)", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: val ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 460 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000088", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-s)", border: `1px solid var(--br-d)`, borderRadius: 20, padding: 28, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px #0008" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--tx-m)", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── SOUND NOTIFICATION ────────────────────────────────────────
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");
  const [unCheck, setUnCheck] = useState(null);
  const unTimer = useRef(null);

  const checkUsername = (val) => {
    setUser(val);
    if (mode !== "signup" || val.length < 3) { setUnCheck(null); return; }
    setUnCheck("checking");
    clearTimeout(unTimer.current);
    unTimer.current = setTimeout(async () => {
      try { await api.get(`/users/find/${val.trim()}`); setUnCheck("taken"); }
      catch { setUnCheck("available"); }
    }, 600);
  };

  const iStyle = { width: "100%", background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "12px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none", boxSizing: "border-box" };

  const submit = async () => {
    setErr(""); setLoad(true);
    try {
      let data;
      if (mode === "login") { data = await loginReq(user, pass); }
      else {
        if (!name || !user || !email || !pass) throw new Error("Sab fields bharo");
        data = await api.post("/auth/signup", { name, username: user, email, password: pass });
      }
      localStorage.setItem("nx_t", data.access_token);
      localStorage.setItem("nx_u", JSON.stringify(data.user));
      onLogin(data.user, data.access_token, data.go_to_settings);
    } catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-p)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, padding: 44, background: "var(--bg-s)", borderRadius: 24, border: `1px solid var(--br-d)`, boxShadow: "0 32px 80px #0008" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>⚡</div>
          <h1 style={{ margin: 0, color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 28 }}>NEXUS<span style={{ color: ac.p }}>.</span></h1>
          <p style={{ color: "var(--tx-m)", margin: "5px 0 0", fontSize: 13 }}>connect without barriers</p>
        </div>
        <div style={{ display: "flex", background: "var(--bg-t)", borderRadius: 12, padding: 4, marginBottom: 22 }}>
          {[["login","Sign In"],["signup","Sign Up"]].map(([m,l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 9, cursor: "pointer", background: mode===m ? "linear-gradient(135deg,#6c63ff,#ff6b9d)" : "transparent", color: mode===m ? "#fff" : "var(--tx-m)", fontWeight: 700, fontSize: 13 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {mode === "signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Apna naam" style={iStyle} />}
          <div style={{ position: "relative" }}>
            <input value={user} onChange={e => checkUsername(e.target.value)} placeholder="Username" style={{ ...iStyle, paddingRight: 42, border: `1px solid ${unCheck === "available" ? "#00d4aa" : unCheck === "taken" ? "#ff4757" : "var(--br-d)"}` }} />
            {mode === "signup" && unCheck === "checking" && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>⏳</span>}
            {mode === "signup" && unCheck === "available" && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#00d4aa" }}>✓</span>}
            {mode === "signup" && unCheck === "taken" && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#ff4757" }}>✕</span>}
          </div>
          {mode === "signup" && unCheck === "available" && <div style={{ color: "#00d4aa", fontSize: 12, marginTop: -6 }}>✓ Available!</div>}
          {mode === "signup" && unCheck === "taken" && <div style={{ color: "#ff4757", fontSize: 12, marginTop: -6 }}>✕ Taken</div>}
          {mode === "signup" && <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" style={iStyle} />}
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" style={iStyle} onKeyDown={e => e.key==="Enter" && submit()} />
          {err && <div style={{ color: ac.r, fontSize: 13, padding: "8px 12px", background: `${ac.r}15`, borderRadius: 8 }}>{err}</div>}
          <button onClick={submit} disabled={load} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 }}>
            {load ? <Spin /> : mode==="login" ? "Sign In ⚡" : "Create Account ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE VIEW MODAL ────────────────────────────────────────
function ProfileViewModal({ user, open, onClose, currentUserId, token, onOpenDM }) {
  if (!open || !user) return null;
  const statInfo = STATUS_OPTIONS.find(s => s.value === (user.status || "offline")) || STATUS_OPTIONS[3];
  return (
    <Modal open={open} onClose={onClose} title="👤 Profile" width={380}>
      <div style={{ textAlign: "center", paddingBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Av user={user} size={80} dot />
        </div>
        <div style={{ color: "var(--tx-p)", fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{user.name || user.username}</div>
        <div style={{ color: ac.p, fontSize: 13, margin: "3px 0" }}>@{user.username}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${statInfo.color}22`, border: `1px solid ${statInfo.color}44`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: statInfo.color, marginTop: 6 }}>
          {statInfo.label}
        </div>
        {user.custom_status && (
          <div style={{ color: "var(--tx-s)", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>"{user.custom_status}"</div>
        )}
        {user.bio && (
          <div style={{ color: "var(--tx-s)", fontSize: 13, marginTop: 12, padding: "10px 14px", background: "var(--bg-t)", borderRadius: 10 }}>{user.bio}</div>
        )}
        {user.email_public && (
          <div style={{ color: "var(--tx-m)", fontSize: 12, marginTop: 8 }}>📧 {user.email}</div>
        )}
        {user.last_seen && (
          <div style={{ color: "var(--tx-m)", fontSize: 12, marginTop: 6 }}>
            🕒 Last seen: {new Date(user.last_seen).toLocaleString()}
          </div>
        )}
        {user.id !== currentUserId && (
          <button onClick={() => { onOpenDM && onOpenDM(user); onClose(); }} style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            💬 Message
          </button>
        )}
      </div>
    </Modal>
  );
}

// ── SETTINGS PAGE ─────────────────────────────────────────────
function SettingsPage({ user, token, onUpdate, isFirst = false, currentTheme, onThemeChange, notifSound, onNotifSoundChange }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [emailPub, setEP] = useState(user.email_public || false);
  const [srch, setSrch] = useState(user.searchable !== false);
  const [notifs, setNotifs] = useState(user.notifications_on !== false);
  const [avatar, setAv] = useState(user.avatar_base64 || null);
  const [saving, setSav] = useState(false);
  const [toast, setToast] = useState("");
  const [status, setStatus] = useState(user.status || "online");
  const [customStatus, setCustomStatus] = useState(user.custom_status || "");
  const fileRef = useRef();

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2*1024*1024) { setToast("Image 2MB se choti honi chahiye!"); return; }
    const rd = new FileReader();
    rd.onload = () => setAv(rd.result);
    rd.readAsDataURL(f);
  };

  const save = async () => {
    setSav(true);
    try {
      const u = await api.patch("/users/me", { name, bio, avatar_base64: avatar, email_public: emailPub, searchable: srch, notifications_on: notifs, profile_setup_done: true, status, custom_status: customStatus }, token);
      onUpdate(u);
      setToast("Saved! ✅");
      setTimeout(() => setToast(""), 3000);
    } catch(e) { setToast(e.message); }
    finally { setSav(false); }
  };

  const themeList = Object.entries(THEMES);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-p)", padding: 24 }}>
      <Toast msg={toast} />
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {isFirst && <div style={{ background: `${ac.p}15`, border: `1px solid ${ac.p}33`, borderRadius: 14, padding: "13px 17px", marginBottom: 20, color: ac.p, fontSize: 14, fontWeight: 600 }}>👋 Welcome! Pehle apni profile setup karo.</div>}
        <h2 style={{ color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 20 }}>{isFirst ? "Profile Setup ✨" : "Settings ⚙️"}</h2>

        {/* Avatar */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>PROFILE PICTURE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 68, height: 68, borderRadius: "50%", background: `${ac.p}22`, border: `2px solid ${ac.p}44`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>📷</span>}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ background: `${ac.p}22`, border: `1px solid ${ac.p}44`, borderRadius: 9, padding: "9px 16px", color: ac.p, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Upload Photo</button>
              {avatar && <button onClick={() => setAv(null)} style={{ marginLeft: 8, background: `${ac.r}22`, border: `1px solid ${ac.r}44`, borderRadius: 9, padding: "9px 16px", color: ac.r, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Remove</button>}
              <div style={{ color: "var(--tx-m)", fontSize: 11, marginTop: 5 }}>Max 2MB</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
        </div>

        {/* Status */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>STATUS & PRESENCE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setStatus(s.value)} style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${status === s.value ? s.color : "var(--br-d)"}`, background: status === s.value ? `${s.color}22` : "transparent", color: status === s.value ? s.color : "var(--tx-s)", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>{s.label}</button>
            ))}
          </div>
          <input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder='Custom status: "In a meeting 🎯"' style={{ width: "100%", background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Profile Info */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>PROFILE INFO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Display Name" style={{ background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "12px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <div style={{ background: "var(--bg-t)", borderRadius: 10, padding: "10px 14px", color: "var(--tx-m)", fontSize: 13 }}>Username: <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace" }}>@{user.username}</span></div>
            <div style={{ background: "var(--bg-t)", borderRadius: 10, padding: "10px 14px", color: "var(--tx-m)", fontSize: 13 }}>Email: <span style={{ color: "var(--tx-s)" }}>{user.email_full || user.email}</span></div>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio (optional)" rows={3} style={{ background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", width: "100%" }} />
          </div>
        </div>

        {/* Theme */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>🎨 THEME</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {themeList.map(([id, th]) => (
              <button key={id} onClick={() => onThemeChange(id)} style={{ padding: "8px 16px", borderRadius: 20, border: `2px solid ${currentTheme === id ? ac.p : "var(--br-d)"}`, background: currentTheme === id ? `${ac.p}22` : "transparent", color: currentTheme === id ? ac.p : "var(--tx-s)", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
                {id === "dark" ? "🌑" : id === "midnight" ? "🌌" : id === "forest" ? "🌿" : id === "rose" ? "🌸" : "☀️"} {th.name}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Notifications */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: "6px 18px", border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, padding: "13px 0 5px" }}>PRIVACY & NOTIFICATIONS</div>
          <Toggle label="Email Public" desc="Doosre log email dekh sakein" val={emailPub} set={setEP} />
          <Toggle label="Search mein dikho" desc="Log username se dhundh sakein" val={srch} set={setSrch} />
          <Toggle label="Notifications" desc="Naye messages par notification" val={notifs} set={setNotifs} />
          <Toggle label="Sound Notifications" desc="Naye message par sound bajao" val={notifSound} set={onNotifSoundChange} />
        </div>

        <button onClick={save} disabled={saving} style={{ width: "100%", background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {saving ? <Spin /> : isFirst ? "Setup Complete → ✨" : "Save Changes ✅"}
        </button>
      </div>
    </div>
  );
}

// ── MESSAGE BUBBLE ────────────────────────────────────────────
function MsgBubble({ msg, isOwn, showName, showAvatar, onReact, onReply, onEdit, onDelete, wallpaper, currentUser }) {
  const [showReactBar, setShowReactBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const reactionCounts = {};
  (msg.reactions || []).forEach(r => { reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1; });

  const bubbleStyle = {
    background: isOwn ? `${ac.p}22` : "var(--bg-t)",
    border: `1px solid ${isOwn ? ac.p + "33" : "var(--br-d)"}`,
    borderRadius: isOwn ? "16px 16px 4px 16px" : (showName ? "4px 16px 16px 16px" : "16px"),
    padding: "9px 13px",
    position: "relative",
    maxWidth: "100%",
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: showName ? 12 : 3, flexDirection: isOwn ? "row-reverse" : "row" }}
      onMouseLeave={() => { setShowReactBar(false); setShowMenu(false); }}>
      {showAvatar
        ? <div style={{ cursor: "pointer" }}><Av user={{ username: msg.sender_username, name: msg.sender_name, avatar_base64: msg.sender_avatar, status: msg.sender_status }} size={30} dot /></div>
        : <div style={{ width: 30, flexShrink: 0 }} />}
      <div style={{ maxWidth: "66%", position: "relative" }}>
        {showName && <div style={{ color: ac.s, fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{msg.sender_name || msg.sender_username}</div>}

        {/* Reply preview */}
        {msg.reply_to && (
          <div style={{ background: "var(--bg-h)", borderLeft: `3px solid ${ac.p}`, borderRadius: "8px 8px 0 0", padding: "6px 10px", marginBottom: -4, fontSize: 12, color: "var(--tx-m)" }}>
            <span style={{ color: ac.p, fontWeight: 600 }}>↩ {msg.reply_to.sender_name || msg.reply_to.sender_username}</span>
            <div style={{ marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.reply_to.content}</div>
          </div>
        )}

        <div style={bubbleStyle}
          onMouseEnter={() => setShowReactBar(true)}
          onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}>
          {msg.is_edited && <span style={{ color: "var(--tx-m)", fontSize: 10, marginRight: 6 }}>(edited)</span>}
          <p style={{ margin: 0, color: "var(--tx-p)", fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 3 }}>
            <span style={{ color: "var(--tx-m)", fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}
            </span>
            {isOwn && (
              <span style={{ fontSize: 12, color: msg.seen_count > 0 ? ac.g : "var(--tx-m)" }} title={msg.seen_count > 0 ? "Seen" : "Sent"}>
                {msg.seen_count > 0 ? "✓✓" : "✓"}
              </span>
            )}
          </div>

          {/* Reaction hover bar */}
          {showReactBar && (
            <div style={{ position: "absolute", [isOwn ? "right" : "left"]: 0, top: -44, background: "var(--bg-s)", border: `1px solid var(--br-d)`, borderRadius: 20, padding: "5px 8px", display: "flex", gap: 2, boxShadow: "0 4px 16px #0006", zIndex: 50, whiteSpace: "nowrap" }}>
              {EMOJI_REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => { onReact(msg.id, emoji); setShowReactBar(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "2px 4px", borderRadius: 8, transition: "transform .1s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{emoji}</button>
              ))}
              <button onClick={() => { onReply(msg); setShowReactBar(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 8, color: "var(--tx-s)" }}>↩</button>
              {isOwn && <button onClick={() => { onEdit(msg); setShowReactBar(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 8, color: "var(--tx-s)" }}>✏️</button>}
              {isOwn && <button onClick={() => { onDelete(msg.id); setShowReactBar(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 8, color: ac.r }}>🗑</button>}
            </div>
          )}

          {/* Context menu */}
          {showMenu && (
            <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 300 }}>
              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", background: "var(--bg-s)", border: `1px solid var(--br-d)`, borderRadius: 12, padding: "4px 0", minWidth: 160, boxShadow: "0 8px 24px #0006", zIndex: 301 }}>
                {[
                  ["↩ Reply", () => onReply(msg)],
                  ...(isOwn ? [["✏️ Edit", () => onEdit(msg)]] : []),
                  ...(isOwn ? [["🗑 Delete", () => onDelete(msg.id)]] : []),
                ].map(([label, action]) => (
                  <button key={label} onClick={() => { action(); setShowMenu(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: label.includes("Delete") ? ac.r : "var(--tx-p)", padding: "9px 16px", cursor: "pointer", fontSize: 13 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reactions display */}
        {Object.keys(reactionCounts).length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)} style={{ background: `${ac.p}15`, border: `1px solid ${ac.p}33`, borderRadius: 12, padding: "2px 8px", cursor: "pointer", fontSize: 12, color: "var(--tx-p)", display: "flex", alignItems: "center", gap: 3 }}>
                {emoji} <span style={{ color: "var(--tx-m)" }}>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CHAT VIEW ─────────────────────────────────────────────────
function ChatView({ room, currentUser, token, onBack, wallpaper, theme, onViewProfile }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInp] = useState("");
  const [typing, setTyp] = useState([]);
  const [load, setLoad] = useState(true);
  const [inv, setInv] = useState(false);
  const [invCode, setIC] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [pinnedMsg, setPinnedMsg] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [notifSound] = useState(() => localStorage.getItem("nx_sound") !== "false");
  const wsRef = useRef(null);
  const endRef = useRef(null);
  const tRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!room) return;
    setMsgs([]); setLoad(true); setReplyTo(null); setEditMsg(null); setSearchMode(false);
    api.get(`/rooms/${room.id}/messages`, token).then(setMsgs).catch(console.error).finally(() => setLoad(false));
    // Load members if group
    if (room.room_type !== "direct") {
      api.get(`/rooms/${room.id}/members`, token).then(setMembers).catch(() => {});
    }
  }, [room?.id]);

  useEffect(() => {
    if (!room) return;
    const ws = new WebSocket(`${WS}/ws/${room.id}?token=${token}`);
    wsRef.current = ws;
    ws.onmessage = ({ data }) => {
      const e = JSON.parse(data);
      if (e.type === "message") {
        setMsgs(p => [...p, { ...e, seen_count: 0, reactions: [] }]);
        ws.send(JSON.stringify({ type: "seen", message_id: e.id }));
        if (e.sender_id !== currentUser.id && notifSound) playNotifSound();
        if (e.sender_id !== currentUser.id && currentUser.notifications_on !== false && "Notification" in window && Notification.permission === "granted") {
          new Notification(`${e.sender_name || e.sender_username}`, { body: e.content, icon: "/favicon.ico" });
        }
      } else if (e.type === "typing") {
        if (e.is_typing) setTyp(p => p.includes(e.username) ? p : [...p, e.username]);
        else setTyp(p => p.filter(u => u !== e.username));
        clearTimeout(tRef.current);
        tRef.current = setTimeout(() => setTyp([]), 4000);
      } else if (e.type === "seen") {
        setMsgs(p => p.map(m => m.id === e.message_id ? { ...m, seen_count: (m.seen_count || 0) + 1 } : m));
      } else if (e.type === "reaction") {
        setMsgs(p => p.map(m => m.id === e.message_id ? { ...m, reactions: e.reactions || [] } : m));
      } else if (e.type === "delete") {
        setMsgs(p => p.filter(m => m.id !== e.message_id));
      } else if (e.type === "edit") {
        setMsgs(p => p.map(m => m.id === e.message_id ? { ...m, content: e.content, is_edited: true } : m));
      }
    };
    return () => ws.close();
  }, [room?.id, token]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const send = () => {
    const content = input.trim();
    if (!content || !wsRef.current) return;
    const payload = { type: "message", content };
    if (replyTo) payload.reply_to_id = replyTo.id;
    if (editMsg) {
      wsRef.current.send(JSON.stringify({ type: "edit", message_id: editMsg.id, content }));
      setEditMsg(null);
    } else {
      wsRef.current.send(JSON.stringify(payload));
    }
    setInp("");
    setReplyTo(null);
    wsRef.current.send(JSON.stringify({ type: "typing", is_typing: false }));
  };

  const handleReact = (msgId, emoji) => {
    wsRef.current?.send(JSON.stringify({ type: "reaction", message_id: msgId, emoji }));
  };

  const handleDelete = (msgId) => {
    if (!window.confirm("Message delete karein?")) return;
    wsRef.current?.send(JSON.stringify({ type: "delete", message_id: msgId }));
  };

  const handleEdit = (msg) => {
    setEditMsg(msg);
    setInp(msg.content);
    inputRef.current?.focus();
  };

  const handlePin = (msg) => {
    setPinnedMsg(msg);
    setShowMenu(false);
  };

  const genInv = async () => {
    try {
      const d = await api.post("/invites", { room_id: room.id, expiry_hours: 24, is_one_time: false, max_uses: null }, token);
      setIC(`${window.location.origin}/join/${d.code}`);
      setInv(true);
    } catch(e) { alert(e.message); }
  };

  const filteredMsgs = searchMode && searchQ ? msgs.filter(m => m.content?.toLowerCase().includes(searchQ.toLowerCase())) : msgs;
  const isDM = room.room_type === "direct";

  if (!room) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-p)" }}>
      <div style={{ fontSize: 52, marginBottom: 10 }}>💬</div>
      <p style={{ color: "var(--tx-m)", fontSize: 15 }}>Koi chat select karo</p>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "12px 18px", background: "var(--bg-s)", borderBottom: `1px solid var(--br-d)`, display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--tx-s)", cursor: "pointer", fontSize: 20, padding: "0 4px", marginRight: 2 }}>←</button>
        )}
        <div onClick={() => !isDM && setShowMembers(true)} style={{ width: 40, height: 40, borderRadius: isDM ? "50%" : 12, background: `${isDM ? ac.s : ac.p}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: !isDM ? "pointer" : "default" }}>{isDM ? "👤" : "👥"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>{room.name}</div>
          {typing.length > 0
            ? <div style={{ color: ac.g, fontSize: 11, fontStyle: "italic" }}>{typing.join(", ")} likh raha hai...</div>
            : <div style={{ color: "var(--tx-m)", fontSize: 11 }}>{isDM ? "Direct Message" : `${members.length || ""} members`}</div>
          }
        </div>

        <button onClick={() => setSearchMode(m => !m)} style={{ background: searchMode ? `${ac.p}22` : "none", border: "none", color: searchMode ? ac.p : "var(--tx-s)", cursor: "pointer", fontSize: 18, padding: "4px 8px", borderRadius: 8 }} title="Search">🔍</button>

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(m => !m)} style={{ background: "none", border: "none", color: "var(--tx-s)", cursor: "pointer", fontSize: 20, padding: "4px 8px", borderRadius: 8 }}>⋮</button>
          {showMenu && (
            <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 200 }}>
              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 36, background: "var(--bg-s)", border: `1px solid var(--br-d)`, borderRadius: 14, padding: "6px 0", minWidth: 200, boxShadow: "0 8px 32px #0008", zIndex: 201 }}>
                {[
                  ["🔗 Invite Link", () => { genInv(); setShowMenu(false); }],
                  ["📌 Pinned Message", () => { setShowMenu(false); }],
                  ["👥 Members", () => { setShowMembers(true); setShowMenu(false); }],
                  ["🔇 Mute Chat", () => { alert("Coming soon!"); setShowMenu(false); }],
                  ["🗑️ Clear Chat", () => { if(window.confirm("Chat clear karein?")) setMsgs([]); setShowMenu(false); }],
                  ["🚫 Block", () => { alert("Coming soon!"); setShowMenu(false); }],
                ].map(([label, action]) => (
                  <button key={label} onClick={action} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: label.includes("Block") ? ac.r : "var(--tx-p)", padding: "10px 18px", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-h)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      {searchMode && (
        <div style={{ padding: "8px 14px", background: "var(--bg-s)", borderBottom: `1px solid var(--br-d)`, display: "flex", gap: 8, alignItems: "center" }}>
          <input ref={inputRef} value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus placeholder="Messages mein search karo..." style={{ flex: 1, background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 8, padding: "8px 12px", color: "var(--tx-p)", fontSize: 14, outline: "none" }} />
          {searchQ && <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", color: "var(--tx-m)", cursor: "pointer" }}>✕</button>}
          <span style={{ color: "var(--tx-m)", fontSize: 12 }}>{filteredMsgs.length} results</span>
        </div>
      )}

      {/* Pinned message banner */}
      {pinnedMsg && (
        <div style={{ padding: "8px 16px", background: `${ac.p}15`, borderBottom: `1px solid ${ac.p}33`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14 }}>📌</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: ac.p, fontSize: 11, fontWeight: 700 }}>Pinned</div>
            <div style={{ color: "var(--tx-s)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinnedMsg.content}</div>
          </div>
          <button onClick={() => setPinnedMsg(null)} style={{ background: "none", border: "none", color: "var(--tx-m)", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", scrollbarWidth: "thin", position: "relative" }}>
        <WallpaperBG wallpaper={wallpaper} theme={theme} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {load ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}><Spin size={30} /></div>
          : filteredMsgs.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--tx-m)", paddingTop: 40 }}>
              <div style={{ fontSize: 36 }}>{searchMode ? "🔍" : "👋"}</div>
              <p>{searchMode ? "Koi message nahi mila" : "Pehla message bhejo!"}</p>
            </div>
          ) : filteredMsgs.map((msg, i) => {
            const isOwn = msg.sender_id === currentUser.id;
            const showName = !isOwn && (i === 0 || filteredMsgs[i-1].sender_id !== msg.sender_id);
            const showAvatar = showName;
            return (
              <MsgBubble
                key={msg.id || i}
                msg={msg}
                isOwn={isOwn}
                showName={showName}
                showAvatar={showAvatar}
                onReact={handleReact}
                onReply={setReplyTo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                wallpaper={wallpaper}
                currentUser={currentUser}
              />
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Reply / Edit bar */}
      {(replyTo || editMsg) && (
        <div style={{ padding: "8px 14px", background: "var(--bg-s)", borderTop: `1px solid var(--br-d)`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, borderLeft: `3px solid ${ac.p}`, paddingLeft: 10 }}>
            <div style={{ color: ac.p, fontSize: 12, fontWeight: 700 }}>{editMsg ? "✏️ Editing" : `↩ Reply to ${replyTo?.sender_name || replyTo?.sender_username}`}</div>
            <div style={{ color: "var(--tx-m)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editMsg?.content || replyTo?.content}</div>
          </div>
          <button onClick={() => { setReplyTo(null); setEditMsg(null); setInp(""); }} style={{ background: "none", border: "none", color: "var(--tx-m)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 14px", background: "var(--bg-s)", borderTop: `1px solid var(--br-d)` }}>
        <div style={{ display: "flex", gap: 8, background: "var(--bg-t)", borderRadius: 14, border: `1px solid var(--br-d)`, padding: "6px 6px 6px 14px" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInp(e.target.value); wsRef.current?.send(JSON.stringify({ type: "typing", is_typing: true })); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } if (e.key === "Escape") { setReplyTo(null); setEditMsg(null); setInp(""); } }}
            onBlur={() => wsRef.current?.send(JSON.stringify({ type: "typing", is_typing: false }))}
            placeholder={editMsg ? "Edit karo..." : replyTo ? `Reply to ${replyTo.sender_name || replyTo.sender_username}...` : "Message likhain..."}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--tx-p)", fontSize: 14 }} />
          {/* Emoji quick insert */}
          <button onClick={() => setInp(p => p + "😊")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "0 4px", color: "var(--tx-m)" }}>😊</button>
          <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? "linear-gradient(135deg,#6c63ff,#ff6b9d)" : "var(--bg-h)", border: "none", borderRadius: 10, padding: "9px 14px", color: "#fff", cursor: input.trim() ? "pointer" : "default", fontSize: 15 }}>➤</button>
        </div>
      </div>

      {/* Members modal */}
      <Modal open={showMembers} onClose={() => setShowMembers(false)} title="👥 Members" width={380}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.length === 0 ? <p style={{ color: "var(--tx-m)", textAlign: "center" }}>No members data</p>
          : members.map(m => (
            <div key={m.id} onClick={() => { onViewProfile && onViewProfile(m); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: "var(--bg-t)", transition: "background .15s" }}>
              <Av user={m} size={40} dot />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--tx-p)", fontWeight: 600 }}>{m.name || m.username}</div>
                <div style={{ color: "var(--tx-m)", fontSize: 12 }}>@{m.username} • {m.role || "member"}</div>
              </div>
              {m.id === room.owner_id && <span style={{ background: `${ac.y}22`, color: ac.y, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>Admin</span>}
            </div>
          ))}
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal open={inv} onClose={() => { setInv(false); setIC(""); }} title="🔗 Room Invite Link">
        <div style={{ display: "flex", gap: 10, background: "var(--bg-t)", borderRadius: 10, padding: "12px 14px", alignItems: "center" }}>
          <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace", fontSize: 12, flex: 1, wordBreak: "break-all" }}>{invCode}</span>
          <button onClick={() => { navigator.clipboard.writeText(invCode); }} style={{ background: ac.p, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Copy</button>
        </div>
        <p style={{ color: "var(--tx-m)", fontSize: 13, marginTop: 12 }}>Yeh link bhejo — directly room mein aa jayenge.</p>
      </Modal>
    </div>
  );
}

// ── CONNECT PAGE ──────────────────────────────────────────────
function ConnectPage({ currentUser, token, onOpenDM, onPendChange }) {
  const [srch, setSrch] = useState("");
  const [found, setFound] = useState(null);
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [conns, setConns] = useState([]);
  const [toast, setToast] = useState("");
  const [myLink, setML] = useState("");
  const [genL, setGenL] = useState(false);
  const [pasteLink, setPasteLink] = useState("");
  const [pasteLoad, setPasteLoad] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);

  const loadAll = async () => {
    const [r, co] = await Promise.all([
      api.get("/connect/requests", token).catch(() => []),
      api.get("/connect/list", token).catch(() => []),
    ]);
    setReqs(r); setConns(co);
    if (onPendChange) onPendChange(r.length);
  };

  useEffect(() => { loadAll(); }, []);

  const msg = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const find = async () => {
    if (!srch.trim()) return;
    setLoad(true); setErr(""); setFound(null);
    try { setFound(await api.get(`/users/find/${srch.trim()}`, token)); }
    catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  const sendReq = async (uname) => {
    try { const r = await api.post(`/connect/send/${uname}`, {}, token); msg(r.message); setFound(null); setSrch(""); }
    catch (e) { msg(e.message); }
  };

  const accept = async (cid) => {
    try {
      const r = await api.post(`/connect/accept/${cid}`, {}, token);
      msg("Connected! 🎉");
      await loadAll();
      if (r.room_id) {
        const updated = await api.get("/connect/list", token);
        const co = updated.find(x => x.room_id === r.room_id);
        if (co) onOpenDM(co);
      }
    } catch (e) { msg(e.message); }
  };

  const reject = async (cid) => {
    try { await api.post(`/connect/reject/${cid}`, {}, token); msg("Reject kar di"); await loadAll(); }
    catch (e) { msg(e.message); }
  };

  const block = async (uname) => {
    if (!window.confirm(`${uname} ko block karo?`)) return;
    try { await api.post(`/block/${uname}`, {}, token); msg(`${uname} block ho gaya`); await loadAll(); }
    catch (e) { msg(e.message); }
  };

  const joinByLink = async () => {
    if (!pasteLink.trim()) return;
    setPasteLoad(true);
    try {
      const code = pasteLink.trim().split("/join/").pop().split("?")[0].trim();
      const d = await api.post(`/invites/use/${code}`, {}, token);
      msg(d.message || "Connected! 🎉");
      setPasteLink("");
      await loadAll();
    } catch (e) { msg(e.message || "Invalid link"); }
    finally { setPasteLoad(false); }
  };

  const genLink = async () => {
    setGenL(true);
    try {
      const d = await api.post("/invites", { expiry_hours: 24, is_one_time: true, max_uses: 1 }, token);
      setML(`${window.location.origin}/join/${d.code}`);
    } catch (e) { msg(e.message); }
    finally { setGenL(false); }
  };

  const bStyle = (col, bg2) => ({ background: bg2 || `${col}22`, border: `1px solid ${col}44`, borderRadius: 8, padding: "8px 14px", color: col, cursor: "pointer", fontSize: 13, fontWeight: 600 });

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-p)", padding: 24 }}>
      <Toast msg={toast} />
      <ProfileViewModal user={viewProfile} open={!!viewProfile} onClose={() => setViewProfile(null)} currentUserId={currentUser.id} token={token} onOpenDM={conn => { onOpenDM(conn); setViewProfile(null); }} />

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 20 }}>🔌 Connect</h2>

        {/* Paste Link */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid ${ac.g}33`, marginBottom: 14 }}>
          <div style={{ color: ac.g, fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}>🔗 KISI KA LINK PASTE KARO</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={pasteLink} onChange={e => setPasteLink(e.target.value)} onKeyDown={e => e.key === "Enter" && joinByLink()} placeholder="https://...join/..."
              style={{ flex: 1, background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 13px", color: "var(--tx-p)", fontSize: 13, outline: "none" }} />
            <button onClick={joinByLink} disabled={pasteLoad || !pasteLink.trim()} style={{ background: "linear-gradient(135deg,#00d4aa,#6c63ff)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              {pasteLoad ? <Spin size={16} /> : "Connect →"}
            </button>
          </div>
        </div>

        {/* My Link */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}>APNA ONE-TIME LINK</div>
          {myLink
            ? <div style={{ display: "flex", gap: 10, background: "var(--bg-t)", borderRadius: 10, padding: "11px 13px", alignItems: "center" }}>
                <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace", fontSize: 11, flex: 1, wordBreak: "break-all" }}>{myLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(myLink); msg("Copied! ✅"); }} style={{ background: ac.p, border: "none", borderRadius: 8, padding: "7px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Copy</button>
              </div>
            : <button onClick={genLink} disabled={genL} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                {genL ? <Spin size={16} /> : "🔗 Generate Link"}
              </button>
          }
        </div>

        {/* Search */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)`, marginBottom: 14 }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}>USERNAME SE DHUNDO</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={srch} onChange={e=>setSrch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&find()} placeholder="Username..."
              style={{ flex: 1, background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 13px", color: "var(--tx-p)", fontSize: 14, outline: "none" }} />
            <button onClick={find} disabled={load} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {load ? <Spin size={16} /> : "🔍"}
            </button>
          </div>
          {err && <div style={{ color: ac.r, fontSize: 13, marginTop: 10 }}>{err}</div>}
          {found && (
            <div style={{ marginTop: 13, background: "var(--bg-t)", borderRadius: 12, padding: 13, border: `1px solid ${ac.p}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div onClick={() => setViewProfile(found)} style={{ cursor: "pointer" }}><Av user={found} size={44} dot /></div>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setViewProfile(found)}>
                  <div style={{ color: "var(--tx-p)", fontWeight: 700 }}>{found.name || found.username}</div>
                  <div style={{ color: "var(--tx-m)", fontSize: 12 }}>@{found.username} • {found.bio || "No bio"}</div>
                  {found.custom_status && <div style={{ color: "var(--tx-m)", fontSize: 11, fontStyle: "italic" }}>{found.custom_status}</div>}
                </div>
                {found.connection_status === "none" && <button onClick={() => sendReq(found.username)} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 9, padding: "8px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Connect</button>}
                {found.connection_status === "pending" && <span style={{ color: ac.y, fontSize: 13, fontWeight: 600 }}>⏳ Pending</span>}
                {found.connection_status === "accepted" && <span style={{ color: ac.g, fontSize: 13, fontWeight: 600 }}>✓ Connected</span>}
              </div>
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {reqs.length > 0 && (
          <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid ${ac.y}33`, marginBottom: 14 }}>
            <div style={{ color: ac.y, fontSize: 11, letterSpacing: 1.5, marginBottom: 13 }}>⏳ REQUESTS ({reqs.length})</div>
            {reqs.map(r => (
              <div key={r.connection_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid var(--br-s)` }}>
                <div onClick={() => setViewProfile({ username: r.sender_username, name: r.sender_name, avatar_base64: r.sender_avatar })} style={{ cursor: "pointer" }}>
                  <Av user={{ username: r.sender_username, name: r.sender_name, avatar_base64: r.sender_avatar }} size={42} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--tx-p)", fontWeight: 700 }}>{r.sender_name || r.sender_username}</div>
                  <div style={{ color: "var(--tx-m)", fontSize: 12 }}>@{r.sender_username}</div>
                </div>
                <button onClick={() => accept(r.connection_id)} style={{ background: ac.g, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✓ Accept</button>
                <button onClick={() => reject(r.connection_id)} style={{ ...bStyle(ac.r), border: `1px solid ${ac.r}44` }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Connections */}
        <div style={{ background: "var(--bg-s)", borderRadius: 16, padding: 18, border: `1px solid var(--br-d)` }}>
          <div style={{ color: "var(--tx-m)", fontSize: 11, letterSpacing: 1.5, marginBottom: 13 }}>✅ CONNECTIONS ({conns.length})</div>
          {conns.length === 0
            ? <div style={{ color: "var(--tx-m)", fontSize: 13, textAlign: "center", padding: "14px 0" }}>Koi connection nahi abhi</div>
            : conns.map(co => {
              const statInfo = STATUS_OPTIONS.find(s => s.value === co.status) || STATUS_OPTIONS[3];
              return (
                <div key={co.connection_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid var(--br-s)` }}>
                  <div onClick={() => setViewProfile(co)} style={{ cursor: "pointer" }}><Av user={co} size={42} dot /></div>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setViewProfile(co)}>
                    <div style={{ color: "var(--tx-p)", fontWeight: 700 }}>{co.name || co.username}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: statInfo.color }} />
                      <span style={{ color: statInfo.color, fontSize: 12 }}>{co.custom_status || statInfo.label}</span>
                    </div>
                    {co.last_seen && co.status !== "online" && <div style={{ color: "var(--tx-m)", fontSize: 11 }}>Last seen: {new Date(co.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                  </div>
                  <button onClick={() => onOpenDM(co)} style={bStyle(ac.p)}>💬 Chat</button>
                  <button onClick={() => block(co.username)} style={{ ...bStyle(ac.r), padding: "8px 10px" }} title="Block">🚫</button>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── ROOMS PAGE ────────────────────────────────────────────────
function RoomsPage({ rooms, activeRoom, onSelectRoom, onCreateRoom, token }) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nx_cats") || "{}"); } catch { return {}; }
  });
  const [addCatModal, setAddCatModal] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [assignCat, setAssignCat] = useState(null);

  const allCats = [...new Set(Object.values(categories))].filter(Boolean);
  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = {};
  filtered.forEach(r => {
    const cat = categories[r.id] || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  });

  const saveCats = (cats) => {
    setCategories(cats);
    localStorage.setItem("nx_cats", JSON.stringify(cats));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid var(--br-s)` }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Room search..."
          style={{ width: "100%", background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 8, padding: "8px 12px", color: "var(--tx-p)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0
          ? <div style={{ color: "var(--tx-m)", fontSize: 13, padding: "20px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>👥</div>
              + se room banao
            </div>
          : Object.entries(grouped).map(([cat, catRooms]) => (
            <div key={cat}>
              <div style={{ padding: "8px 14px 4px", color: "var(--tx-m)", fontSize: 10, letterSpacing: 1.5, fontWeight: 700 }}>{cat.toUpperCase()}</div>
              {catRooms.map(room => (
                <div key={room.id} onClick={() => onSelectRoom(room)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 12, margin: "2px 6px", background: activeRoom?.id === room.id ? "var(--bg-a)" : "transparent", transition: "background .15s" }}
                  onMouseEnter={e => { if (activeRoom?.id !== room.id) e.currentTarget.style.background = "var(--bg-h)"; }}
                  onMouseLeave={e => { if (activeRoom?.id !== room.id) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac.p}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>👥</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--tx-p)", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.name}</div>
                    <div style={{ color: "var(--tx-m)", fontSize: 11 }}>{room.room_type}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setAssignCat(room); }} style={{ background: "none", border: "none", color: "var(--tx-m)", cursor: "pointer", fontSize: 12, opacity: 0, padding: 4, borderRadius: 6 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "var(--bg-h)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.background = "none"; }}>📁</button>
                </div>
              ))}
            </div>
          ))
        }
      </div>

      {/* Assign category modal */}
      <Modal open={!!assignCat} onClose={() => setAssignCat(null)} title="📁 Category Assign" width={340}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["General", ...allCats.filter(c => c !== "General"), "+ New"].map(cat => (
            <button key={cat} onClick={() => {
              if (cat === "+ New") { setAddCatModal(true); setAssignCat(null); return; }
              saveCats({ ...categories, [assignCat.id]: cat });
              setAssignCat(null);
            }} style={{ padding: "10px 14px", textAlign: "left", background: categories[assignCat?.id] === cat ? `${ac.p}22` : "var(--bg-t)", border: `1px solid ${categories[assignCat?.id] === cat ? ac.p + "44" : "var(--br-d)"}`, borderRadius: 10, color: cat === "+ New" ? ac.p : "var(--tx-p)", cursor: "pointer", fontSize: 14 }}>
              {cat}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={addCatModal} onClose={() => setAddCatModal(false)} title="📁 New Category" width={320}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name..." autoFocus
            style={{ flex: 1, background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 13px", color: "var(--tx-p)", fontSize: 14, outline: "none" }} />
          <button onClick={() => { if (newCat.trim()) { saveCats({ ...categories }); setAddCatModal(false); setNewCat(""); } }} style={{ background: ac.p, border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add</button>
        </div>
      </Modal>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function NexusApp() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("nx_t") || "");
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("nx_u") || "null"); } catch { return null; } });

  const [sec, setSec] = useState("messages");
  const [rooms, setRooms] = useState([]);
  const [dms, setDMs] = useState([]);
  const [pend, setPend] = useState(0);
  const [ar, setAR] = useState(null);
  const [showCR, setCR] = useState(false);
  const [isFirst, setIF] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);

  // Preferences
  const [theme, setTheme] = useState(() => localStorage.getItem("nx_theme") || "dark");
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem("nx_wall") || "none");
  const [notifSound, setNotifSound] = useState(() => localStorage.getItem("nx_sound") !== "false");
  const [showWallModal, setShowWallModal] = useState(false);

  // Apply theme CSS vars
  useEffect(() => {
    const th = THEMES[theme] || THEMES.dark;
    const root = document.documentElement;
    Object.entries(th.bg).forEach(([k, v]) => root.style.setProperty(`--bg-${k}`, v));
    Object.entries(th.tx).forEach(([k, v]) => root.style.setProperty(`--tx-${k}`, v));
    Object.entries(th.br).forEach(([k, v]) => root.style.setProperty(`--br-${k}`, v));
    root.style.setProperty("--bg-a", th.bg.a);
    root.style.setProperty("--bg-h", th.bg.h);
    localStorage.setItem("nx_theme", theme);
  }, [theme]);

  const onThemeChange = (t) => { setTheme(t); localStorage.setItem("nx_theme", t); };
  const onNotifSoundChange = (v) => { setNotifSound(v); localStorage.setItem("nx_sound", v ? "true" : "false"); };

  const logout = () => { localStorage.removeItem("nx_t"); localStorage.removeItem("nx_u"); setToken(""); setUser(null); };

  const onLogin = (u, t, goSet) => {
    setToken(t); setUser(u);
    localStorage.setItem("nx_t", t);
    localStorage.setItem("nx_u", JSON.stringify(u));
    if (goSet || !u.profile_setup_done) { setSec("settings"); setIF(true); }
  };

  const loadRooms = () => { if (!token) return; api.get("/rooms", token).then(d => setRooms(d.filter(r => r.room_type !== "direct"))).catch(() => {}); };
  const loadDMs   = () => { if (!token) return; api.get("/connect/list", token).then(d => setDMs(d.filter(c => c.room_id))).catch(() => {}); };
  const loadPend  = () => { if (!token) return; api.get("/connect/requests", token).then(d => setPend(d.length)).catch(() => {}); };

  useEffect(() => {
    if (!token) return;
    loadRooms(); loadDMs(); loadPend();
    const iv = setInterval(() => { loadPend(); loadDMs(); }, 8000);
    return () => clearInterval(iv);
  }, [token]);

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />;
  if (!token || !user) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;700&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1e2230;border-radius:2px}
        input::placeholder,textarea::placeholder{color:#4a4f68}
        :root{--bg-p:#0a0b0f;--bg-s:#111318;--bg-t:#1a1d26;--bg-h:#1e2230;--bg-a:#252a3a;--tx-p:#e8eaf0;--tx-s:#8b90a8;--tx-m:#4a4f68;--br-d:#1e2230;--br-s:#141720}
      `}</style>
      <AuthScreen onLogin={onLogin} />
    </>
  );

  const nav = [
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "rooms",    icon: "👥", label: "Rooms" },
    { id: "connect",  icon: "🔌", label: "Connect" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const openDM = async (conn) => {
    await loadDMs();
    setAR({ id: conn.room_id, name: conn.name || conn.username, room_type: "direct", other_user: conn });
    setSec("messages");
  };

  const isMobile = window.innerWidth < 700;
  const hasSidebar = sec === "messages" || sec === "rooms";
  const showSidebar = hasSidebar && (!isMobile || !ar);
  const showChat = hasSidebar && (!isMobile || ar);
  const th = THEMES[theme] || THEMES.dark;

  return (
    <div style={{ height: "100vh", display: "flex", background: "var(--bg-p)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;700&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:var(--br-d);border-radius:2px}
        input::placeholder,textarea::placeholder{color:var(--tx-m)}
      `}</style>

      {/* Nav Rail */}
      {(!isMobile || !ar) && (
        <div style={{ width: 60, background: "var(--bg-p)", borderRight: `1px solid var(--br-s)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, flexShrink: 0 }}>
          <div style={{ fontSize: 22, marginBottom: 12 }}>⚡</div>
          {nav.map(item => (
            <button key={item.id} onClick={() => setSec(item.id)} title={item.label} style={{ background: sec===item.id ? "var(--bg-a)" : "none", border: `1px solid ${sec===item.id ? "var(--br-d)" : "transparent"}`, borderRadius: 12, width: 42, height: 42, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", position: "relative" }}>
              {item.icon}
              {item.id === "connect" && pend > 0 && (
                <div style={{ position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: "50%", background: ac.g, border: `2px solid var(--bg-p)`, animation: "pulse 1.5s ease-in-out infinite" }} />
              )}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Wallpaper toggle */}
          <button onClick={() => setShowWallModal(true)} title="Wallpaper" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 6, color: "var(--tx-m)", borderRadius: 8 }}>🖼</button>
          <div style={{ cursor: "pointer", marginBottom: 4 }} onClick={() => setSec("settings")}>
            <Av user={user} size={32} dot statusColor={STATUS_OPTIONS.find(s => s.value === (user.status || "online"))?.color} />
          </div>
          <button onClick={logout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 6, color: "var(--tx-m)" }}>🚪</button>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div style={{ width: isMobile ? "100%" : 268, background: "var(--bg-s)", borderRight: `1px solid var(--br-d)`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 13px 10px", borderBottom: `1px solid var(--br-s)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--tx-p)", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>Nexus<span style={{ color: ac.p }}>.</span></span>
              {sec === "rooms" && <button onClick={() => setCR(true)} style={{ background: `${ac.p}22`, border: `1px solid ${ac.p}33`, borderRadius: 8, padding: "5px 10px", color: ac.p, cursor: "pointer", fontSize: 16 }}>+</button>}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {sec === "messages" && (
              dms.length === 0
                ? <div style={{ color: "var(--tx-m)", fontSize: 13, padding: "20px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>💬</div>
                    🔌 Connect tab se kisi se connect karo
                  </div>
                : dms.map(dm => {
                  const statInfo = STATUS_OPTIONS.find(s => s.value === dm.status) || STATUS_OPTIONS[3];
                  const unread = dm.unread_count || 0;
                  return (
                    <div key={dm.connection_id} onClick={() => setAR({ id: dm.room_id, name: dm.name || dm.username, room_type: "direct", other_user: dm })}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 12, margin: "2px 6px", background: ar?.id === dm.room_id ? "var(--bg-a)" : "transparent", transition: "background .15s" }}
                      onMouseEnter={e => { if (ar?.id !== dm.room_id) e.currentTarget.style.background = "var(--bg-h)"; }}
                      onMouseLeave={e => { if (ar?.id !== dm.room_id) e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ position: "relative" }}>
                        <Av user={dm} size={40} dot statusColor={statInfo.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "var(--tx-p)", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dm.name || dm.username}</div>
                        <div style={{ color: statInfo.color, fontSize: 11 }}>{dm.custom_status || statInfo.label.split(" ").slice(1).join(" ")}</div>
                      </div>
                      {unread > 0 && (
                        <div style={{ background: ac.g, color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{unread > 9 ? "9+" : unread}</div>
                      )}
                    </div>
                  );
                })
            )}

            {sec === "rooms" && (
              <RoomsPage rooms={rooms} activeRoom={ar} onSelectRoom={r => setAR(r)} onCreateRoom={() => setCR(true)} token={token} />
            )}
          </div>

          {/* User status bar */}
          <div style={{ padding: "9px 12px", borderTop: `1px solid var(--br-d)`, display: "flex", alignItems: "center", gap: 10 }}>
            <Av user={user} size={32} dot statusColor={STATUS_OPTIONS.find(s => s.value === (user.status || "online"))?.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--tx-p)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || user.username}</div>
              <div style={{ color: "var(--tx-m)", fontSize: 11 }}>{user.custom_status || STATUS_OPTIONS.find(s => s.value === (user.status || "online"))?.label || "● Online"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {showChat && ar && (
          <ChatView
            room={ar}
            currentUser={user}
            token={token}
            onBack={isMobile ? () => setAR(null) : null}
            wallpaper={wallpaper}
            theme={theme}
            onViewProfile={setViewProfile}
          />
        )}
        {showChat && !ar && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-p)", position: "relative" }}>
            <WallpaperBG wallpaper={wallpaper} theme={theme} />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>💬</div>
              <p style={{ color: "var(--tx-m)", fontSize: 15 }}>Koi chat select karo ya naya banao</p>
            </div>
          </div>
        )}
        {sec === "connect" && <ConnectPage currentUser={user} token={token} onOpenDM={openDM} onPendChange={setPend} />}
        {sec === "settings" && (
          <SettingsPage
            user={user}
            token={token}
            isFirst={isFirst}
            currentTheme={theme}
            onThemeChange={onThemeChange}
            notifSound={notifSound}
            onNotifSoundChange={onNotifSoundChange}
            onUpdate={u => {
              setUser(u);
              localStorage.setItem("nx_u", JSON.stringify(u));
              if (isFirst) { setIF(false); setSec("messages"); }
            }}
          />
        )}

        {/* FAB */}
        {!ar && sec !== "connect" && (
          <button onClick={() => setSec("connect")} title="Connect karo" style={{
            position: "absolute", bottom: 20, right: 20,
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg,#6c63ff,#ff6b9d)",
            border: "none", cursor: "pointer", fontSize: 26, color: "#fff",
            boxShadow: "0 4px 20px #6c63ff55", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
            +
          </button>
        )}
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal
        user={viewProfile}
        open={!!viewProfile}
        onClose={() => setViewProfile(null)}
        currentUserId={user.id}
        token={token}
        onOpenDM={conn => { openDM(conn); setViewProfile(null); }}
      />

      {/* Wallpaper Modal */}
      <Modal open={showWallModal} onClose={() => setShowWallModal(false)} title="🖼 Chat Wallpaper" width={400}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {WALLPAPERS.map(wp => (
            <button key={wp.id} onClick={() => { setWallpaper(wp.id); localStorage.setItem("nx_wall", wp.id); }} style={{
              height: 80, borderRadius: 12, border: `3px solid ${wallpaper === wp.id ? ac.p : "var(--br-d)"}`,
              background: wp.preview, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--tx-p)", fontSize: 13, fontWeight: 600, transition: "all .15s", overflow: "hidden",
            }}>
              {wallpaper === wp.id && <span style={{ background: ac.p, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>}
              {wallpaper !== wp.id && wp.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Create Room Modal */}
      <Modal open={showCR} onClose={() => setCR(false)} title="✨ Room Banao">
        <CreateRoomForm token={token} onCreated={room => { loadRooms(); setAR(room); setSec("rooms"); setCR(false); }} />
      </Modal>
    </div>
  );
}

function CreateRoomForm({ token, onCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("group");
  const [desc, setDesc] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");
  const go = async () => {
    if (!name.trim()) return;
    setLoad(true); setErr("");
    try { const r = await api.post("/rooms", { name: name.trim(), room_type: type, description: desc }, token); onCreated(r); }
    catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Room ka naam..." style={{ background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "12px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none" }} />
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Room description (optional)" rows={2} style={{ background: "var(--bg-t)", border: `1px solid var(--br-d)`, borderRadius: 10, padding: "10px 14px", color: "var(--tx-p)", fontSize: 14, outline: "none", resize: "none" }} />
      <div style={{ display: "flex", gap: 8 }}>
        {[["group","👥 Group"],["temporary","⚡ Temporary"]].map(([v,l]) => (
          <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `2px solid ${type===v ? ac.p : "var(--br-d)"}`, background: type===v ? `${ac.p}22` : "transparent", color: type===v ? ac.p : "var(--tx-s)" }}>{l}</button>
        ))}
      </div>
      {err && <div style={{ color: ac.r, fontSize: 13 }}>{err}</div>}
      <button onClick={go} disabled={load} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {load ? <Spin size={18} /> : "Create ✨"}
      </button>
    </div>
  );
}