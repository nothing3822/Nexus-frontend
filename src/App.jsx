import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000";
const WS  = "ws://localhost:8000";

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

const bg = { p: "#0a0b0f", s: "#111318", t: "#1a1d26", h: "#1e2230", a: "#252a3a" };
const ac = { p: "#6c63ff", s: "#ff6b9d", g: "#00d4aa", y: "#ffd166", r: "#ff4757" };
const tx = { p: "#e8eaf0", s: "#8b90a8", m: "#4a4f68" };
const br = { d: "#1e2230", s: "#141720" };

const Spin = ({ size = 20 }) => (
  <div style={{ width: size, height: size, border: `3px solid ${br.d}`, borderTopColor: ac.p, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
);

function Av({ user, size = 40, dot = false }) {
  const cols = ["#6c63ff","#ff6b9d","#00d4aa","#ffd166","#ff4757"];
  const col = cols[((user?.username || "").charCodeAt(0) || 0) % cols.length];
  const init = (user?.name || user?.username || "?").slice(0, 2).toUpperCase();
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `${col}22`, border: `2px solid ${col}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: col, overflow: "hidden" }}>
        {user?.avatar_base64 ? <img src={user.avatar_base64} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : init}
      </div>
      {dot && <div style={{ position: "absolute", bottom: 1, right: 1, width: size * 0.27, height: size * 0.27, borderRadius: "50%", background: user?.status === "online" ? ac.g : tx.m, border: `2px solid ${bg.p}` }} />}
    </div>
  );
}

function Toast({ msg, type = "ok" }) {
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "err" ? ac.r : ac.g, color: "#fff", borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px #0006" }}>{msg}</div>;
}

function Toggle({ label, desc, val, set }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${br.s}` }}>
      <div>
        <div style={{ color: tx.p, fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ color: tx.m, fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => set(!val)} style={{ width: 44, height: 24, borderRadius: 12, background: val ? ac.p : bg.h, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: val ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000088", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg.s, border: `1px solid ${br.d}`, borderRadius: 20, padding: 28, width: 460, maxWidth: "95vw", boxShadow: "0 32px 80px #0008" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: tx.p, fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: tx.m, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── AUTH ─────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");

  const iStyle = { width: "100%", background: bg.t, border: `1px solid ${br.d}`, borderRadius: 10, padding: "12px 14px", color: tx.p, fontSize: 14, outline: "none", boxSizing: "border-box" };

  const submit = async () => {
    setErr(""); setLoad(true);
    try {
      let data;
      if (mode === "login") {
        data = await loginReq(user, pass);
      } else {
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
    <div style={{ minHeight: "100vh", background: bg.p, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, padding: 44, background: bg.s, borderRadius: 24, border: `1px solid ${br.d}`, boxShadow: "0 32px 80px #0008" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>⚡</div>
          <h1 style={{ margin: 0, color: tx.p, fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 28 }}>NEXUS<span style={{ color: ac.p }}>.</span></h1>
          <p style={{ color: tx.m, margin: "5px 0 0", fontSize: 13 }}>connect without barriers</p>
        </div>
        <div style={{ display: "flex", background: bg.t, borderRadius: 12, padding: 4, marginBottom: 22 }}>
          {[["login","Sign In"],["signup","Sign Up"]].map(([m,l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 9, cursor: "pointer", background: mode===m ? "linear-gradient(135deg,#6c63ff,#ff6b9d)" : "transparent", color: mode===m ? "#fff" : tx.m, fontWeight: 700, fontSize: 13 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {mode === "signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Apna naam" style={iStyle} />}
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username (unique)" style={iStyle} />
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

// ── SETTINGS ─────────────────────────────────────────────────
function SettingsPage({ user, token, onUpdate, isFirst = false }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [emailPub, setEP] = useState(user.email_public || false);
  const [srch, setSrch] = useState(user.searchable !== false);
  const [notifs, setNotifs] = useState(user.notifications_on !== false);
  const [avatar, setAv] = useState(user.avatar_base64 || null);
  const [saving, setSav] = useState(false);
  const [toast, setToast] = useState("");
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
      const u = await api.patch("/users/me", { name, bio, avatar_base64: avatar, email_public: emailPub, searchable: srch, notifications_on: notifs, profile_setup_done: true }, token);
      onUpdate(u);
      setToast("Saved! ✅");
      setTimeout(() => setToast(""), 3000);
    } catch(e) { setToast(e.message); }
    finally { setSav(false); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: bg.p, padding: 24 }}>
      <Toast msg={toast} />
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {isFirst && <div style={{ background: `${ac.p}15`, border: `1px solid ${ac.p}33`, borderRadius: 14, padding: "13px 17px", marginBottom: 20, color: ac.p, fontSize: 14, fontWeight: 600 }}>👋 Welcome! Pehle apni profile setup karo.</div>}
        <h2 style={{ color: tx.p, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 20 }}>{isFirst ? "Profile Setup ✨" : "Settings ⚙️"}</h2>

        <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${br.d}`, marginBottom: 14 }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>PROFILE PICTURE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 68, height: 68, borderRadius: "50%", background: `${ac.p}22`, border: `2px solid ${ac.p}44`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>📷</span>}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ background: `${ac.p}22`, border: `1px solid ${ac.p}44`, borderRadius: 9, padding: "9px 16px", color: ac.p, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Upload Photo</button>
              <div style={{ color: tx.m, fontSize: 11, marginTop: 5 }}>Max 2MB</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
        </div>

        <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${br.d}`, marginBottom: 14 }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, marginBottom: 14 }}>PROFILE INFO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Display Name" style={{ background: bg.t, border: `1px solid ${br.d}`, borderRadius: 10, padding: "12px 14px", color: tx.p, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <div style={{ background: bg.t, borderRadius: 10, padding: "10px 14px", color: tx.m, fontSize: 13 }}>Username: <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace" }}>@{user.username}</span></div>
            <div style={{ background: bg.t, borderRadius: 10, padding: "10px 14px", color: tx.m, fontSize: 13 }}>Email: <span style={{ color: tx.s }}>{user.email_full || user.email}</span></div>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio (optional)" rows={3} style={{ background: bg.t, border: `1px solid ${br.d}`, borderRadius: 10, padding: "10px 14px", color: tx.p, fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", width: "100%" }} />
          </div>
        </div>

        <div style={{ background: bg.s, borderRadius: 16, padding: "6px 18px", border: `1px solid ${br.d}`, marginBottom: 14 }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, padding: "13px 0 5px" }}>PRIVACY & NOTIFICATIONS</div>
          <Toggle label="Email Public" desc="Doosre log email dekh sakein" val={emailPub} set={setEP} />
          <Toggle label="Search mein dikho" desc="Log username se dhundh sakein" val={srch} set={setSrch} />
          <Toggle label="Notifications" desc="Naye messages par notification" val={notifs} set={setNotifs} />
        </div>

        {!srch && <div style={{ background: `${ac.y}15`, border: `1px solid ${ac.y}33`, borderRadius: 12, padding: "11px 15px", marginBottom: 14, color: ac.y, fontSize: 13 }}>🔒 Search off — sirf invite link se connect ho sakta hai</div>}

        <button onClick={save} disabled={saving} style={{ width: "100%", background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {saving ? <Spin /> : isFirst ? "Setup Complete → App Kholo ✨" : "Save Changes ✅"}
        </button>
      </div>
    </div>
  );
}

// ── CHAT VIEW ────────────────────────────────────────────────
function ChatView({ room, currentUser, token }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInp] = useState("");
  const [typing, setTyp] = useState([]);
  const [load, setLoad] = useState(true);
  const [inv, setInv] = useState(false);
  const [invCode, setIC] = useState("");
  const wsRef = useRef(null);
  const endRef = useRef(null);
  const tRef = useRef(null);

  useEffect(() => {
    if (!room) return;
    setMsgs([]); setLoad(true);
    api.get(`/rooms/${room.id}/messages`, token).then(setMsgs).catch(console.error).finally(() => setLoad(false));
  }, [room?.id]);

  useEffect(() => {
    if (!room) return;
    const ws = new WebSocket(`${WS}/ws/${room.id}?token=${token}`);
    wsRef.current = ws;
    ws.onmessage = ({ data }) => {
      const e = JSON.parse(data);
      if (e.type === "message") {
        setMsgs(p => [...p, { ...e, seen_count: 0 }]);
        ws.send(JSON.stringify({ type: "seen", message_id: e.id }));
      } else if (e.type === "typing") {
        if (e.is_typing) setTyp(p => p.includes(e.username) ? p : [...p, e.username]);
        else setTyp(p => p.filter(u => u !== e.username));
        clearTimeout(tRef.current);
        tRef.current = setTimeout(() => setTyp([]), 4000);
      } else if (e.type === "seen") {
        setMsgs(p => p.map(m => m.id === e.message_id ? { ...m, seen_count: (m.seen_count || 0) + 1 } : m));
      }
    };
    return () => ws.close();
  }, [room?.id, token]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "message", content: input.trim() }));
    setInp("");
    wsRef.current.send(JSON.stringify({ type: "typing", is_typing: false }));
  };

  const genInv = async () => {
    try {
      const d = await api.post("/invites", { room_id: room.id, expiry_hours: 24, is_one_time: false, max_uses: null }, token);
      setIC(`${window.location.origin}/join/${d.code}`);
      setInv(true);
    } catch(e) { alert(e.message); }
  };

  if (!room) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg.p }}>
      <div style={{ fontSize: 52, marginBottom: 10 }}>💬</div>
      <p style={{ color: tx.m, fontSize: 15 }}>Koi chat select karo</p>
    </div>
  );

  const isDM = room.room_type === "direct";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", background: bg.s, borderBottom: `1px solid ${br.d}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: isDM ? "50%" : 12, background: `${isDM ? ac.s : ac.p}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{isDM ? "👤" : "👥"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: tx.p, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>{room.name}</div>
          <div style={{ color: tx.m, fontSize: 11 }}>{isDM ? "Direct Message" : "Group Room"}</div>
        </div>
        {!isDM && <button onClick={genInv} style={{ background: bg.t, border: `1px solid ${br.d}`, borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontSize: 14, color: tx.s }}>🔗 Invite</button>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", scrollbarWidth: "thin" }}>
        {load ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}><Spin size={30} /></div>
        : msgs.length === 0 ? <div style={{ textAlign: "center", color: tx.m, paddingTop: 40 }}><div style={{ fontSize: 36 }}>👋</div><p>Pehla message bhejo!</p></div>
        : msgs.map((msg, i) => {
          const isOwn = msg.sender_id === currentUser.id;
          const showName = !isOwn && (i === 0 || msgs[i-1].sender_id !== msg.sender_id);
          return (
            <div key={msg.id || i} style={{ display: "flex", gap: 8, marginBottom: showName ? 12 : 3, flexDirection: isOwn ? "row-reverse" : "row" }}>
              {showName ? <Av user={{ username: msg.sender_username, name: msg.sender_name, avatar_base64: msg.sender_avatar }} size={30} /> : <div style={{ width: 30, flexShrink: 0 }} />}
              <div style={{ maxWidth: "66%" }}>
                {showName && <div style={{ color: ac.s, fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{msg.sender_name || msg.sender_username}</div>}
                <div style={{ background: isOwn ? `${ac.p}22` : bg.t, border: `1px solid ${isOwn ? ac.p+"33" : br.d}`, borderRadius: isOwn ? "16px 16px 4px 16px" : (showName ? "4px 16px 16px 16px" : "16px"), padding: "9px 13px" }}>
                  <p style={{ margin: 0, color: tx.p, fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{ color: tx.m, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}
                    </span>
                    {isOwn && (
                      <span style={{ fontSize: 12, color: msg.seen_count > 0 ? ac.g : tx.m }} title={msg.seen_count > 0 ? "Seen" : "Sent"}>
                        {msg.seen_count > 0 ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {typing.length > 0 && <div style={{ color: tx.m, fontSize: 12, fontStyle: "italic", padding: "4px 40px" }}>{typing.join(", ")} likh raha hai...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "10px 14px", background: bg.s, borderTop: `1px solid ${br.d}` }}>
        <div style={{ display: "flex", gap: 8, background: bg.t, borderRadius: 14, border: `1px solid ${br.d}`, padding: "6px 6px 6px 14px" }}>
          <input value={input}
            onChange={e => { setInp(e.target.value); wsRef.current?.send(JSON.stringify({ type: "typing", is_typing: true })); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            onBlur={() => wsRef.current?.send(JSON.stringify({ type: "typing", is_typing: false }))}
            placeholder="Message likhain..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: tx.p, fontSize: 14 }} />
          <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? "linear-gradient(135deg,#6c63ff,#ff6b9d)" : bg.h, border: "none", borderRadius: 10, padding: "9px 14px", color: "#fff", cursor: input.trim() ? "pointer" : "default", fontSize: 15 }}>➤</button>
        </div>
      </div>

      <Modal open={inv} onClose={() => { setInv(false); setIC(""); }} title="🔗 Room Invite Link">
        <div style={{ display: "flex", gap: 10, background: bg.t, borderRadius: 10, padding: "12px 14px", alignItems: "center" }}>
          <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace", fontSize: 12, flex: 1, wordBreak: "break-all" }}>{invCode}</span>
          <button onClick={() => { navigator.clipboard.writeText(invCode); }} style={{ background: ac.p, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Copy</button>
        </div>
        <p style={{ color: tx.m, fontSize: 13, marginTop: 12 }}>Yeh link bhejo — directly room mein aa jayenge.</p>
      </Modal>
    </div>
  );
}

// ── CONNECT PAGE ─────────────────────────────────────────────
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
    <div style={{ flex: 1, overflowY: "auto", background: bg.p, padding: 24 }}>
      <Toast msg={toast} />
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ color: tx.p, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 20 }}>🔌 Connect</h2>

        {/* My One-Time Link */}
        <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${br.d}`, marginBottom: 14 }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}>APNA ONE-TIME LINK</div>
          <p style={{ color: tx.s, fontSize: 13, marginBottom: 12 }}>Sirf is link se koi tumse connect ho sakta hai — ek baar use hoga.</p>
          {myLink
            ? <div style={{ display: "flex", gap: 10, background: bg.t, borderRadius: 10, padding: "11px 13px", alignItems: "center" }}>
                <span style={{ color: ac.p, fontFamily: "'DM Mono',monospace", fontSize: 11, flex: 1, wordBreak: "break-all" }}>{myLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(myLink); msg("Copied! ✅"); }} style={{ background: ac.p, border: "none", borderRadius: 8, padding: "7px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Copy</button>
              </div>
            : <button onClick={genLink} disabled={genL} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                {genL ? <Spin size={16} /> : "🔗 Generate Link"}
              </button>
          }
        </div>

        {/* Search */}
        <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${br.d}`, marginBottom: 14 }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}>USERNAME SE DHUNDO</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={srch} onChange={e=>setSrch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&find()} placeholder="Username..."
              style={{ flex: 1, background: bg.t, border: `1px solid ${br.d}`, borderRadius: 10, padding: "10px 13px", color: tx.p, fontSize: 14, outline: "none" }} />
            <button onClick={find} disabled={load} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {load ? <Spin size={16} /> : "🔍"}
            </button>
          </div>
          {err && <div style={{ color: ac.r, fontSize: 13, marginTop: 10 }}>{err}</div>}
          {found && (
            <div style={{ marginTop: 13, background: bg.t, borderRadius: 12, padding: 13, border: `1px solid ${ac.p}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Av user={found} size={44} dot />
                <div style={{ flex: 1 }}>
                  <div style={{ color: tx.p, fontWeight: 700 }}>{found.name || found.username}</div>
                  <div style={{ color: tx.m, fontSize: 12 }}>@{found.username} • {found.bio || "No bio"}</div>
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
          <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${ac.y}33`, marginBottom: 14 }}>
            <div style={{ color: ac.y, fontSize: 11, letterSpacing: 1.5, marginBottom: 13 }}>⏳ INCOMING REQUESTS ({reqs.length})</div>
            {reqs.map(r => (
              <div key={r.connection_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${br.s}` }}>
                <Av user={{ username: r.sender_username, name: r.sender_name, avatar_base64: r.sender_avatar }} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: tx.p, fontWeight: 700 }}>{r.sender_name || r.sender_username}</div>
                  <div style={{ color: tx.m, fontSize: 12 }}>@{r.sender_username}</div>
                </div>
                <button onClick={() => accept(r.connection_id)} style={{ background: ac.g, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✓ Accept</button>
                <button onClick={() => reject(r.connection_id)} style={{ ...bStyle(ac.r), border: `1px solid ${ac.r}44` }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* My Connections */}
        <div style={{ background: bg.s, borderRadius: 16, padding: 18, border: `1px solid ${br.d}` }}>
          <div style={{ color: tx.m, fontSize: 11, letterSpacing: 1.5, marginBottom: 13 }}>✅ CONNECTIONS ({conns.length})</div>
          {conns.length === 0
            ? <div style={{ color: tx.m, fontSize: 13, textAlign: "center", padding: "14px 0" }}>Koi connection nahi abhi</div>
            : conns.map(co => (
              <div key={co.connection_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${br.s}` }}>
                <Av user={co} size={42} dot />
                <div style={{ flex: 1 }}>
                  <div style={{ color: tx.p, fontWeight: 700 }}>{co.name || co.username}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: co.status === "online" ? ac.g : tx.m }} />
                    <span style={{ color: tx.m, fontSize: 12 }}>{co.status}</span>
                  </div>
                </div>
                <button onClick={() => onOpenDM(co)} style={bStyle(ac.p)}>💬 Chat</button>
                <button onClick={() => block(co.username)} style={{ ...bStyle(ac.r), padding: "8px 10px" }} title="Block">🚫</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function NexusApp() {
  const [token, setToken] = useState(() => localStorage.getItem("nx_t") || "");
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem("nx_u") || "null"); } catch { return null; } });
  const [sec, setSec]     = useState("messages");
  const [rooms, setRooms] = useState([]);
  const [dms, setDMs]     = useState([]);
  const [pend, setPend]   = useState(0);
  const [ar, setAR]       = useState(null);
  const [showCR, setCR]   = useState(false);
  const [isFirst, setIF]  = useState(false);

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

  if (!token || !user) return <AuthScreen onLogin={onLogin} />;

  const nav = [
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "rooms",    icon: "👥", label: "Rooms" },
    { id: "connect",  icon: "🔌", label: "Connect" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const openDM = async (conn) => {
    await loadDMs();
    setAR({ id: conn.room_id, name: conn.name || conn.username, room_type: "direct" });
    setSec("messages");
  };

  const hasSidebar = sec === "messages" || sec === "rooms";

  return (
    <div style={{ height: "100vh", display: "flex", background: bg.p, fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;700&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1e2230;border-radius:2px}
        input::placeholder,textarea::placeholder{color:#4a4f68}
      `}</style>

      {/* Nav Rail */}
      <div style={{ width: 60, background: bg.p, borderRight: `1px solid ${br.s}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, flexShrink: 0 }}>
        <div style={{ fontSize: 22, marginBottom: 12 }}>⚡</div>
        {nav.map(item => (
          <button key={item.id} onClick={() => setSec(item.id)} title={item.label} style={{ background: sec===item.id ? bg.a : "none", border: `1px solid ${sec===item.id ? br.d : "transparent"}`, borderRadius: 12, width: 42, height: 42, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", position: "relative" }}>
            {item.icon}
            {item.id === "connect" && pend > 0 && (
              <div style={{ position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: "50%", background: ac.g, border: `2px solid ${bg.p}`, animation: "pulse 1.5s ease-in-out infinite" }} />
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ cursor: "pointer", marginBottom: 4 }} onClick={() => setSec("settings")}>
          <Av user={user} size={32} />
        </div>
        <button onClick={logout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 6, color: tx.m }}>🚪</button>
      </div>

      {/* Sidebar */}
      {hasSidebar && (
        <div style={{ width: 268, background: bg.s, borderRight: `1px solid ${br.d}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 13px 10px", borderBottom: `1px solid ${br.s}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: tx.p, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>Nexus<span style={{ color: ac.p }}>.</span></span>
              {sec === "rooms" && <button onClick={() => setCR(true)} style={{ background: `${ac.p}22`, border: `1px solid ${ac.p}33`, borderRadius: 8, padding: "5px 10px", color: ac.p, cursor: "pointer", fontSize: 16 }}>+</button>}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {sec === "messages" && (
              dms.length === 0
                ? <div style={{ color: tx.m, fontSize: 13, padding: "20px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>💬</div>
                    🔌 Connect tab se kisi se connect karo
                  </div>
                : dms.map(dm => (
                  <div key={dm.connection_id} onClick={() => setAR({ id: dm.room_id, name: dm.name || dm.username, room_type: "direct" })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 12, margin: "2px 6px", background: ar?.id === dm.room_id ? bg.a : "transparent", transition: "background .15s" }}
                    onMouseEnter={e => { if (ar?.id !== dm.room_id) e.currentTarget.style.background = bg.h; }}
                    onMouseLeave={e => { if (ar?.id !== dm.room_id) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ position: "relative" }}>
                      <Av user={dm} size={40} />
                      <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: dm.status === "online" ? ac.g : tx.m, border: `2px solid ${bg.s}` }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: tx.p, fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dm.name || dm.username}</div>
                      <div style={{ color: dm.status === "online" ? ac.g : tx.m, fontSize: 11 }}>@{dm.username}</div>
                    </div>
                  </div>
                ))
            )}

            {sec === "rooms" && (
              rooms.length === 0
                ? <div style={{ color: tx.m, fontSize: 13, padding: "20px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>👥</div>
                    + se room banao
                  </div>
                : rooms.map(room => (
                  <div key={room.id} onClick={() => setAR(room)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderRadius: 12, margin: "2px 6px", background: ar?.id === room.id ? bg.a : "transparent", transition: "background .15s" }}
                    onMouseEnter={e => { if (ar?.id !== room.id) e.currentTarget.style.background = bg.h; }}
                    onMouseLeave={e => { if (ar?.id !== room.id) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac.p}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>👥</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: tx.p, fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.name}</div>
                      <div style={{ color: tx.m, fontSize: 11 }}>{room.room_type}</div>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div style={{ padding: "9px 12px", borderTop: `1px solid ${br.d}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Av user={user} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: tx.p, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || user.username}</div>
              <div style={{ color: ac.g, fontSize: 11 }}>● Online</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {hasSidebar && <ChatView room={ar} currentUser={user} token={token} />}
        {sec === "connect" && <ConnectPage currentUser={user} token={token} onOpenDM={openDM} onPendChange={setPend} />}
        {sec === "settings" && (
          <SettingsPage user={user} token={token} isFirst={isFirst}
            onUpdate={u => {
              setUser(u);
              localStorage.setItem("nx_u", JSON.stringify(u));
              if (isFirst) { setIF(false); setSec("messages"); }
            }}
          />
        )}

        {/* + Button niche corner */}
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
      </div>

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
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");
  const go = async () => {
    if (!name.trim()) return;
    setLoad(true); setErr("");
    try { const r = await api.post("/rooms", { name: name.trim(), room_type: type }, token); onCreated(r); }
    catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Room ka naam..." style={{ background: bg.t, border: `1px solid ${br.d}`, borderRadius: 10, padding: "12px 14px", color: tx.p, fontSize: 14, outline: "none" }} />
      <div style={{ display: "flex", gap: 8 }}>
        {[["group","👥 Group"],["temporary","⚡ Temporary"]].map(([v,l]) => (
          <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `2px solid ${type===v ? ac.p : br.d}`, background: type===v ? `${ac.p}22` : "transparent", color: type===v ? ac.p : tx.s }}>{l}</button>
        ))}
      </div>
      {err && <div style={{ color: ac.r, fontSize: 13 }}>{err}</div>}
      <button onClick={go} disabled={load} style={{ background: "linear-gradient(135deg,#6c63ff,#ff6b9d)", border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {load ? <Spin size={18} /> : "Create ✨"}
      </button>
    </div>
  );
}
