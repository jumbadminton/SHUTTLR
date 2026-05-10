import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, doc, updateDoc, deleteDoc
} from "firebase/firestore";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const ACCOUNTS = {
  admin:  { password: "shuttlr2026", role: "admin"  },
  viewer: { password: "view2026",    role: "viewer" },
};

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [showPw, setShowPw]     = useState(false);

  function attempt() {
    const acc = ACCOUNTS[username.trim().toLowerCase()];
    if (acc && acc.password === password) {
      onLogin({ username: username.trim().toLowerCase(), role: acc.role });
    } else {
      setError("Incorrect username or password.");
      setTimeout(() => setError(""), 3000);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani','Barlow','Trebuchet MS',sans-serif", padding: 20 }}>
      {/* BG */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 40%,#38c98a0a 0%,transparent 70%)" }} />
      <div style={{ position: "fixed", right: -80, bottom: -40, fontSize: 320, opacity: .025, pointerEvents: "none", transform: "rotate(-20deg)", userSelect: "none" }}>🏸</div>

      <div style={{ background: "#111720", border: "1px solid #1a2030", borderRadius: 22, padding: "44px 40px", width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#38c98a,#5b8af5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28, color: "#0a0d12" }}>S</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: "#38c98a", lineHeight: 1 }}>SHUTTLR</div>
            <div style={{ fontSize: 10, color: "#445", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 3 }}>Community Doubles Rating System</div>
          </div>
        </div>

        <div style={{ fontSize: 14, color: "#556", marginBottom: 22, textAlign: "center" }}>Technical Team Access Only</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: "#445", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Username</div>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Enter username"
            autoComplete="username"
            style={{ width: "100%", background: "#0c1018", border: "1px solid #222d3d", borderRadius: 10, color: "#ccd6f0", padding: "11px 14px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ color: "#445", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && attempt()}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{ width: "100%", background: "#0c1018", border: "1px solid #222d3d", borderRadius: 10, color: "#ccd6f0", padding: "11px 44px 11px 14px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#445", cursor: "pointer", fontSize: 16, padding: 0 }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && <div style={{ color: "#e86060", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}

        <button
          onClick={attempt}
          style={{ width: "100%", background: "linear-gradient(90deg,#38c98a,#5b8af5)", color: "#0a0d12", border: "none", borderRadius: 10, padding: "12px", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginTop: 10, letterSpacing: 1 }}>
          Sign In
        </button>

        {/* Role hint */}
        <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
          {[["🛡️","Admin","Full access — add, edit, log matches"],["👁️","Viewer","View leaderboard & match history"]].map(([icon, role, desc]) => (
            <div key={role} style={{ flex: 1, background: "#0c1018", border: "1px solid #1a2030", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#ccd6f0", marginTop: 3 }}>{role}</div>
              <div style={{ fontSize: 10, color: "#445", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FLIGHT SYSTEM ────────────────────────────────────────────────────────────
const FLIGHTS = [
  { id: "6B",       label: "Flight 6B",  rank: 1, color: "#8a9bb5", glow: "#8a9bb520" },
  { id: "6A",       label: "Flight 6A",  rank: 2, color: "#7ab8d4", glow: "#7ab8d420" },
  { id: "5",        label: "Flight 5",   rank: 3, color: "#68c9a0", glow: "#68c9a020" },
  { id: "4",        label: "Flight 4",   rank: 4, color: "#84d46a", glow: "#84d46a20" },
  { id: "3",        label: "Flight 3",   rank: 5, color: "#d4c44a", glow: "#d4c44a20" },
  { id: "2",        label: "Flight 2",   rank: 6, color: "#e8a030", glow: "#e8a03020" },
  { id: "1",        label: "Flight 1",   rank: 7, color: "#e86030", glow: "#e8603020" },
  { id: "Champ",    label: "Champ",      rank: 8, color: "#cc44cc", glow: "#cc44cc20" },
  { id: "Premiere", label: "Premiere",   rank: 9, color: "#f0c040", glow: "#f0c04030" },
];
const FLIGHT_MAP  = Object.fromEntries(FLIGHTS.map(f => [f.id, f]));
const FLIGHT_IDS  = FLIGHTS.map(f => f.id);
const FLIGHT_BASE = { "6B":100,"6A":200,"5":300,"4":400,"3":500,"2":600,"1":700,"Champ":800,"Premiere":900 };

function getFlight(id) { return FLIGHT_MAP[id] || FLIGHTS[0]; }
function promoteOrDemote(id, dir) {
  const i = FLIGHT_IDS.indexOf(id);
  if (dir === "up"   && i < FLIGHT_IDS.length - 1) return FLIGHT_IDS[i + 1];
  if (dir === "down" && i > 0)                      return FLIGHT_IDS[i - 1];
  return id;
}
function calcNewRating(player, won) {
  const GAIN = 18, LOSS = 12, THRESHOLD = 150;
  const base = FLIGHT_BASE[player.flight];
  let pts    = player.pts + (won ? GAIN : -LOSS);
  let flight = player.flight;
  if      (pts >= base + THRESHOLD) { flight = promoteOrDemote(flight, "up");   pts = FLIGHT_BASE[flight]; }
  else if (pts <  base - THRESHOLD) { flight = promoteOrDemote(flight, "down"); pts = FLIGHT_BASE[flight]; }
  return { flight, pts: Math.max(0, pts) };
}

const CAT = {
  MD: { label: "Men's Doubles",   color: "#5ba8f5" },
  LD: { label: "Ladies' Doubles", color: "#f578b8" },
  XD: { label: "Mixed Doubles",   color: "#a878f5" },
};
const BDR = "#1a2030", SRF = "#111720";

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function FlightBadge({ id, lg }) {
  const f = getFlight(id);
  return <span style={{ background: f.glow, color: f.color, border: `1px solid ${f.color}44`, borderRadius: 20, padding: lg ? "5px 16px" : "2px 10px", fontSize: lg ? 13 : 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{f.label}</span>;
}
function Av({ init, fid, size = 40 }) {
  const f = getFlight(fid);
  return <div style={{ width: size, height: size, borderRadius: "50%", background: f.glow, border: `2px solid ${f.color}`, color: f.color, fontWeight: 900, fontSize: size * 0.33, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{init}</div>;
}
function Trend({ t }) {
  if (t === "up")   return <span style={{ color: "#68c9a0", fontWeight: 900 }}>↑</span>;
  if (t === "down") return <span style={{ color: "#e86060", fontWeight: 900 }}>↓</span>;
  return <span style={{ color: "#334" }}>—</span>;
}
function Lbl({ children }) {
  return <div style={{ color: "#445", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 14, marginBottom: 5 }}>{children}</div>;
}
function Inp(props) {
  return <input {...props} style={{ width: "100%", background: "#0c1018", border: "1px solid #222d3d", borderRadius: 8, color: "#ccd6f0", padding: "9px 13px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }} />;
}
function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ width: "100%", background: "#0c1018", border: "1px solid #222d3d", borderRadius: 8, color: "#ccd6f0", padding: "9px 13px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}>{children}</select>;
}
function BtnPrimary({ onClick, disabled, children }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: "linear-gradient(90deg,#38c98a,#5b8af5)", color: "#0a0d12", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 800, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: disabled ? .7 : 1 }}>{children}</button>;
}
function BtnGhost({ onClick, children }) {
  return <button onClick={onClick} style={{ background: "transparent", color: "#38c98a", border: "1px solid #38c98a44", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{children}</button>;
}
function BtnDanger({ onClick, children }) {
  return <button onClick={onClick} style={{ background: "transparent", color: "#e86060", border: "1px solid #e8606044", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{children}</button>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: SRF, border: "1px solid #222d3d", borderRadius: 18, padding: "26px 28px", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#445", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onCancel}>
      <div style={{ background: SRF, border: "1px solid #e8606044", borderRadius: 18, padding: "28px 32px", width: "100%", maxWidth: 380, textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#ccd6f0" }}>{message}</div>
        <div style={{ fontSize: 13, color: "#445", marginBottom: 24 }}>This cannot be undone.</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <BtnGhost onClick={onCancel}>Cancel</BtnGhost>
          <BtnDanger onClick={onConfirm}>Yes, Delete</BtnDanger>
        </div>
      </div>
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "4px solid #1a2030", borderTop: "4px solid #38c98a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color: "#445", fontSize: 14 }}>Loading SHUTTLR...</div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("shuttlr_user")) || null; } catch { return null; }
  });

  function handleLogin(u) {
    sessionStorage.setItem("shuttlr_user", JSON.stringify(u));
    setUser(u);
  }
  function handleLogout() {
    sessionStorage.removeItem("shuttlr_user");
    setUser(null);
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  return <Shuttlr user={user} onLogout={handleLogout} />;
}

// ─── SHUTTLR MAIN ─────────────────────────────────────────────────────────────
function Shuttlr({ user, onLogout }) {
  const isAdmin = user.role === "admin";

  const [tab, setTab]         = useState("leaderboard");
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selP, setSelP]       = useState(null);
  const [fCat, setFCat]       = useState("ALL");
  const [fFlight, setFFlight] = useState("ALL");
  const [search, setSearch]   = useState("");
  const [showAP, setShowAP]   = useState(false);
  const [showLM, setShowLM]   = useState(false);
  const [editP, setEditP]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [flash, setFlash]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [np, setNp] = useState({ name: "", gender: "M", flight: "6B", md: true, ld: false, xd: false });
  const [nm, setNm] = useState({ cat: "MD", t1p1: "", t1p2: "", t2p1: "", t2p2: "", score: "", winner: 0 });
  const [ep, setEp] = useState({ name: "", gender: "M", flight: "6B", md: true, ld: false, xd: false });

  function toast(m) { setFlash(m); setTimeout(() => setFlash(""), 3000); }

  useEffect(() => {
    const unsubP = onSnapshot(
      query(collection(db, "players"), orderBy("createdAt", "asc")),
      snap => { setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    const unsubM = onSnapshot(
      query(collection(db, "matches"), orderBy("createdAt", "desc")),
      snap => setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubP(); unsubM(); };
  }, []);

  async function addPlayer() {
    if (!np.name.trim() || saving) return;
    setSaving(true);
    const words = np.name.trim().split(" ");
    const av = words.length >= 2 ? (words[0][0] + words[words.length-1][0]).toUpperCase() : words[0].slice(0,2).toUpperCase();
    try {
      await addDoc(collection(db, "players"), {
        name: np.name.trim(), avatar: av, flight: np.flight,
        pts: FLIGHT_BASE[np.flight], gender: np.gender,
        md: np.md, ld: np.ld, xd: np.xd,
        matches: 0, wins: 0, trend: "stable",
        createdAt: serverTimestamp()
      });
      setNp({ name: "", gender: "M", flight: "6B", md: true, ld: false, xd: false });
      setShowAP(false);
      toast(`${np.name.trim()} added!`);
    } catch { toast("Error saving player."); }
    setSaving(false);
  }

  function openEdit(p) {
    setEp({ name: p.name, gender: p.gender, flight: p.flight, md: p.md, ld: p.ld, xd: p.xd });
    setEditP(p);
  }

  async function saveEdit() {
    if (!ep.name.trim() || saving) return;
    setSaving(true);
    const words = ep.name.trim().split(" ");
    const av = words.length >= 2 ? (words[0][0] + words[words.length-1][0]).toUpperCase() : words[0].slice(0,2).toUpperCase();
    try {
      await updateDoc(doc(db, "players", editP.id), {
        name: ep.name.trim(), avatar: av, gender: ep.gender,
        flight: ep.flight, pts: FLIGHT_BASE[ep.flight],
        md: ep.md, ld: ep.ld, xd: ep.xd,
      });
      if (selP && selP.id === editP.id) setSelP(p => ({ ...p, ...ep, name: ep.name.trim(), avatar: av, pts: FLIGHT_BASE[ep.flight] }));
      setEditP(null);
      toast(`${ep.name.trim()} updated!`);
    } catch { toast("Error updating player."); }
    setSaving(false);
  }

  async function deletePlayer(p) {
    setSaving(true);
    try {
      await deleteDoc(doc(db, "players", p.id));
      setConfirmDel(null);
      if (selP && selP.id === p.id) setSelP(null);
      toast(`${p.name} removed.`);
    } catch { toast("Error deleting player."); }
    setSaving(false);
  }

  async function logMatch() {
    if (!nm.t1p1 || !nm.t1p2 || !nm.t2p1 || !nm.t2p2 || !nm.score || !nm.winner || saving) return;
    setSaving(true);
    const winner = +nm.winner;
    const t1 = [nm.t1p1, nm.t1p2], t2 = [nm.t2p1, nm.t2p2];
    try {
      await addDoc(collection(db, "matches"), {
        cat: nm.cat, t1p1: nm.t1p1, t1p2: nm.t1p2, t2p1: nm.t2p1, t2p2: nm.t2p2,
        score: nm.score, winner,
        date: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp()
      });
      const involved = players.filter(p => t1.includes(p.name) || t2.includes(p.name));
      await Promise.all(involved.map(p => {
        const inT1 = t1.includes(p.name);
        const won  = (inT1 && winner === 1) || (!inT1 && winner === 2);
        const { flight, pts } = calcNewRating(p, won);
        return updateDoc(doc(db, "players", p.id), { flight, pts, matches: p.matches + 1, wins: p.wins + (won ? 1 : 0), trend: won ? "up" : "down" });
      }));
      setNm({ cat: "MD", t1p1: "", t1p2: "", t2p1: "", t2p2: "", score: "", winner: 0 });
      setShowLM(false);
      toast("Match logged — ratings updated!");
    } catch { toast("Error saving match."); }
    setSaving(false);
  }

  const board = players
    .filter(p => {
      if (fFlight !== "ALL" && p.flight !== fFlight) return false;
      if (fCat === "MD" && !p.md) return false;
      if (fCat === "LD" && !p.ld) return false;
      if (fCat === "XD" && !p.xd) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => FLIGHT_BASE[b.flight] - FLIGHT_BASE[a.flight] || b.pts - a.pts);

  const names = players.map(p => p.name);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0d12", color: "#ccd6f0", fontFamily: "'Rajdhani','Barlow','Trebuchet MS',sans-serif" }}><Spinner /></div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d12", color: "#ccd6f0", fontFamily: "'Rajdhani','Barlow','Trebuchet MS',sans-serif", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 35% at 85% 8%,#38c98a09 0%,transparent 60%),radial-gradient(ellipse 45% 45% at 8% 85%,#5b8af508 0%,transparent 55%)" }} />
      <div style={{ position: "fixed", right: -60, top: "25%", fontSize: 260, opacity: .022, pointerEvents: "none", transform: "rotate(-28deg)", userSelect: "none" }}>🏸</div>

      {/* ── Header ── */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${BDR}`, background: "#0c1018ee", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#38c98a,#5b8af5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#0a0d12" }}>S</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 5, color: "#38c98a", lineHeight: 1 }}>SHUTTLR</div>
            <div style={{ fontSize: 9, color: "#334", letterSpacing: 2.5, textTransform: "uppercase" }}>Community Doubles Rating System</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Role badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: isAdmin ? "#38c98a18" : "#5b8af518", border: `1px solid ${isAdmin ? "#38c98a44" : "#5b8af544"}`, borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 13 }}>{isAdmin ? "🛡️" : "👁️"}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: isAdmin ? "#38c98a" : "#5b8af5", textTransform: "uppercase", letterSpacing: 1 }}>{isAdmin ? "Admin" : "Viewer"}</span>
          </div>

          {/* Admin-only action buttons */}
          {isAdmin && (
            <>
              <BtnGhost onClick={() => setShowAP(true)}>＋ Player</BtnGhost>
              <BtnPrimary onClick={() => setShowLM(true)}>Log Match</BtnPrimary>
            </>
          )}

          {/* User menu */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowLogout(v => !v)} style={{ background: "#1a2030", border: `1px solid ${BDR}`, color: "#889", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {user.username} ▾
            </button>
            {showLogout && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: SRF, border: `1px solid ${BDR}`, borderRadius: 10, padding: 8, zIndex: 50, minWidth: 130 }}>
                <button onClick={() => { setShowLogout(false); onLogout(); }} style={{ width: "100%", background: "none", border: "none", color: "#e86060", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, textAlign: "left", borderRadius: 6 }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast */}
      {flash && <div style={{ position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#38c98a,#5b8af5)", color: "#0a0d12", padding: "9px 30px", borderRadius: 30, fontWeight: 800, zIndex: 999, fontSize: 13, boxShadow: "0 4px 28px #38c98a44", letterSpacing: .5, whiteSpace: "nowrap" }}>{flash}</div>}

      {/* Viewer banner */}
      {!isAdmin && (
        <div style={{ background: "#5b8af510", border: "none", borderBottom: `1px solid #5b8af522`, padding: "8px 24px", fontSize: 12, color: "#5b8af5", textAlign: "center", letterSpacing: .5 }}>
          👁️ You are in <b>View Only</b> mode — contact your admin to log matches or make changes.
        </div>
      )}

      {/* Nav */}
      <nav style={{ display: "flex", borderBottom: `1px solid ${BDR}`, background: "#0c1018", padding: "0 18px" }}>
        {[["leaderboard","🏆 Leaderboard"],["matches","📋 Matches"],["players","👤 Players"]].map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? "#38c98a" : "#334", padding: "13px 20px", fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 800 : 700, letterSpacing: .4, fontFamily: "inherit", borderBottom: tab === t ? "2px solid #38c98a" : "2px solid transparent" }}>{lbl}</button>
        ))}
      </nav>

      <div style={{ padding: "22px 20px 0", maxWidth: 1100, margin: "0 auto" }}>

        {/* ════ LEADERBOARD ════ */}
        {tab === "leaderboard" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "#445", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Category</span>
                {[["ALL","All"],["MD","Men's Doubles"],["LD","Ladies' Doubles"],["XD","Mixed Doubles"]].map(([k, lbl]) => (
                  <button key={k} onClick={() => setFCat(k)} style={{ background: fCat === k ? (CAT[k]?.color || "#38c98a") : "#13182299", color: fCat === k ? "#0a0d12" : "#667", border: fCat === k ? "none" : `1px solid ${BDR}`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{lbl}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#445", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Flight</span>
                <select value={fFlight} onChange={e => setFFlight(e.target.value)} style={{ background: "#13182299", border: `1px solid ${BDR}`, color: "#ccd6f0", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontFamily: "inherit", outline: "none" }}>
                  <option value="ALL">All Flights</option>
                  {[...FLIGHTS].reverse().map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player…" style={{ marginLeft: "auto", background: "#13182299", border: `1px solid ${BDR}`, color: "#ccd6f0", borderRadius: 8, padding: "7px 13px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {[...FLIGHTS].reverse().map(f => {
                const cnt = players.filter(p => p.flight === f.id).length;
                const active = fFlight === f.id;
                return (
                  <div key={f.id} onClick={() => setFFlight(fFlight === f.id ? "ALL" : f.id)} style={{ background: active ? f.glow : "#111720", border: `1px solid ${active ? f.color : f.color + "33"}`, borderRadius: 10, padding: "7px 13px", cursor: "pointer" }}>
                    <div style={{ color: f.color, fontWeight: 800, fontSize: 12 }}>{f.label}</div>
                    <div style={{ color: f.color + "88", fontSize: 10 }}>{cnt} player{cnt !== 1 ? "s" : ""}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 14, overflow: "auto", marginBottom: 28 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isAdmin ? 760 : 680 }}>
                <thead>
                  <tr>{["#","Player","Flight","Plays","W","L","Win%","Trend", ...(isAdmin ? [""] : [])].map(h => (
                    <th key={h} style={{ padding: "11px 15px", textAlign: "left", color: "#334", fontSize: 10, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase", borderBottom: `1px solid ${BDR}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {board.length === 0 && (
                    <tr><td colSpan={isAdmin ? 9 : 8} style={{ padding: 32, textAlign: "center", color: "#334", fontSize: 14 }}>
                      {players.length === 0 ? "No players yet." : "No players match these filters."}
                    </td></tr>
                  )}
                  {board.map((p, i) => {
                    const wr = p.matches > 0 ? Math.round(p.wins / p.matches * 100) : 0;
                    const cats = [p.md && "MD", p.ld && "LD", p.xd && "XD"].filter(Boolean);
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${BDR}44` }}>
                        <td style={{ padding: "11px 15px", color: "#334", fontWeight: 800, fontFamily: "monospace", fontSize: 15 }}>{i + 1}</td>
                        <td style={{ padding: "11px 15px", cursor: "pointer" }} onClick={() => { setSelP(p); setTab("players"); }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Av init={p.avatar} fid={p.flight} size={36} />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 15px" }}><FlightBadge id={p.flight} /></td>
                        <td style={{ padding: "11px 15px" }}>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {cats.map(c => <span key={c} style={{ background: CAT[c].color + "22", color: CAT[c].color, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 800 }}>{c}</span>)}
                          </div>
                        </td>
                        <td style={{ padding: "11px 15px", color: "#68c9a0", fontWeight: 700 }}>{p.wins}</td>
                        <td style={{ padding: "11px 15px", color: "#e86060" }}>{p.matches - p.wins}</td>
                        <td style={{ padding: "11px 15px", fontFamily: "monospace" }}>{wr}%</td>
                        <td style={{ padding: "11px 15px" }}><Trend t={p.trend} /></td>
                        {isAdmin && (
                          <td style={{ padding: "11px 15px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => openEdit(p)} style={{ background: "none", border: "1px solid #38c98a44", color: "#38c98a", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✏️ Edit</button>
                              <button onClick={() => setConfirmDel(p)} style={{ background: "none", border: "1px solid #e8606044", color: "#e86060", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>🗑️</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ MATCHES ════ */}
        {tab === "matches" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Match History</div>
                <div style={{ fontSize: 12, color: "#445", marginTop: 2 }}>{matches.length} matches logged</div>
              </div>
              {isAdmin && <BtnPrimary onClick={() => setShowLM(true)}>＋ Log Match</BtnPrimary>}
            </div>
            {matches.length === 0 && <div style={{ color: "#334", textAlign: "center", padding: 48, fontSize: 15 }}>No matches yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {matches.map(m => {
                const cc = CAT[m.cat]?.color || "#888";
                return (
                  <div key={m.id} style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "14px 18px", borderLeft: `4px solid ${cc}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ background: cc + "22", color: cc, borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 800 }}>{CAT[m.cat]?.label}</span>
                      <span style={{ color: "#334", fontSize: 12, marginLeft: "auto" }}>{m.date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: m.winner === 1 ? 800 : 400, color: m.winner === 1 ? "#68c9a0" : "#445", fontSize: 14, lineHeight: 1.7 }}>{m.t1p1}</div>
                        <div style={{ fontWeight: m.winner === 1 ? 800 : 400, color: m.winner === 1 ? "#68c9a0" : "#445", fontSize: 14, lineHeight: 1.7 }}>{m.t1p2}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 8px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 14, color: "#ccd6f0", whiteSpace: "nowrap" }}>{m.score}</span>
                        <span style={{ color: "#334", fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>VS</span>
                      </div>
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ fontWeight: m.winner === 2 ? 800 : 400, color: m.winner === 2 ? "#68c9a0" : "#445", fontSize: 14, lineHeight: 1.7 }}>{m.t2p1}</div>
                        <div style={{ fontWeight: m.winner === 2 ? 800 : 400, color: m.winner === 2 ? "#68c9a0" : "#445", fontSize: 14, lineHeight: 1.7 }}>{m.t2p2}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#445" }}>🏆 {m.winner === 1 ? `${m.t1p1} & ${m.t1p2}` : `${m.t2p1} & ${m.t2p2}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ PLAYERS ════ */}
        {tab === "players" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{selP ? "Player Profile" : "All Players"}</div>
                {selP && <button onClick={() => setSelP(null)} style={{ background: "none", border: "none", color: "#38c98a", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit", marginTop: 4 }}>← Back to all players</button>}
              </div>
              {!selP && isAdmin && <BtnGhost onClick={() => setShowAP(true)}>＋ Add Player</BtnGhost>}
            </div>

            {selP ? (
              <Profile p={selP} matches={matches} isAdmin={isAdmin} onEdit={() => openEdit(selP)} onDelete={() => setConfirmDel(selP)} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
                {players.length === 0 && <div style={{ color: "#334", gridColumn: "1/-1", textAlign: "center", padding: 48 }}>No players yet.</div>}
                {players.map(p => {
                  const wr = p.matches > 0 ? Math.round(p.wins / p.matches * 100) : 0;
                  const cats = [p.md && "MD", p.ld && "LD", p.xd && "XD"].filter(Boolean);
                  return (
                    <div key={p.id} style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 14, padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
                      {isAdmin && (
                        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 5 }}>
                          <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "#38c98a", fontSize: 15, cursor: "pointer", padding: 2 }}>✏️</button>
                          <button onClick={() => setConfirmDel(p)} style={{ background: "none", border: "none", color: "#e86060", fontSize: 15, cursor: "pointer", padding: 2 }}>🗑️</button>
                        </div>
                      )}
                      <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }} onClick={() => setSelP(p)}>
                        <Av init={p.avatar} fid={p.flight} size={56} />
                        <div style={{ fontWeight: 800, fontSize: 15, textAlign: "center" }}>{p.name}</div>
                        <FlightBadge id={p.flight} lg />
                        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                          <div style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 18 }}>{p.matches}</div><div style={{ fontSize: 10, color: "#445" }}>Played</div></div>
                          <div style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 18, color: "#68c9a0" }}>{p.wins}</div><div style={{ fontSize: 10, color: "#445" }}>Wins</div></div>
                          <div style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 18 }}>{wr}%</div><div style={{ fontSize: 10, color: "#445" }}>Win%</div></div>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
                          {cats.map(c => <span key={c} style={{ background: CAT[c].color + "22", color: CAT[c].color, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 800 }}>{CAT[c].label}</span>)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Trend t={p.trend} />
                          <span style={{ fontSize: 11, color: "#445" }}>{p.trend === "up" ? "Rising" : p.trend === "down" ? "Dropping" : "Stable"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flight Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "14px 22px", borderTop: `1px solid ${BDR}`, background: "#0c1018", marginTop: 36 }}>
        <span style={{ color: "#334", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginRight: 4 }}>Flight Scale →</span>
        {FLIGHTS.map(f => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
            <span style={{ color: f.color, fontSize: 11, fontWeight: 700 }}>{f.label}</span>
          </div>
        ))}
        <span style={{ color: "#334", fontSize: 10, marginLeft: 4 }}>↑ Lowest to Highest</span>
      </div>

      {/* ══ MODAL: Add Player ══ */}
      {showAP && isAdmin && (
        <Modal title="Add New Player" onClose={() => setShowAP(false)}>
          <Lbl>Full Name</Lbl>
          <Inp placeholder="e.g. Maria Santos" value={np.name} onChange={e => setNp(v => ({ ...v, name: e.target.value }))} />
          <Lbl>Gender</Lbl>
          <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
            {[["M","Male"],["F","Female"]].map(([v, l]) => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#889", cursor: "pointer" }}>
                <input type="radio" name="add_gender" checked={np.gender === v} onChange={() => setNp(x => ({ ...x, gender: v }))} /> {l}
              </label>
            ))}
          </div>
          <Lbl>Starting Flight</Lbl>
          <Sel value={np.flight} onChange={e => setNp(v => ({ ...v, flight: e.target.value }))}>
            {[...FLIGHTS].reverse().map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </Sel>
          <Lbl>Plays in (select all that apply)</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 4 }}>
            {[["md","Men's Doubles"],["ld","Ladies' Doubles"],["xd","Mixed Doubles"]].map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#889", cursor: "pointer" }}>
                <input type="checkbox" checked={np[k]} onChange={e => setNp(v => ({ ...v, [k]: e.target.checked }))} /> {l}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <BtnGhost onClick={() => setShowAP(false)}>Cancel</BtnGhost>
            <BtnPrimary onClick={addPlayer} disabled={saving}>{saving ? "Saving…" : "Add Player"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: Edit Player ══ */}
      {editP && isAdmin && (
        <Modal title={`Edit — ${editP.name}`} onClose={() => setEditP(null)}>
          <Lbl>Full Name</Lbl>
          <Inp value={ep.name} onChange={e => setEp(v => ({ ...v, name: e.target.value }))} />
          <Lbl>Gender</Lbl>
          <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
            {[["M","Male"],["F","Female"]].map(([v, l]) => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#889", cursor: "pointer" }}>
                <input type="radio" name="edit_gender" checked={ep.gender === v} onChange={() => setEp(x => ({ ...x, gender: v }))} /> {l}
              </label>
            ))}
          </div>
          <Lbl>Flight</Lbl>
          <Sel value={ep.flight} onChange={e => setEp(v => ({ ...v, flight: e.target.value }))}>
            {[...FLIGHTS].reverse().map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </Sel>
          <Lbl>Plays in (select all that apply)</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 4 }}>
            {[["md","Men's Doubles"],["ld","Ladies' Doubles"],["xd","Mixed Doubles"]].map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#889", cursor: "pointer" }}>
                <input type="checkbox" checked={ep[k]} onChange={e => setEp(v => ({ ...v, [k]: e.target.checked }))} /> {l}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#e8a030", marginTop: 12, lineHeight: 1.6 }}>⚠️ Changing the flight resets the player's internal points to that flight's baseline.</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
            <BtnDanger onClick={() => { setEditP(null); setConfirmDel(editP); }}>Delete Player</BtnDanger>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnGhost onClick={() => setEditP(null)}>Cancel</BtnGhost>
              <BtnPrimary onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</BtnPrimary>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: Log Match ══ */}
      {showLM && isAdmin && (
        <Modal title="Log a Match" onClose={() => setShowLM(false)}>
          <Lbl>Match Category</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            {Object.entries(CAT).map(([k, { label, color }]) => (
              <button key={k} onClick={() => setNm(v => ({ ...v, cat: k }))} style={{ background: nm.cat === k ? color + "33" : "#13182299", color: nm.cat === k ? color : "#667", border: `1px solid ${nm.cat === k ? color : BDR}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end", marginTop: 4 }}>
            <div>
              <Lbl>Team 1 – Player 1</Lbl>
              <Sel value={nm.t1p1} onChange={e => setNm(v => ({ ...v, t1p1: e.target.value }))}>
                <option value="">— Select —</option>
                {names.map(n => <option key={n}>{n}</option>)}
              </Sel>
              <Lbl>Team 1 – Player 2</Lbl>
              <Sel value={nm.t1p2} onChange={e => setNm(v => ({ ...v, t1p2: e.target.value }))}>
                <option value="">— Select —</option>
                {names.filter(n => n !== nm.t1p1).map(n => <option key={n}>{n}</option>)}
              </Sel>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#334", fontWeight: 900, fontSize: 18, paddingBottom: 4 }}>VS</div>
            <div>
              <Lbl>Team 2 – Player 1</Lbl>
              <Sel value={nm.t2p1} onChange={e => setNm(v => ({ ...v, t2p1: e.target.value }))}>
                <option value="">— Select —</option>
                {names.filter(n => n !== nm.t1p1 && n !== nm.t1p2).map(n => <option key={n}>{n}</option>)}
              </Sel>
              <Lbl>Team 2 – Player 2</Lbl>
              <Sel value={nm.t2p2} onChange={e => setNm(v => ({ ...v, t2p2: e.target.value }))}>
                <option value="">— Select —</option>
                {names.filter(n => n !== nm.t1p1 && n !== nm.t1p2 && n !== nm.t2p1).map(n => <option key={n}>{n}</option>)}
              </Sel>
            </div>
          </div>
          <Lbl>Score (e.g. 21-15, 21-18 or 21-15, 19-21, 21-14)</Lbl>
          <Inp placeholder="21-15, 21-18" value={nm.score} onChange={e => setNm(v => ({ ...v, score: e.target.value }))} />
          <Lbl>Winner</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {[[1,"Team 1",nm.t1p1,nm.t1p2],[2,"Team 2",nm.t2p1,nm.t2p2]].map(([val, lbl, p1, p2]) => (
              <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: nm.winner === val ? "#68c9a0" : "#889", cursor: "pointer", background: nm.winner === val ? "#68c9a011" : "transparent", border: `1px solid ${nm.winner === val ? "#68c9a044" : BDR}`, borderRadius: 8, padding: "8px 12px" }}>
                <input type="radio" name="winner" checked={nm.winner === val} onChange={() => setNm(v => ({ ...v, winner: val }))} />
                <span><b>{lbl}</b>{p1 && p2 ? ` — ${p1} & ${p2}` : ""}</span>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            <BtnGhost onClick={() => setShowLM(false)}>Cancel</BtnGhost>
            <BtnPrimary onClick={logMatch} disabled={saving}>{saving ? "Saving…" : "Save Match"}</BtnPrimary>
          </div>
        </Modal>
      )}

      {/* ══ Confirm Delete ══ */}
      {confirmDel && isAdmin && (
        <ConfirmModal
          message={`Delete ${confirmDel.name}?`}
          onConfirm={() => deletePlayer(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function Profile({ p, matches, isAdmin, onEdit, onDelete }) {
  const wr   = p.matches > 0 ? Math.round(p.wins / p.matches * 100) : 0;
  const cats = [p.md && "MD", p.ld && "LD", p.xd && "XD"].filter(Boolean);
  const myM  = matches.filter(m => [m.t1p1, m.t1p2, m.t2p1, m.t2p2].includes(p.name));
  const f    = getFlight(p.flight);
  const partnerCnt = {};
  myM.forEach(m => {
    const inT1 = [m.t1p1, m.t1p2].includes(p.name);
    (inT1 ? [m.t1p1, m.t1p2] : [m.t2p1, m.t2p2]).forEach(n => {
      if (n !== p.name) partnerCnt[n] = (partnerCnt[n] || 0) + 1;
    });
  });
  const topP = Object.entries(partnerCnt).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingBottom: 40 }}>
      <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 16, padding: "28px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", maxWidth: 420 }}>
        <Av init={p.avatar} fid={p.flight} size={78} />
        <div style={{ fontSize: 24, fontWeight: 900 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: "#445" }}>{p.gender === "M" ? "Male" : "Female"}</div>
        <FlightBadge id={p.flight} lg />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
          {cats.map(c => <span key={c} style={{ background: CAT[c].color + "22", color: CAT[c].color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>{CAT[c].label}</span>)}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {[[p.matches,"Played",{}],[p.wins,"Wins",{color:"#68c9a0"}],[p.matches-p.wins,"Losses",{color:"#e86060"}],[wr+"%","Win %",{}]].map(([v,l,extra]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 24, ...extra }}>{v}</div>
              <div style={{ fontSize: 10, color: "#445" }}>{l}</div>
            </div>
          ))}
        </div>
        {topP && <div style={{ fontSize: 12, color: "#445", marginTop: 4 }}>Most paired with: <span style={{ color: f.color, fontWeight: 700 }}>{topP[0]}</span> ({topP[1]}×)</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Trend t={p.trend} />
          <span style={{ fontSize: 12, color: "#445" }}>{p.trend === "up" ? "Flight Rising" : p.trend === "down" ? "Flight Dropping" : "Flight Stable"}</span>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <BtnGhost onClick={onEdit}>✏️ Edit Player</BtnGhost>
            <BtnDanger onClick={onDelete}>🗑️ Delete</BtnDanger>
          </div>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: 620 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Match History ({myM.length})</div>
        {myM.length === 0
          ? <div style={{ color: "#445", textAlign: "center", padding: 32 }}>No matches recorded yet.</div>
          : myM.map(m => {
            const inT1 = [m.t1p1, m.t1p2].includes(p.name);
            const won  = (inT1 && m.winner === 1) || (!inT1 && m.winner === 2);
            const cc   = CAT[m.cat]?.color || "#888";
            return (
              <div key={m.id} style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 11, padding: "12px 16px", marginBottom: 10, borderLeft: `4px solid ${won ? "#68c9a0" : "#e86060"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ background: cc + "22", color: cc, borderRadius: 20, padding: "1px 10px", fontSize: 10, fontWeight: 800 }}>{CAT[m.cat]?.label}</span>
                  <span style={{ fontWeight: 800, color: won ? "#68c9a0" : "#e86060" }}>{won ? "WIN" : "LOSS"}</span>
                  <span style={{ color: "#334", fontSize: 12, marginLeft: "auto" }}>{m.date}</span>
                </div>
                <div style={{ fontSize: 13, color: "#778899" }}>
                  <b style={{ color: "#aabbcc" }}>{m.t1p1} & {m.t1p2}</b>
                  <span style={{ margin: "0 8px", color: "#334" }}>vs</span>
                  <b style={{ color: "#aabbcc" }}>{m.t2p1} & {m.t2p2}</b>
                  <span style={{ margin: "0 8px", color: "#445" }}>·</span>
                  <span style={{ fontFamily: "monospace" }}>{m.score}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
