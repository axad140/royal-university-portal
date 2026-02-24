"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap, ChevronRight, ChevronLeft, Sun, Moon, Check,
  User, Mail, Phone, BookOpen, Award, Upload, Eye, EyeOff,
  Globe, Microscope, Cpu, Palette, Scale, Heart, Building,
  Star, ArrowRight, Sparkles, Shield, Clock, Users, Search,
  CreditCard, CheckCircle, AlertCircle, X, RefreshCw, FileText,
  Hash, Calendar, Layers, Brain, Lock, Database, Zap, TrendingUp,
  FlaskConical, Calculator, Languages, Activity, Code2,
  LogIn, LogOut, LayoutDashboard, ThumbsUp, ThumbsDown,
  ChevronDown, Menu, Filter, BarChart3, UserCheck, UserX, Loader2
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
//  SUPABASE CONFIG — unchanged from original
// ═══════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
const STORAGE_BUCKET = "admission-docs";

// Admin credentials (in production, use server-side auth)
const ADMIN_USERNAME = "uniadmin";
const ADMIN_PASSWORD = "admin111";

// ─── Supabase helpers ────────────────────────────────────────────
function generateAdmissionId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "ADM-";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id + "-" + Date.now().toString().slice(-4);
}

async function uploadFile(file, admissionId, fileType) {
  if (!file) return null;
  try {
    const ext = file.name.split(".").pop();
    const path = `${admissionId}/${fileType}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
  } catch (_) { return null; }
}

async function saveAdmission(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
}

async function updatePaymentStatus(admissionId, extraPayload = {}) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admissions?admission_id=eq.${encodeURIComponent(admissionId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "return=representation" },
        body: JSON.stringify({
          payment_status: "Paid",
          paid_at: new Date().toISOString(),
          ...extraPayload,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    if (!Array.isArray(json) || json.length === 0) throw new Error("not_found");
    return { success: true, data: json[0] };
  } catch (e) { return { success: false, error: String(e) }; }
}

async function fetchAllAdmissions() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admissions?select=*&order=submitted_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { success: true, data: Array.isArray(json) ? json : [] };
  } catch (e) { return { success: false, error: String(e), data: [] }; }
}

async function updateApplicationStatus(admissionId, status) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admissions?admission_id=eq.${encodeURIComponent(admissionId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "return=representation" },
        body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
}

// ═══════════════════════════════════════════════════════════════════
//  25 PROGRAMS — unchanged
// ═══════════════════════════════════════════════════════════════════
const PROGRAMS = [
  { id:"bs-cs",   title:"BS Computer Science",        icon:Cpu,          level:"BS",  dept:"Computing",    color:"#2563EB" },
  { id:"bs-ai",   title:"BS Artificial Intelligence", icon:Brain,        level:"BS",  dept:"Computing",    color:"#7C3AED" },
  { id:"bs-se",   title:"BS Software Engineering",    icon:Code2,        level:"BS",  dept:"Computing",    color:"#0891B2" },
  { id:"bs-ds",   title:"BS Data Science",            icon:Database,     level:"BS",  dept:"Computing",    color:"#059669" },
  { id:"bs-cy",   title:"BS Cyber Security",          icon:Shield,       level:"BS",  dept:"Computing",    color:"#DC2626" },
  { id:"bs-it",   title:"BS Information Technology",  icon:Layers,       level:"BS",  dept:"Computing",    color:"#D97706" },
  { id:"bs-ee",   title:"BS Electrical Engineering",  icon:Zap,          level:"BS",  dept:"Engineering",  color:"#EA580C" },
  { id:"bs-me",   title:"BS Mechanical Engineering",  icon:Activity,     level:"BS",  dept:"Engineering",  color:"#65A30D" },
  { id:"bs-civ",  title:"BS Civil Engineering",       icon:Building,     level:"BS",  dept:"Engineering",  color:"#78716C" },
  { id:"bs-ba",   title:"BS Business Administration", icon:TrendingUp,   level:"BS",  dept:"Business",     color:"#2563EB" },
  { id:"bs-af",   title:"BS Accounting & Finance",    icon:Calculator,   level:"BS",  dept:"Business",     color:"#16A34A" },
  { id:"bs-psy",  title:"BS Psychology",              icon:Heart,        level:"BS",  dept:"Social Sci.",  color:"#DB2777" },
  { id:"bs-phy",  title:"BS Physics",                 icon:FlaskConical, level:"BS",  dept:"Sciences",     color:"#9333EA" },
  { id:"bs-math", title:"BS Mathematics",             icon:Hash,         level:"BS",  dept:"Sciences",     color:"#0284C7" },
  { id:"bs-bio",  title:"BS Biotechnology",           icon:Microscope,   level:"BS",  dept:"Sciences",     color:"#10B981" },
  { id:"bs-eng",  title:"BS English",                 icon:Languages,    level:"BS",  dept:"Arts",         color:"#F59E0B" },
  { id:"ms-cs",   title:"MS Computer Science",        icon:Cpu,          level:"MS",  dept:"Computing",    color:"#3B82F6" },
  { id:"ms-ds",   title:"MS Data Science",            icon:Database,     level:"MS",  dept:"Computing",    color:"#8B5CF6" },
  { id:"ms-ai",   title:"MS Artificial Intelligence", icon:Brain,        level:"MS",  dept:"Computing",    color:"#4F46E5" },
  { id:"ms-cy",   title:"MS Cyber Security",          icon:Lock,         level:"MS",  dept:"Computing",    color:"#EF4444" },
  { id:"ms-se",   title:"MS Software Engineering",    icon:Code2,        level:"MS",  dept:"Computing",    color:"#06B6D4" },
  { id:"ms-pm",   title:"MS Project Management",      icon:Layers,       level:"MS",  dept:"Business",     color:"#F97316" },
  { id:"ms-ee",   title:"MS Electrical Engineering",  icon:Zap,          level:"MS",  dept:"Engineering",  color:"#FBBF24" },
  { id:"mba",     title:"MBA (Executive)",            icon:Building,     level:"MBA", dept:"Business",     color:"#059669" },
  { id:"ms-cp",   title:"MS Clinical Psychology",     icon:Heart,        level:"MS",  dept:"Health Sci.",  color:"#E11D48" },
];

const STEPS = ["Program","Personal","Academics","Documents","Review","Submit"];
const EMPTY_FORM = {
  firstName:"",lastName:"",fatherName:"",email:"",phone:"",dob:"",gender:"",nationality:"Pakistani",cnic:"",address:"",
  program:"",sscMarks:"",sscTotal:"",sscBoard:"",sscYear:"",hsscMarks:"",hsscTotal:"",hsscBoard:"",hsscYear:"",
  prevDegree:"",prevCgpa:"",prevInstitution:"",essay:"",password:"",terms:false,
};
const EMPTY_FILES = { transcript:null, cnic:null, photo:null };

// ═══════════════════════════════════════════════════════════════════
//  RESPONSIVE HOOK
// ═══════════════════════════════════════════════════════════════════
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ═══════════════════════════════════════════════════════════════════
//  ADMIN LOGIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin, dark, C }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showP, setShowP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // brief loading effect
    if (user.trim() === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid credentials. Access denied.");
    }
    setLoading(false);
  };

  const inp = { width:"100%", padding:"12px 16px", borderRadius:12, border:`1px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:15, outline:"none", fontFamily:"inherit", transition:"border-color .2s, box-shadow .2s" };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* blobs */}
      <div style={{ position:"absolute", top:"-20%", left:"-15%", width:600, height:600, borderRadius:"50%", background:dark?"radial-gradient(circle,rgba(37,99,235,.13) 0%,transparent 68%)":"radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 68%)", animation:"float-a 9s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-20%", right:"-15%", width:500, height:500, borderRadius:"50%", background:dark?"radial-gradient(circle,rgba(79,70,229,.1) 0%,transparent 65%)":"radial-gradient(circle,rgba(79,70,229,.05) 0%,transparent 65%)", animation:"float-b 11s ease-in-out infinite", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, background:C.cardBg, backdropFilter:"blur(32px)", borderRadius:28, border:`1px solid ${C.border}`, boxShadow:dark?"0 32px 80px rgba(0,0,0,.45)":"0 32px 80px rgba(37,99,235,.1)", overflow:"hidden" }}>
        <div style={{ padding:"32px 36px 28px", borderBottom:`1px solid ${C.border}`, background:dark?"rgba(37,99,235,.06)":"rgba(37,99,235,.03)", textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#1E40AF,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(37,99,235,.4)" }}>
            <Shield size={26} color="#fff"/>
          </div>
          <div style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.02em", marginBottom:6 }}>Admin Portal</div>
          <div style={{ fontSize:13, color:C.muted }}>Royal University · Secure Access Only</div>
        </div>

        <div style={{ padding:"28px 36px 32px" }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:6, display:"block", letterSpacing:"0.06em", textTransform:"uppercase" }}>Username</label>
            <div style={{ position:"relative" }}>
              <User size={15} color={C.muted} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
              <input style={{ ...inp, paddingLeft:40 }} placeholder="Enter username" value={user} onChange={e=>{setUser(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:6, display:"block", letterSpacing:"0.06em", textTransform:"uppercase" }}>Password</label>
            <div style={{ position:"relative" }}>
              <Lock size={15} color={C.muted} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
              <input style={{ ...inp, paddingLeft:40 }} type={showP?"text":"password"} placeholder="Enter password" value={pass} onChange={e=>{setPass(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              <button onClick={()=>setShowP(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}>
                {showP?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding:"11px 14px", borderRadius:11, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#EF4444", fontSize:13, fontWeight:600, marginBottom:18, display:"flex", alignItems:"center", gap:9 }}>
              <AlertCircle size={15} style={{flexShrink:0}}/>{error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width:"100%", padding:"13px", borderRadius:50, fontWeight:700, fontSize:15, cursor:"pointer", border:"none", background:"linear-gradient(135deg,#2563EB,#1D4ED8)", color:"#fff", boxShadow:"0 6px 24px rgba(37,99,235,.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, opacity:loading?.75:1, transition:"all .2s", fontFamily:"inherit" }}
          >
            {loading?<Loader2 size={18} style={{animation:"spin .8s linear infinite"}}/>:<LogIn size={18}/>}
            {loading?"Verifying…":"Access Dashboard"}
          </button>

          <div style={{ marginTop:20, padding:"12px 16px", borderRadius:12, background:dark?"rgba(37,99,235,.07)":"rgba(37,99,235,.04)", border:`1px solid ${C.border}`, fontSize:12, color:C.muted, textAlign:"center", lineHeight:1.6 }}>
            🔒 This portal is restricted to authorised university administrators only.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════
function AdminDashboard({ onLogout, dark, setDark, C, isMobile }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQ, setSearchQ] = useState("");
  const [updating, setUpdating] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    const result = await fetchAllAdmissions();
    setLoading(false);
    if (result.success) setRecords(result.data);
    else setFetchError("Failed to fetch records. Check Supabase credentials.");
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleStatusUpdate = async (admissionId, newStatus) => {
    setUpdating(p => ({ ...p, [admissionId]: newStatus }));
    const result = await updateApplicationStatus(admissionId, newStatus);
    if (result.success) {
      setRecords(prev => prev.map(r => r.admission_id === admissionId ? { ...r, status: newStatus } : r));
    }
    setUpdating(p => { const n = { ...p }; delete n[admissionId]; return n; });
  };

  const filtered = records.filter(r => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const q = searchQ.toLowerCase();
    const matchSearch = !q || (r.first_name + " " + r.last_name).toLowerCase().includes(q)
      || (r.admission_id || "").toLowerCase().includes(q)
      || (r.program_title || "").toLowerCase().includes(q)
      || (r.email || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: records.length,
    underReview: records.filter(r => r.status === "Under Review").length,
    approved: records.filter(r => r.status === "Approved").length,
    rejected: records.filter(r => r.status === "Rejected").length,
    paid: records.filter(r => r.payment_status === "Paid").length,
  };

  const statusColor = (s) => s === "Approved" ? "#10B981" : s === "Rejected" ? "#EF4444" : s === "Under Review" ? "#F59E0B" : C.muted;
  const statusBg   = (s) => s === "Approved" ? "rgba(16,185,129,.12)" : s === "Rejected" ? "rgba(239,68,68,.12)" : "rgba(245,158,11,.12)";

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Outfit','DM Sans',system-ui" }}>
      {/* Admin Navbar */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:dark?"rgba(3,7,14,.95)":"rgba(237,242,255,.95)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:isMobile?"12px 16px":"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2563EB,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <LayoutDashboard size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:isMobile?13:15, letterSpacing:"-0.01em" }}>
              <span style={{color:"#2563EB"}}>Royal</span> Admin Dashboard
            </div>
            {!isMobile && <div style={{ fontSize:11, color:C.muted }}>Admissions Management System</div>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={loadRecords} style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:C.inputBg, cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, fontFamily:"inherit" }}>
            <RefreshCw size={13}/>{!isMobile&&"Refresh"}
          </button>
          <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:9, border:`1px solid ${C.border}`, background:C.inputBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {dark?<Sun size={14} color="#FBBF24"/>:<Moon size={14} color="#6366F1"/>}
          </button>
          <button onClick={onLogout} style={{ padding:"8px 16px", borderRadius:50, border:"1px solid rgba(239,68,68,.3)", background:"rgba(239,68,68,.08)", cursor:"pointer", color:"#EF4444", display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
            <LogOut size={13}/>{!isMobile&&"Logout"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:"0 auto", padding:isMobile?"16px 12px":"28px 32px" }}>
        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(5,1fr)", gap:12, marginBottom:28 }}>
          {[
            ["Total Applications", stats.total, "#2563EB", BarChart3],
            ["Under Review",       stats.underReview, "#F59E0B", Clock],
            ["Approved",           stats.approved, "#10B981", UserCheck],
            ["Rejected",           stats.rejected, "#EF4444", UserX],
            ["Payments Received",  stats.paid, "#8B5CF6", CreditCard],
          ].map(([label, val, color, Icon]) => (
            <div key={label} style={{ padding:isMobile?"14px":"18px 20px", borderRadius:18, background:C.cardBg, backdropFilter:"blur(20px)", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
                <div style={{ width:30, height:30, borderRadius:9, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={15} color={color}/>
                </div>
              </div>
              <div style={{ fontSize:28, fontWeight:900, color, letterSpacing:"-0.03em" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={14} color={C.muted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              style={{ width:"100%", padding:"10px 14px 10px 36px", borderRadius:12, border:`1px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:13, outline:"none", fontFamily:"inherit" }}
              placeholder="Search by name, ID, program, email…"
              value={searchQ}
              onChange={e=>setSearchQ(e.target.value)}
            />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["ALL","Under Review","Approved","Rejected"].map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} style={{ padding:"9px 14px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${statusFilter===s?"#2563EB":C.inputBorder}`, background:statusFilter===s?"rgba(37,99,235,.14)":C.inputBg, color:statusFilter===s?"#2563EB":C.muted, fontFamily:"inherit", transition:"all .18s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div style={{ textAlign:"center", padding:80, color:C.muted }}>
            <Loader2 size={36} style={{ animation:"spin .8s linear infinite", marginBottom:16 }} color="#2563EB"/>
            <div style={{ fontSize:15, fontWeight:600 }}>Loading records from Supabase…</div>
          </div>
        ) : fetchError ? (
          <div style={{ padding:32, borderRadius:18, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", textAlign:"center", color:"#EF4444" }}>
            <AlertCircle size={28} style={{ marginBottom:12 }}/>
            <div style={{ fontWeight:700, marginBottom:6 }}>Failed to Load Records</div>
            <div style={{ fontSize:13, color:C.muted }}>{fetchError}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:80, color:C.muted }}>
            <FileText size={36} style={{ marginBottom:16, opacity:.4 }}/>
            <div style={{ fontSize:15, fontWeight:600 }}>No records found</div>
          </div>
        ) : isMobile ? (
          // Mobile: card list
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(r => (
              <div key={r.admission_id} style={{ borderRadius:18, background:C.cardBg, backdropFilter:"blur(20px)", border:`1px solid ${C.border}`, overflow:"hidden" }}>
                <div style={{ padding:"16px 18px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:15 }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontFamily:"monospace", fontSize:12, color:"#2563EB", fontWeight:700, marginTop:2 }}>{r.admission_id}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.program_title}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <span style={{ padding:"4px 10px", borderRadius:50, fontSize:11, fontWeight:700, background:statusBg(r.status), color:statusColor(r.status) }}>{r.status}</span>
                    <span style={{ padding:"4px 10px", borderRadius:50, fontSize:11, fontWeight:700, background:r.payment_status==="Paid"?"rgba(16,185,129,.12)":"rgba(239,68,68,.1)", color:r.payment_status==="Paid"?"#10B981":"#EF4444" }}>{r.payment_status||"Pending"}</span>
                  </div>
                </div>
                {/* Payment details strip */}
                {(r.payment_type || r.transaction_id || r.amount_paid) && (
                  <div style={{ padding:"10px 18px", borderTop:`1px solid ${C.border}`, display:"flex", flexWrap:"wrap", gap:8 }}>
                    {r.payment_type && (
                      <div style={{ padding:"5px 10px", borderRadius:8, background:"rgba(37,99,235,.1)", border:"1px solid rgba(37,99,235,.2)" }}>
                        <div style={{ fontSize:9, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Method</div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#2563EB" }}>{r.payment_type}</div>
                      </div>
                    )}
                    {r.transaction_id && (
                      <div style={{ padding:"5px 10px", borderRadius:8, background:C.inputBg, border:`1px solid ${C.inputBorder}` }}>
                        <div style={{ fontSize:9, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>TXN Ref</div>
                        <div style={{ fontSize:11, fontWeight:700, color:C.text, fontFamily:"monospace" }}>{r.transaction_id}</div>
                      </div>
                    )}
                    {r.amount_paid && (
                      <div style={{ padding:"5px 10px", borderRadius:8, background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)" }}>
                        <div style={{ fontSize:9, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Amount</div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#10B981" }}>PKR {Number(r.amount_paid).toLocaleString()}</div>
                      </div>
                    )}
                    {r.payment_proof_url && (
                      <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" style={{ padding:"5px 12px", borderRadius:8, background:"rgba(37,99,235,.1)", border:"1px solid rgba(37,99,235,.2)", textDecoration:"none", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, color:"#2563EB" }}>
                        <Upload size={11}/> Proof
                      </a>
                    )}
                  </div>
                )}
                <div style={{ padding:"12px 18px 14px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
                  <button
                    onClick={()=>handleStatusUpdate(r.admission_id,"Approved")}
                    disabled={r.status==="Approved"||!!updating[r.admission_id]}
                    style={{ flex:1, padding:"9px", borderRadius:10, border:"1px solid rgba(16,185,129,.3)", background:r.status==="Approved"?"rgba(16,185,129,.15)":"rgba(16,185,129,.08)", color:"#10B981", fontWeight:700, fontSize:13, cursor:r.status==="Approved"?"not-allowed":"pointer", opacity:r.status==="Approved"?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}
                  >
                    {updating[r.admission_id]==="Approved"?<Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/>:<ThumbsUp size={13}/>}
                    Approve
                  </button>
                  <button
                    onClick={()=>handleStatusUpdate(r.admission_id,"Rejected")}
                    disabled={r.status==="Rejected"||!!updating[r.admission_id]}
                    style={{ flex:1, padding:"9px", borderRadius:10, border:"1px solid rgba(239,68,68,.3)", background:r.status==="Rejected"?"rgba(239,68,68,.15)":"rgba(239,68,68,.08)", color:"#EF4444", fontWeight:700, fontSize:13, cursor:r.status==="Rejected"?"not-allowed":"pointer", opacity:r.status==="Rejected"?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}
                  >
                    {updating[r.admission_id]==="Rejected"?<Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/>:<ThumbsDown size={13}/>}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: full table
          <div style={{ background:C.cardBg, backdropFilter:"blur(24px)", borderRadius:22, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:dark?"rgba(37,99,235,.07)":"rgba(37,99,235,.04)", borderBottom:`1px solid ${C.border}` }}>
                    {["Admission ID","Full Name","Program","Email","SSC %","HSSC %","Pay Method","TXN Ref","Amount","Proof","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"14px 16px", textAlign:"left", fontWeight:700, color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const sscPct  = r.ssc_marks  && r.ssc_total  ? ((r.ssc_marks/r.ssc_total)*100).toFixed(1)   : "—";
                    const hsscPct = r.hssc_marks && r.hssc_total ? ((r.hssc_marks/r.hssc_total)*100).toFixed(1) : "—";
                    return (
                      <tr key={r.admission_id} style={{ borderBottom:`1px solid ${C.border}`, background:idx%2===0?"transparent":dark?"rgba(255,255,255,.01)":"rgba(37,99,235,.01)", transition:"background .15s" }}>
                        <td style={{ padding:"14px 16px" }}>
                          <code style={{ fontFamily:"monospace", fontSize:12, color:"#2563EB", fontWeight:700, background:dark?"rgba(37,99,235,.1)":"rgba(37,99,235,.08)", padding:"3px 8px", borderRadius:6 }}>{r.admission_id}</code>
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ fontWeight:700 }}>{r.first_name} {r.last_name}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{r.father_name ? `S/O ${r.father_name}` : ""}</div>
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ fontWeight:600, maxWidth:180 }}>{r.program_title}</div>
                          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:50, background:"rgba(37,99,235,.12)", color:"#2563EB", fontWeight:700 }}>{r.program_id?.split("-")[0]?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding:"14px 16px", color:C.muted, fontSize:12 }}>{r.email}</td>
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ fontWeight:700, color:sscPct!=="—"&&+sscPct>=70?"#10B981":sscPct!=="—"&&+sscPct>=50?"#F59E0B":"#EF4444" }}>{sscPct}{sscPct!=="—"?"%":""}</span>
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ fontWeight:700, color:hsscPct!=="—"&&+hsscPct>=70?"#10B981":hsscPct!=="—"&&+hsscPct>=50?"#F59E0B":"#EF4444" }}>{hsscPct}{hsscPct!=="—"?"%":""}</span>
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ padding:"4px 10px", borderRadius:50, fontSize:11, fontWeight:700, background:r.payment_status==="Paid"?"rgba(16,185,129,.12)":"rgba(239,68,68,.1)", color:r.payment_status==="Paid"?"#10B981":"#EF4444" }}>{r.payment_type || (r.payment_status==="Paid" ? "Paid" : "Pending")}</span>
                        </td>
                        <td style={{ padding:"14px 16px", color:C.muted, fontSize:12, maxWidth:130 }}>
                          {r.transaction_id
                            ? <code style={{ fontFamily:"monospace", fontSize:11, background:dark?"rgba(37,99,235,.1)":"rgba(37,99,235,.07)", padding:"2px 6px", borderRadius:5, color:"#2563EB", wordBreak:"break-all" }}>{r.transaction_id}</code>
                            : <span style={{color:C.muted,opacity:.5}}>—</span>
                          }
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          {r.amount_paid
                            ? <span style={{ fontWeight:700, color:"#10B981" }}>PKR {Number(r.amount_paid).toLocaleString()}</span>
                            : <span style={{color:C.muted,opacity:.5}}>—</span>
                          }
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          {r.payment_proof_url
                            ? <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, color:"#2563EB", textDecoration:"none", padding:"4px 10px", borderRadius:50, background:"rgba(37,99,235,.12)", display:"inline-flex", alignItems:"center", gap:4 }}>
                                <Upload size={10}/> View
                              </a>
                            : <span style={{ fontSize:11, color:C.muted, opacity:.5 }}>None</span>
                          }
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <span style={{ padding:"5px 12px", borderRadius:50, fontSize:11, fontWeight:700, background:statusBg(r.status), color:statusColor(r.status) }}>{r.status}</span>
                        </td>
                        <td style={{ padding:"14px 16px" }}>
                          <div style={{ display:"flex", gap:8 }}>
                            <button
                              onClick={()=>handleStatusUpdate(r.admission_id,"Approved")}
                              disabled={r.status==="Approved"||!!updating[r.admission_id]}
                              title="Approve"
                              style={{ padding:"7px 14px", borderRadius:9, border:"1px solid rgba(16,185,129,.35)", background:r.status==="Approved"?"rgba(16,185,129,.18)":"rgba(16,185,129,.08)", color:"#10B981", fontWeight:700, fontSize:12, cursor:r.status==="Approved"?"not-allowed":"pointer", opacity:r.status==="Approved"?.6:1, display:"flex", alignItems:"center", gap:5, fontFamily:"inherit", transition:"all .18s" }}
                            >
                              {updating[r.admission_id]==="Approved"?<Loader2 size={12} style={{animation:"spin .8s linear infinite"}}/>:<ThumbsUp size={12}/>}
                              Approve
                            </button>
                            <button
                              onClick={()=>handleStatusUpdate(r.admission_id,"Rejected")}
                              disabled={r.status==="Rejected"||!!updating[r.admission_id]}
                              title="Reject"
                              style={{ padding:"7px 14px", borderRadius:9, border:"1px solid rgba(239,68,68,.35)", background:r.status==="Rejected"?"rgba(239,68,68,.18)":"rgba(239,68,68,.08)", color:"#EF4444", fontWeight:700, fontSize:12, cursor:r.status==="Rejected"?"not-allowed":"pointer", opacity:r.status==="Rejected"?.6:1, display:"flex", alignItems:"center", gap:5, fontFamily:"inherit", transition:"all .18s" }}
                            >
                              {updating[r.admission_id]==="Rejected"?<Loader2 size={12} style={{animation:"spin .8s linear infinite"}}/>:<ThumbsDown size={12}/>}
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>Showing <strong style={{color:C.text}}>{filtered.length}</strong> of <strong style={{color:C.text}}>{records.length}</strong> records</span>
              <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PORTAL COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function UniversityPortal() {
  const [dark, setDark] = useState(true);
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState("apply");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [animDir, setAnimDir] = useState(1);
  const [paymentId, setPaymentId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  // Extended payment fields
  const [paymentType, setPaymentType] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [files, setFiles] = useState(EMPTY_FILES);
  const [form, setForm] = useState(EMPTY_FORM);

  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // Secret admin trigger: type "admin" into URL hash or click hidden trigger
  const [adminTriggerClicks, setAdminTriggerClicks] = useState(0);

  const formRef = useRef(null);
  const winWidth = useWindowWidth();
  const isMobile = winWidth < 768;
  const isMd     = winWidth >= 768 && winWidth < 1024;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    // Also check URL hash for /admin
    if (typeof window !== "undefined" && (window.location.hash === "#admin" || window.location.pathname === "/admin")) {
      setShowAdminLogin(true);
    }
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Secret: click the logo 5 times to open admin
  useEffect(() => {
    if (adminTriggerClicks >= 5) {
      setShowAdminLogin(true);
      setAdminTriggerClicks(0);
    }
  }, [adminTriggerClicks]);

  const d = dark;
  const C = {
    bg:          d ? "#03070E" : "#EDF2FF",
    cardBg:      d ? "rgba(8,18,45,0.72)" : "rgba(255,255,255,0.72)",
    border:      d ? "rgba(255,255,255,0.07)" : "rgba(37,99,235,0.13)",
    text:        d ? "#E6EFFF" : "#081529",
    muted:       d ? "#6080A8" : "#4A6FA5",
    inputBg:     d ? "rgba(255,255,255,0.04)" : "rgba(37,99,235,0.03)",
    inputBorder: d ? "rgba(255,255,255,0.09)" : "rgba(37,99,235,0.17)",
    accent:      "#2563EB",
  };

  // Render admin portal
  if (showAdminLogin && !adminLoggedIn) {
    return (
      <div style={{ fontFamily:"'Outfit','DM Sans',system-ui" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
          @keyframes float-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          input:focus{border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,.15)!important;outline:none}
        `}</style>
        <AdminLogin onLogin={()=>setAdminLoggedIn(true)} dark={d} C={C}/>
        <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)" }}>
          <button onClick={()=>setShowAdminLogin(false)} style={{ padding:"8px 20px", borderRadius:50, border:`1px solid ${C.border}`, background:C.cardBg, backdropFilter:"blur(16px)", color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            ← Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (adminLoggedIn) {
    return (
      <div style={{ fontFamily:"'Outfit','DM Sans',system-ui" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          body{overflow-x:hidden}
          ::-webkit-scrollbar{width:5px}
          ::-webkit-scrollbar-thumb{background:rgba(37,99,235,.32);border-radius:99px}
          @keyframes spin{to{transform:rotate(360deg)}}
          input:focus{border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,.15)!important;outline:none}
          table tr:hover td{background:${d?"rgba(37,99,235,.04)":"rgba(37,99,235,.03)"}!important}
        `}</style>
        <AdminDashboard
          onLogout={()=>{ setAdminLoggedIn(false); setShowAdminLogin(false); }}
          dark={d} setDark={setDark} C={C} isMobile={isMobile}
        />
      </div>
    );
  }

  // ── Helpers
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFile  = (k, v) => setFiles(f => ({ ...f, [k]: v }));

  const filteredPrograms = PROGRAMS.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.title.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q)) &&
           (levelFilter === "ALL" || p.level === levelFilter);
  });

  const validate = () => {
    const e = {};
    if (step === 0 && !form.program) e.program = "Please select a program to continue.";
    if (step === 1) {
      if (!form.firstName.trim())  e.firstName  = "Required";
      if (!form.lastName.trim())   e.lastName   = "Required";
      if (!form.fatherName.trim()) e.fatherName = "Required";
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.phone.trim())      e.phone      = "Required";
      if (!form.dob)               e.dob        = "Required";
      if (!form.gender)            e.gender     = "Required";
      if (!form.cnic.trim())       e.cnic       = "Required";
    }
    if (step === 2) {
      if (!form.sscMarks  || isNaN(+form.sscMarks))  e.sscMarks  = "Required";
      if (!form.sscTotal  || isNaN(+form.sscTotal))  e.sscTotal  = "Required";
      if (!form.sscBoard.trim())                      e.sscBoard  = "Required";
      if (!form.sscYear)                              e.sscYear   = "Required";
      if (!form.hsscMarks || isNaN(+form.hsscMarks)) e.hsscMarks = "Required";
      if (!form.hsscTotal || isNaN(+form.hsscTotal)) e.hsscTotal = "Required";
      if (!form.hsscBoard.trim())                     e.hsscBoard = "Required";
      if (!form.hsscYear)                             e.hsscYear  = "Required";
    }
    if (step === 3) {
      if (!form.essay || form.essay.trim().length < 80) e.essay    = "Minimum 80 characters required.";
      if (!form.password || form.password.length < 8)   e.password = "Minimum 8 characters.";
      if (!form.terms)                                   e.terms    = "You must agree to proceed.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validate()) {
      setAnimDir(1);
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 60);
    }
  };
  const goPrev = () => {
    setErrors({});
    setAnimDir(-1);
    setStep(s => Math.max(s - 1, 0));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 60);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    const admId = generateAdmissionId();
    const [transcriptUrl, cnicUrl, photoUrl] = await Promise.all([
      uploadFile(files.transcript, admId, "transcript"),
      uploadFile(files.cnic,       admId, "cnic"),
      uploadFile(files.photo,      admId, "photo"),
    ]);
    const prog = PROGRAMS.find(p => p.id === form.program);
    const payload = {
      admission_id: admId,
      first_name: form.firstName, last_name: form.lastName,
      father_name: form.fatherName, email: form.email,
      phone: form.phone, dob: form.dob, gender: form.gender,
      nationality: form.nationality, cnic: form.cnic, address: form.address,
      program_id: form.program, program_title: prog ? prog.title : form.program,
      ssc_marks:  form.sscMarks  ? Number(form.sscMarks)  : null,
      ssc_total:  form.sscTotal  ? Number(form.sscTotal)  : null,
      ssc_board:  form.sscBoard,
      ssc_year:   form.sscYear   ? Number(form.sscYear)   : null,
      hssc_marks: form.hsscMarks ? Number(form.hsscMarks) : null,
      hssc_total: form.hsscTotal ? Number(form.hsscTotal) : null,
      hssc_board: form.hsscBoard,
      hssc_year:  form.hsscYear  ? Number(form.hsscYear)  : null,
      prev_degree: form.prevDegree || null,
      prev_cgpa: form.prevCgpa || null,
      prev_institution: form.prevInstitution || null,
      essay: form.essay,
      transcript_url: transcriptUrl, cnic_url: cnicUrl, photo_url: photoUrl,
      payment_status: "Pending", status: "Under Review",
      submitted_at: new Date().toISOString(),
    };
    const result = await saveAdmission(payload);
    setSubmitting(false);
    if (result.success) { setGeneratedId(admId); setSubmitted(true); }
    else setSubmitError("Submission failed. Check your Supabase credentials and try again.");
  };

  const handlePayment = async () => {
    const trimmed = paymentId.trim().toUpperCase();
    // Validate all fields
    const pErr = {};
    if (!trimmed) pErr.paymentId = "Admission ID is required.";
    if (!paymentType) pErr.paymentType = "Please select a payment method.";
    if (!transactionId.trim()) pErr.transactionId = "Transaction / Reference ID is required.";
    if (!amountPaid || isNaN(+amountPaid) || +amountPaid <= 0) pErr.amountPaid = "Enter a valid amount.";
    setPaymentErrors(pErr);
    if (Object.keys(pErr).length > 0) return;

    setPaymentLoading(true);
    setPaymentResult(null);

    // Upload payment proof if provided
    let proofUrl = null;
    if (paymentProofFile) {
      proofUrl = await uploadFile(paymentProofFile, trimmed, "payment_proof");
    }

    const extra = {
      payment_type:       paymentType,
      transaction_id:     transactionId.trim(),
      amount_paid:        parseFloat(amountPaid),
      payment_proof_url:  proofUrl,
    };

    const result = await updatePaymentStatus(trimmed, extra);
    setPaymentLoading(false);
    if (result.success) {
      setPaymentResult({
        success: true,
        message: `Payment confirmed for ${result.data.first_name} ${result.data.last_name}. Status updated to Paid.`,
        data: result.data,
      });
    } else {
      setPaymentResult({
        success: false,
        message: result.error?.includes("not_found")
          ? "Admission ID not found. Please verify and try again."
          : "Update failed. Verify your Admission ID or Supabase config.",
      });
    }
  };

  const resetApp = () => {
    setSubmitted(false); setStep(0); setForm(EMPTY_FORM);
    setFiles(EMPTY_FILES); setErrors({}); setGeneratedId(""); setSubmitError("");
  };

  // ── Responsive style helpers
  const pad = isMobile ? "0 14px" : "0 24px";
  const cardPad = isMobile ? "16px 18px" : "30px 34px";
  const headerPad = isMobile ? "18px 18px 16px" : "26px 34px 22px";
  const inp = { width:"100%", padding:isMobile?"10px 12px":"11px 14px", borderRadius:11, border:`1px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:isMobile?13:14, outline:"none", backdropFilter:"blur(8px)", transition:"border-color .2s, box-shadow .2s", fontFamily:"inherit" };
  const lbl = { fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, display:"block", letterSpacing:"0.06em", textTransform:"uppercase" };
  const errS = { fontSize:11, color:"#F87171", marginTop:3 };
  const pbtn = { padding:isMobile?"10px 18px":"12px 28px", borderRadius:50, fontWeight:700, fontSize:isMobile?13:14, cursor:"pointer", border:"none", display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#2563EB,#1D4ED8)", color:"#fff", boxShadow:"0 6px 24px rgba(37,99,235,.35)", transition:"all .2s", fontFamily:"inherit" };
  const gbtn = { padding:isMobile?"10px 16px":"12px 24px", borderRadius:50, fontWeight:600, fontSize:isMobile?13:14, cursor:"pointer", background:"transparent", color:C.muted, display:"flex", alignItems:"center", gap:8, transition:"all .2s", fontFamily:"inherit", border:`1px solid ${C.border}` };

  const selProg  = PROGRAMS.find(p => p.id === form.program);
  const sscPct   = form.sscMarks  && form.sscTotal  && +form.sscTotal  > 0 ? ((+form.sscMarks  / +form.sscTotal)  * 100).toFixed(1) : null;
  const hsscPct  = form.hsscMarks && form.hsscTotal && +form.hsscTotal > 0 ? ((+form.hsscMarks / +form.hsscTotal) * 100).toFixed(1) : null;
  const stepAnim = animDir >= 0 ? "sa-fwd" : "sa-bwd";

  const STEP_ICONS   = [BookOpen, User, Award, FileText, CheckCircle, Sparkles];
  const STEP_TITLES  = ["Select Your Program","Personal Information","Academic Qualifications","Documents & Statement","Review Application","Finalize & Submit"];
  const STEP_SUBS    = [
    "Browse and select from 25 programs across all disciplines.",
    "Provide personal details as per your CNIC / B-Form.",
    "Enter your SSC, HSSC (or equivalent) results accurately.",
    "Upload required documents and write your personal statement.",
    "Carefully review all information before proceeding.",
    "Submit your application and receive your unique Admission ID.",
  ];

  // Responsive grid columns for programs
  const progCols = isMobile ? "repeat(1,1fr)" : isMd ? "repeat(3,1fr)" : "repeat(auto-fill,minmax(180px,1fr))";
  // Responsive review grid
  const reviewCols = isMobile ? "1fr" : "1fr 1fr";
  // Responsive form grid
  const formGrid2 = isMobile ? "1fr" : "1fr 1fr";
  const formGrid3 = isMobile ? "1fr" : "1fr 1fr 1fr";
  const formGrid4 = isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr";

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Outfit','DM Sans',system-ui", transition:"background .3s,color .3s", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(37,99,235,.32);border-radius:99px}
        input,textarea,select,button{font-family:inherit}
        input:focus,textarea:focus,select:focus{border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,.15)!important;outline:none}
        @keyframes float-a{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(2deg)}}
        @keyframes float-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px) rotate(-3deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sa-fwd{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sa-bwd{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
        .fadeUp{animation:fadeUp .5s ease both}
        .d1{animation-delay:.06s}.d2{animation-delay:.13s}.d3{animation-delay:.2s}
        .sa-fwd{animation:sa-fwd .36s cubic-bezier(.22,1,.36,1) both}
        .sa-bwd{animation:sa-bwd .36s cubic-bezier(.22,1,.36,1) both}
        .card-h{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}
        .card-h:hover{transform:translateY(-4px)!important}
        .prog-card:hover{border-color:var(--pc)!important}
        .nav-link{transition:color .18s;text-decoration:none}
        .nav-link:hover{color:#2563EB!important}
        .pbtn:hover{transform:translateY(-2px)!important;box-shadow:0 12px 36px rgba(37,99,235,.45)!important}
        .gbtn:hover{border-color:#2563EB!important;color:#2563EB!important}
        .tab-btn{cursor:pointer;border:none;font-family:inherit;transition:all .2s}
      `}</style>

      {/* BACKGROUND BLOBS */}
      <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-22%", left:"-14%", width:isMobile?400:720, height:isMobile?400:720, borderRadius:"50%", background:d?"radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 68%)":"radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 68%)", animation:"float-a 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-20%", right:"-12%", width:isMobile?350:640, height:isMobile?350:640, borderRadius:"50%", background:d?"radial-gradient(circle,rgba(79,70,229,.1) 0%,transparent 65%)":"radial-gradient(circle,rgba(79,70,229,.05) 0%,transparent 65%)", animation:"float-b 11s ease-in-out infinite" }}/>
      </div>

      {/* ── FLOATING NAVBAR ── */}
      <nav style={{
        position:"fixed", top:12, left:"50%", transform:"translateX(-50%)", zIndex:200,
        width: isMobile ? "95%" : "90%",
        maxWidth: 1100,
        background: scrolled ? (d?"rgba(3,7,14,.9)":"rgba(237,242,255,.9)") : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
        borderRadius:18, padding: isMobile ? "10px 14px" : "12px 24px",
        border: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        boxShadow: scrolled ? (d?"0 8px 40px rgba(0,0,0,.35)":"0 8px 40px rgba(37,99,235,.1)") : "none",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"all .35s",
      }}>
        {/* Logo — click 5x to open admin */}
        <div
          onClick={()=>setAdminTriggerClicks(c=>c+1)}
          style={{ display:"flex", alignItems:"center", gap:9, cursor:"default", userSelect:"none" }}
        >
          <div style={{ width:isMobile?32:38, height:isMobile?32:38, borderRadius:10, background:"linear-gradient(135deg,#2563EB,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(37,99,235,.45)", flexShrink:0 }}>
            <GraduationCap size={isMobile?17:20} color="#fff"/>
          </div>
          {!isMobile && (
            <div>
              <div style={{ fontWeight:800, fontSize:15, letterSpacing:"-0.02em", lineHeight:1 }}>
                <span style={{color:"#2563EB"}}>Royal</span><span style={{color:C.text}}> University</span>
              </div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Est. 1892</div>
            </div>
          )}
          {isMobile && <span style={{ fontWeight:800, fontSize:14, color:C.text }}><span style={{color:"#2563EB"}}>Royal</span> Uni</span>}
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display:"flex", alignItems:"center", gap:24, fontSize:14, fontWeight:500 }}>
            {["Programs","Faculty","Campus","Research"].map(n=>(
              <a key={n} href="#" className="nav-link" style={{color:C.muted}}>{n}</a>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={()=>setDark(!d)} style={{ width:isMobile?32:36, height:isMobile?32:36, borderRadius:9, border:`1px solid ${C.border}`, background:C.inputBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {d?<Sun size={isMobile?13:15} color="#FBBF24"/>:<Moon size={isMobile?13:15} color="#6366F1"/>}
          </button>
          {/* Admin button — visible as subtle link */}
          <button
            onClick={()=>setShowAdminLogin(true)}
            title="Admin Login"
            style={{ width:isMobile?32:36, height:isMobile?32:36, borderRadius:9, border:`1px solid ${C.border}`, background:C.inputBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            <Lock size={isMobile?13:15} color={C.muted}/>
          </button>
          {!isMobile && (
            <button className="pbtn" onClick={()=>{ setActiveTab("apply"); formRef.current?.scrollIntoView({behavior:"smooth"}); }} style={pbtn}>
              Apply Now <ArrowRight size={14}/>
            </button>
          )}
          {isMobile && (
            <button onClick={()=>setMobileMenuOpen(v=>!v)} style={{ width:32, height:32, borderRadius:9, border:`1px solid ${C.border}`, background:C.inputBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Menu size={15} color={C.muted}/>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenuOpen && (
        <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", width:"92%", zIndex:190, background:C.cardBg, backdropFilter:"blur(24px)", borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 12px 40px rgba(0,0,0,.3)", padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
          {["Programs","Faculty","Campus","Research"].map(n=>(
            <a key={n} href="#" onClick={()=>setMobileMenuOpen(false)} style={{ color:C.muted, textDecoration:"none", fontSize:15, fontWeight:600, padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>{n}</a>
          ))}
          <button className="pbtn" onClick={()=>{ setActiveTab("apply"); setMobileMenuOpen(false); formRef.current?.scrollIntoView({behavior:"smooth"}); }} style={{ ...pbtn, justifyContent:"center", marginTop:4 }}>
            Apply Now <ArrowRight size={14}/>
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position:"relative", zIndex:1, padding:isMobile?"110px 16px 48px":"140px 24px 60px", textAlign:"center", maxWidth:820, margin:"0 auto" }}>
        <div className="fadeUp" style={{ display:"inline-flex", alignItems:"center", gap:8, background:d?"rgba(37,99,235,.12)":"rgba(37,99,235,.07)", border:"1px solid rgba(37,99,235,.27)", borderRadius:50, padding:"7px 16px", fontSize:isMobile?11:12, color:"#60A5FA", marginBottom:isMobile?20:28, backdropFilter:"blur(10px)", fontWeight:600 }}>
          <Sparkles size={12}/> Admissions Open — Fall 2026 · 25 Programs
        </div>
        <h1 className="fadeUp d1" style={{ fontSize:isMobile?"2rem":isMd?"3rem":"clamp(2.6rem,6.5vw,5.2rem)", fontWeight:900, lineHeight:1.06, letterSpacing:"-0.035em", marginBottom:isMobile?16:22 }}>
          Begin Your Academic<br/>
          <span style={{ background:"linear-gradient(130deg,#2563EB 0%,#60A5FA 50%,#A5B4FC 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Journey Today</span>
        </h1>
        <p className="fadeUp d2" style={{ fontSize:isMobile?14:17, color:C.muted, maxWidth:520, margin:`0 auto ${isMobile?24:36}px`, lineHeight:1.75 }}>
          Join 28,000+ students across 25 world-class programs. HEC Accredited. Internationally recognised.
        </p>
        <div className="fadeUp d3" style={{ display:"flex", gap:isMobile?24:48, justifyContent:"center", flexWrap:"wrap" }}>
          {[["25","Programs"],["28K+","Students"],["98%","Employment"],["#1","Ranked"]].map(([v,l])=>(
            <div key={l}>
              <div style={{ fontSize:isMobile?20:26, fontWeight:900, color:"#2563EB", letterSpacing:"-0.03em" }}>{v}</div>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div ref={formRef} style={{ position:"relative", zIndex:1, maxWidth:960, margin:"0 auto", padding:`0 ${isMobile?"12px":"24px"} 80px` }}>

        {/* Tab switcher */}
        <div style={{ display:"flex", gap:6, marginBottom:isMobile?20:28, background:C.cardBg, backdropFilter:"blur(20px)", borderRadius:14, padding:5, border:`1px solid ${C.border}`, width:"fit-content", flexWrap:"wrap" }}>
          {[["apply",GraduationCap,"Apply for Admission"],["payment",CreditCard,"Pay Admission Fee"]].map(([tab,Icon,label])=>(
            <button key={tab} className="tab-btn" onClick={()=>setActiveTab(tab)} style={{ padding:isMobile?"8px 12px":"9px 20px", borderRadius:10, fontSize:isMobile?12:13, fontWeight:600, display:"flex", alignItems:"center", gap:6, background:activeTab===tab?"linear-gradient(135deg,#2563EB,#1D4ED8)":"transparent", color:activeTab===tab?"#fff":C.muted, boxShadow:activeTab===tab?"0 4px 16px rgba(37,99,235,.3)":"none" }}>
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>

        {/* ══ PAYMENT TAB ══ */}
        {activeTab==="payment" && (
          <div className="sa-fwd" style={{ maxWidth:640 }}>
            <div style={{ background:C.cardBg, backdropFilter:"blur(32px)", borderRadius:24, border:`1px solid ${C.border}`, boxShadow:d?"0 24px 80px rgba(0,0,0,.4)":"0 24px 80px rgba(37,99,235,.08)", overflow:"hidden" }}>

              {/* Header */}
              <div style={{ padding:isMobile?"18px 16px 14px":"26px 32px 20px", borderBottom:`1px solid ${C.border}`, background:d?"rgba(37,99,235,.05)":"rgba(37,99,235,.025)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"rgba(37,99,235,.14)", border:"1px solid rgba(37,99,235,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <CreditCard size={20} color="#2563EB"/>
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:isMobile?17:20 }}>Pay Admission Fee</div>
                    <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>Submit your payment details to confirm your admission fee</div>
                  </div>
                </div>
              </div>

              <div style={{ padding:isMobile?"18px 16px":"28px 32px", display:"flex", flexDirection:"column", gap:18 }}>

                {/* Info banner */}
                <div style={{ padding:"13px 16px", borderRadius:13, background:d?"rgba(37,99,235,.08)":"rgba(37,99,235,.05)", border:"1px solid rgba(37,99,235,.2)", fontSize:13, color:C.muted, lineHeight:1.7 }}>
                  <strong style={{color:"#2563EB"}}>💡 How it works:</strong> After submitting your application, you received an Admission ID like{" "}
                  <code style={{ background:"rgba(37,99,235,.15)", padding:"1px 7px", borderRadius:5, color:"#60A5FA", fontFamily:"monospace", fontSize:13 }}>ADM-XXXX-1234</code>.
                  {" "}Enter it below along with your payment receipt details.
                </div>

                {/* ── ADMISSION ID (prominent) ── */}
                <div>
                  <label style={lbl}>Admission ID <span style={{color:"#EF4444"}}>*</span></label>
                  <div style={{ position:"relative" }}>
                    <Hash size={15} color={C.muted} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input
                      style={{ ...inp, paddingLeft:36, fontFamily:"monospace", fontSize:isMobile?14:16, letterSpacing:"0.05em", fontWeight:700 }}
                      placeholder="ADM-XXXX-0000"
                      value={paymentId}
                      onChange={e=>{ setPaymentId(e.target.value); setPaymentErrors(p=>({...p,paymentId:undefined})); setPaymentResult(null); }}
                    />
                  </div>
                  {paymentErrors.paymentId && <p style={errS}>{paymentErrors.paymentId}</p>}
                </div>

                {/* Divider */}
                <div style={{ height:1, background:C.border, margin:"2px 0" }}/>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>Payment Details</div>

                {/* ── PAYMENT TYPE dropdown ── */}
                <div>
                  <label style={lbl}>Payment Method <span style={{color:"#EF4444"}}>*</span></label>
                  <div style={{ position:"relative" }}>
                    <CreditCard size={15} color={C.muted} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <select
                      style={{ ...inp, paddingLeft:36, appearance:"none", WebkitAppearance:"none", cursor:"pointer" }}
                      value={paymentType}
                      onChange={e=>{ setPaymentType(e.target.value); setPaymentErrors(p=>({...p,paymentType:undefined})); }}
                    >
                      <option value="">— Select payment method —</option>
                      <option value="Bank Transfer">🏦 Bank Transfer</option>
                      <option value="EasyPaisa">📱 EasyPaisa</option>
                      <option value="JazzCash">💳 JazzCash</option>
                      <option value="Credit/Debit Card">💳 Credit / Debit Card</option>
                    </select>
                    <ChevronDown size={14} color={C.muted} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                  </div>
                  {paymentErrors.paymentType && <p style={errS}>{paymentErrors.paymentType}</p>}
                </div>

                {/* Payment method info chips — shown after selection */}
                {paymentType && (
                  <div style={{ padding:"12px 14px", borderRadius:12, background:d?"rgba(37,99,235,.07)":"rgba(37,99,235,.04)", border:`1px solid ${C.border}`, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                    {paymentType === "Bank Transfer" && <><strong style={{color:C.text}}>Bank:</strong> Royal University Bank · Account: <strong style={{color:"#2563EB", fontFamily:"monospace"}}>0123-456-789</strong> · IBAN: <strong style={{color:"#2563EB", fontFamily:"monospace"}}>PK00ROYA0000001234567890</strong></>}
                    {paymentType === "EasyPaisa" && <><strong style={{color:C.text}}>EasyPaisa Account:</strong> <strong style={{color:"#2563EB", fontFamily:"monospace"}}>0300-1234567</strong> · Name: Royal University Admissions</>}
                    {paymentType === "JazzCash" && <><strong style={{color:C.text}}>JazzCash Account:</strong> <strong style={{color:"#2563EB", fontFamily:"monospace"}}>0311-9876543</strong> · Name: Royal University Admissions</>}
                    {paymentType === "Credit/Debit Card" && <><strong style={{color:C.text}}>Card payments</strong> are processed via the Admissions Office portal. Contact <strong style={{color:"#2563EB"}}>finance@royaluniversity.edu.pk</strong> for assistance.</>}
                  </div>
                )}

                {/* ── Two-column: Transaction ID + Amount ── */}
                <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>Transaction / Reference ID <span style={{color:"#EF4444"}}>*</span></label>
                    <div style={{ position:"relative" }}>
                      <FileText size={15} color={C.muted} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                      <input
                        style={{ ...inp, paddingLeft:36 }}
                        placeholder="Paste receipt / ref number"
                        value={transactionId}
                        onChange={e=>{ setTransactionId(e.target.value); setPaymentErrors(p=>({...p,transactionId:undefined})); }}
                      />
                    </div>
                    {paymentErrors.transactionId && <p style={errS}>{paymentErrors.transactionId}</p>}
                  </div>
                  <div>
                    <label style={lbl}>Amount Paid (PKR) <span style={{color:"#EF4444"}}>*</span></label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:C.muted, pointerEvents:"none" }}>₨</span>
                      <input
                        style={{ ...inp, paddingLeft:30 }}
                        type="number"
                        min="1"
                        placeholder="e.g. 25000"
                        value={amountPaid}
                        onChange={e=>{ setAmountPaid(e.target.value); setPaymentErrors(p=>({...p,amountPaid:undefined})); }}
                      />
                    </div>
                    {paymentErrors.amountPaid && <p style={errS}>{paymentErrors.amountPaid}</p>}
                  </div>
                </div>

                {/* ── Upload payment proof ── */}
                <div>
                  <label style={lbl}>Upload Payment Screenshot / Proof</label>
                  <label style={{ display:"flex", alignItems:"center", gap:14, padding:isMobile?"12px 14px":"14px 18px", borderRadius:13, border:`2px dashed ${paymentProofFile?"#2563EB":C.inputBorder}`, background:paymentProofFile?(d?"rgba(37,99,235,.08)":"rgba(37,99,235,.04)"):C.inputBg, cursor:"pointer", transition:"all .2s" }}>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display:"none" }}
                      onChange={e=>{ const f=e.target.files; if(f&&f.length>0) setPaymentProofFile(f[0]); }}
                    />
                    <div style={{ width:40, height:40, borderRadius:11, background:paymentProofFile?"rgba(37,99,235,.2)":C.inputBg, border:`1px solid ${paymentProofFile?"rgba(37,99,235,.35)":C.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
                      {paymentProofFile ? <Check size={18} color="#2563EB"/> : <Upload size={18} color={C.muted}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:14, color:paymentProofFile?C.text:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {paymentProofFile ? paymentProofFile.name : "Click to upload screenshot or PDF receipt"}
                      </div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>JPG, PNG, PDF — max 5 MB · Stored securely in admission-docs bucket</div>
                    </div>
                    {paymentProofFile && (
                      <button
                        onClick={e=>{ e.preventDefault(); setPaymentProofFile(null); }}
                        style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4, display:"flex", flexShrink:0 }}
                      >
                        <X size={16}/>
                      </button>
                    )}
                  </label>
                </div>

                {/* ── Summary preview (when all filled) ── */}
                {paymentId && paymentType && transactionId && amountPaid && (
                  <div style={{ padding:"14px 16px", borderRadius:13, background:d?"rgba(16,185,129,.06)":"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.2)" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#10B981", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>📋 Submission Preview</div>
                    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:10 }}>
                      {[
                        ["Admission ID", paymentId.toUpperCase()],
                        ["Method",       paymentType],
                        ["Ref / TXN",    transactionId],
                        ["Amount",       `PKR ${Number(amountPaid).toLocaleString()}`],
                      ].map(([k,v])=>(
                        <div key={k} style={{ padding:"8px 10px", borderRadius:9, background:C.inputBg, border:`1px solid ${C.inputBorder}` }}>
                          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{k}</div>
                          <div style={{ fontWeight:700, fontSize:12, color:C.text, marginTop:3, wordBreak:"break-all" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Submit button ── */}
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="pbtn"
                  style={{ ...pbtn, justifyContent:"center", padding:"13px 28px", fontSize:15, opacity:paymentLoading?.7:1 }}
                >
                  {paymentLoading
                    ? <><div style={{width:17,height:17,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Verifying &amp; Submitting…</>
                    : <><CheckCircle size={17}/> Confirm Payment Submission</>
                  }
                </button>

                {/* Result banner */}
                {paymentResult && (
                  <div style={{ padding:"15px 16px", borderRadius:13, background:paymentResult.success?(d?"rgba(16,185,129,.1)":"rgba(16,185,129,.07)"):(d?"rgba(239,68,68,.1)":"rgba(239,68,68,.07)"), border:`1px solid ${paymentResult.success?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`, display:"flex", alignItems:"flex-start", gap:12 }}>
                    {paymentResult.success
                      ? <CheckCircle size={20} color="#10B981" style={{flexShrink:0,marginTop:1}}/>
                      : <AlertCircle size={20} color="#EF4444" style={{flexShrink:0,marginTop:1}}/>
                    }
                    <div>
                      <div style={{ fontWeight:800, color:paymentResult.success?"#10B981":"#EF4444", marginBottom:6, fontSize:15 }}>
                        {paymentResult.success ? "✅ Payment Confirmed!" : "❌ Submission Failed"}
                      </div>
                      <div style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>{paymentResult.message}</div>
                      {paymentResult.success && paymentResult.data && (
                        <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:8 }}>
                          {[
                            ["Student",   `${paymentResult.data.first_name} ${paymentResult.data.last_name}`],
                            ["Program",   paymentResult.data.program_title],
                            ["Method",    paymentResult.data.payment_type || paymentType],
                            ["TXN Ref",   paymentResult.data.transaction_id || transactionId],
                            ["Amount",    paymentResult.data.amount_paid ? `PKR ${Number(paymentResult.data.amount_paid).toLocaleString()}` : `PKR ${Number(amountPaid).toLocaleString()}`],
                            ["Proof",     paymentResult.data.payment_proof_url ? "Uploaded ✓" : paymentProofFile ? "Uploaded ✓" : "Not uploaded"],
                            ["Status",    "Paid ✓"],
                            ["Paid At",   paymentResult.data.paid_at ? new Date(paymentResult.data.paid_at).toLocaleString() : "—"],
                          ].map(([k,v])=>(
                            <div key={k} style={{ padding:"7px 12px", borderRadius:9, background:C.inputBg, border:`1px solid ${C.inputBorder}` }}>
                              <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{k}</div>
                              <div style={{ fontSize:12, fontWeight:600, color:C.text, marginTop:2, wordBreak:"break-all" }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ══ APPLICATION FORM ══ */}
        {activeTab==="apply" && !submitted && (
          <div>
            {/* Step progress */}
            <div style={{ marginBottom:isMobile?20:32, overflowX:"auto", paddingBottom:4 }}>
              <div style={{ display:"flex", alignItems:"flex-start", minWidth:isMobile?420:0 }}>
                {STEPS.map((s,i)=>(
                  <div key={s} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"none" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <div
                        onClick={()=>{if(i<step){setAnimDir(-1);setErrors({});setStep(i);}}}
                        style={{ width:isMobile?30:38, height:isMobile?30:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:i<step?"linear-gradient(135deg,#2563EB,#1D4ED8)":i===step?"linear-gradient(135deg,#2563EB,#60A5FA)":C.inputBg, border:`2px solid ${i<=step?"#2563EB":C.inputBorder}`, color:i<=step?"#fff":C.muted, fontSize:isMobile?11:13, fontWeight:700, cursor:i<step?"pointer":"default", boxShadow:i===step?"0 0 0 4px rgba(37,99,235,.18),0 4px 14px rgba(37,99,235,.32)":"none", transition:"all .3s" }}
                      >
                        {i<step?<Check size={isMobile?12:15} strokeWidth={3}/>:i+1}
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color:i<=step?"#2563EB":C.muted, whiteSpace:"nowrap", letterSpacing:"0.04em", textTransform:"uppercase" }}>{s}</span>
                    </div>
                    {i<STEPS.length-1&&<div style={{ flex:1, height:2, marginBottom:20, marginLeft:3, marginRight:3, background:i<step?"#2563EB":C.inputBorder, borderRadius:2, transition:"background .4s" }}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Form card */}
            <div style={{ background:C.cardBg, backdropFilter:"blur(32px)", borderRadius:isMobile?20:26, border:`1px solid ${C.border}`, boxShadow:d?"0 32px 90px rgba(0,0,0,.42)":"0 32px 90px rgba(37,99,235,.09)", overflow:"hidden", marginBottom:20 }}>
              {/* Header */}
              <div style={{ padding:headerPad, borderBottom:`1px solid ${C.border}`, background:d?"rgba(37,99,235,.05)":"rgba(37,99,235,.025)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:isMobile?38:44, height:isMobile?38:44, borderRadius:12, background:"rgba(37,99,235,.13)", border:"1px solid rgba(37,99,235,.24)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {(()=>{ const Icon=STEP_ICONS[step]; return <Icon size={isMobile?17:20} color="#2563EB"/>; })()}
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:isMobile?16:19, letterSpacing:"-0.02em" }}>{STEP_TITLES[step]}</div>
                    <div style={{ fontSize:isMobile?12:13, color:C.muted, marginTop:2 }}>{STEP_SUBS[step]}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div key={step} className={stepAnim} style={{ padding:cardPad }}>

                {/* STEP 0 — Program Grid */}
                {step===0 && (
                  <div>
                    <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                      <div style={{ position:"relative", flex:1, minWidth:isMobile?"100%":200 }}>
                        <Search size={14} color={C.muted} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
                        <input style={{ ...inp, paddingLeft:34 }} placeholder="Search programs…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                      </div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {["ALL","BS","MS","MBA"].map(l=>(
                          <button key={l} onClick={()=>setLevelFilter(l)} style={{ padding:"9px 14px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${levelFilter===l?"#2563EB":C.inputBorder}`, background:levelFilter===l?"rgba(37,99,235,.14)":C.inputBg, color:levelFilter===l?"#2563EB":C.muted, transition:"all .18s", fontFamily:"inherit" }}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ maxHeight:isMobile?380:470, overflowY:"auto", paddingRight:3 }}>
                      <div style={{ display:"grid", gridTemplateColumns:progCols, gap:10 }}>
                        {filteredPrograms.map(p=>{
                          const Icon=p.icon;
                          const sel=form.program===p.id;
                          return (
                            <div key={p.id} className="card-h prog-card" onClick={()=>setField("program",p.id)} style={{ "--pc":p.color, borderRadius:16, padding:isMobile?"13px 14px":"17px 15px", cursor:"pointer", background:sel?`color-mix(in srgb,${p.color} 11%,transparent)`:C.inputBg, border:`2px solid ${sel?p.color:C.inputBorder}`, boxShadow:sel?`0 8px 28px color-mix(in srgb,${p.color} 28%,transparent)`:"none", transition:"all .22s", position:"relative", display:isMobile?"flex":undefined, alignItems:isMobile?"center":undefined, gap:isMobile?12:undefined }}>
                              {sel&&<div style={{ position:"absolute", top:9, right:9, width:18, height:18, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={10} color="#fff" strokeWidth={3}/></div>}
                              <div style={{ width:36, height:36, borderRadius:10, background:`color-mix(in srgb,${p.color} 18%,transparent)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:isMobile?0:10, border:`1px solid color-mix(in srgb,${p.color} 25%,transparent)` }}>
                                <Icon size={18} color={p.color}/>
                              </div>
                              <div style={{ flex:isMobile?1:undefined }}>
                                <div style={{ fontWeight:700, fontSize:isMobile?14:13, lineHeight:1.3, marginBottom:isMobile?2:6 }}>{p.title}</div>
                                {!isMobile&&<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:50, background:`color-mix(in srgb,${p.color} 15%,transparent)`, color:p.color, fontWeight:700 }}>{p.level}</span>
                                  <span style={{ fontSize:10, color:C.muted }}>{p.dept}</span>
                                </div>}
                                {isMobile&&<div style={{ fontSize:12, color:C.muted }}>{p.dept} · {p.level}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {filteredPrograms.length===0&&(
                        <div style={{ textAlign:"center", padding:48, color:C.muted }}>
                          <Search size={28} style={{ marginBottom:10, opacity:.35 }}/><div style={{ fontWeight:600 }}>No programs match.</div>
                        </div>
                      )}
                    </div>
                    {errors.program&&<p style={{ ...errS, marginTop:12 }}>{errors.program}</p>}
                  </div>
                )}

                {/* STEP 1 — Personal */}
                {step===1 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <div style={{ display:"grid", gridTemplateColumns:formGrid2, gap:13 }}>
                      <div><label style={lbl}>First Name *</label><input style={inp} placeholder="Muhammad" value={form.firstName} onChange={e=>setField("firstName",e.target.value)}/>{errors.firstName&&<p style={errS}>{errors.firstName}</p>}</div>
                      <div><label style={lbl}>Last Name *</label><input style={inp} placeholder="Ahmed" value={form.lastName} onChange={e=>setField("lastName",e.target.value)}/>{errors.lastName&&<p style={errS}>{errors.lastName}</p>}</div>
                    </div>
                    <div><label style={lbl}>Father's Name *</label><input style={inp} placeholder="Father's full name" value={form.fatherName} onChange={e=>setField("fatherName",e.target.value)}/>{errors.fatherName&&<p style={errS}>{errors.fatherName}</p>}</div>
                    <div style={{ display:"grid", gridTemplateColumns:formGrid2, gap:13 }}>
                      <div><label style={lbl}>Email Address *</label><input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setField("email",e.target.value)}/>{errors.email&&<p style={errS}>{errors.email}</p>}</div>
                      <div><label style={lbl}>Phone Number *</label><input style={inp} placeholder="03xx-xxxxxxx" value={form.phone} onChange={e=>setField("phone",e.target.value)}/>{errors.phone&&<p style={errS}>{errors.phone}</p>}</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:formGrid3, gap:13 }}>
                      <div><label style={lbl}>Date of Birth *</label><input style={inp} type="date" value={form.dob} onChange={e=>setField("dob",e.target.value)}/>{errors.dob&&<p style={errS}>{errors.dob}</p>}</div>
                      <div><label style={lbl}>Gender *</label>
                        <select style={inp} value={form.gender} onChange={e=>setField("gender",e.target.value)}>
                          <option value="">Select…</option><option>Male</option><option>Female</option><option>Other</option>
                        </select>{errors.gender&&<p style={errS}>{errors.gender}</p>}
                      </div>
                      <div><label style={lbl}>Nationality</label><input style={inp} placeholder="Pakistani" value={form.nationality} onChange={e=>setField("nationality",e.target.value)}/></div>
                    </div>
                    <div><label style={lbl}>CNIC / B-Form *</label><input style={inp} placeholder="xxxxx-xxxxxxx-x" value={form.cnic} onChange={e=>setField("cnic",e.target.value)}/>{errors.cnic&&<p style={errS}>{errors.cnic}</p>}</div>
                    <div><label style={lbl}>Residential Address</label><textarea style={{ ...inp, height:76, resize:"vertical" }} placeholder="House No, Street, City, Province" value={form.address} onChange={e=>setField("address",e.target.value)}/></div>
                  </div>
                )}

                {/* STEP 2 — Academics */}
                {step===2 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    {[
                      { label:"SSC / Matric Examination",       dot:"#2563EB", mk:"sscMarks",  mt:"sscTotal",  mb:"sscBoard",  my:"sscYear",  pct:sscPct,  ek:{m:"sscMarks",t:"sscTotal",b:"sscBoard",y:"sscYear"}},
                      { label:"HSSC / Intermediate Examination", dot:"#7C3AED", mk:"hsscMarks", mt:"hsscTotal", mb:"hsscBoard", my:"hsscYear", pct:hsscPct, ek:{m:"hsscMarks",t:"hsscTotal",b:"hsscBoard",y:"hsscYear"}},
                    ].map(({label,dot,mk,mt,mb,my,pct,ek})=>(
                      <div key={label} style={{ padding:isMobile?"16px":"20px 22px", borderRadius:16, border:`1px solid ${C.inputBorder}`, background:C.inputBg }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0 }}/>{label}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:formGrid4, gap:11 }}>
                          <div><label style={lbl}>Marks Obtained *</label><input style={inp} type="number" placeholder="850" value={form[mk]} onChange={e=>setField(mk,e.target.value)}/>{errors[ek.m]&&<p style={errS}>{errors[ek.m]}</p>}</div>
                          <div><label style={lbl}>Total Marks *</label><input style={inp} type="number" placeholder="1100" value={form[mt]} onChange={e=>setField(mt,e.target.value)}/>{errors[ek.t]&&<p style={errS}>{errors[ek.t]}</p>}</div>
                          <div><label style={lbl}>Board *</label><input style={inp} placeholder="e.g. FBISE" value={form[mb]} onChange={e=>setField(mb,e.target.value)}/>{errors[ek.b]&&<p style={errS}>{errors[ek.b]}</p>}</div>
                          <div><label style={lbl}>Year *</label><input style={inp} type="number" placeholder="2023" value={form[my]} onChange={e=>setField(my,e.target.value)}/>{errors[ek.y]&&<p style={errS}>{errors[ek.y]}</p>}</div>
                        </div>
                        {pct&&(
                          <div style={{ marginTop:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12 }}>
                              <span style={{ color:C.muted, fontWeight:600 }}>Percentage</span>
                              <span style={{ color:+pct>=70?"#10B981":+pct>=50?"#F59E0B":"#EF4444", fontWeight:700 }}>{pct}%</span>
                            </div>
                            <div style={{ height:5, borderRadius:99, background:C.border, overflow:"hidden" }}>
                              <div style={{ height:"100%", borderRadius:99, width:`${Math.min(+pct,100)}%`, background:+pct>=70?"linear-gradient(90deg,#10B981,#059669)":+pct>=50?"linear-gradient(90deg,#F59E0B,#D97706)":"linear-gradient(90deg,#EF4444,#DC2626)", transition:"width .6s" }}/>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {selProg&&(selProg.level==="MS"||selProg.level==="MBA")&&(
                      <div style={{ padding:isMobile?"16px":"20px 22px", borderRadius:16, border:`1px solid ${C.inputBorder}`, background:C.inputBg }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:"#059669", flexShrink:0 }}/>Bachelor's Degree (required for {selProg.level})
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:formGrid3, gap:11 }}>
                          <div><label style={lbl}>Degree Title</label><input style={inp} placeholder="e.g. BS CS" value={form.prevDegree} onChange={e=>setField("prevDegree",e.target.value)}/></div>
                          <div><label style={lbl}>CGPA (/ 4.0)</label><input style={inp} type="number" step="0.01" min="0" max="4" placeholder="3.5" value={form.prevCgpa} onChange={e=>setField("prevCgpa",e.target.value)}/></div>
                          <div><label style={lbl}>Institution</label><input style={inp} placeholder="University name" value={form.prevInstitution} onChange={e=>setField("prevInstitution",e.target.value)}/></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3 — Documents */}
                {step===3 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                    {[
                      { key:"transcript", label:"Academic Transcript / Mark Sheet", hint:"PDF, JPG, PNG — max 5 MB" },
                      { key:"cnic",       label:"CNIC / B-Form (Front & Back)",    hint:"JPG, PNG, PDF — max 5 MB" },
                      { key:"photo",      label:"Recent Passport-size Photo",       hint:"JPG, PNG — max 2 MB" },
                    ].map(({key,label,hint})=>(
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <label style={{ display:"flex", alignItems:"center", gap:12, padding:isMobile?"12px 14px":"15px 18px", borderRadius:13, border:`2px dashed ${files[key]?"#2563EB":C.inputBorder}`, background:files[key]?(d?"rgba(37,99,235,.08)":"rgba(37,99,235,.04)"):C.inputBg, cursor:"pointer", transition:"all .2s" }}>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>{const f=e.target.files;if(f&&f.length>0)setFile(key,f[0]);}}/>
                          <div style={{ width:38, height:38, borderRadius:10, background:files[key]?"rgba(37,99,235,.2)":C.inputBg, border:`1px solid ${files[key]?"rgba(37,99,235,.35)":C.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {files[key]?<Check size={17} color="#2563EB"/>:<Upload size={17} color={C.muted}/>}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:isMobile?13:14, color:files[key]?C.text:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{files[key]?files[key].name:"Click to upload"}</div>
                            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{hint}</div>
                          </div>
                          {files[key]&&<button onClick={e=>{e.preventDefault();setFile(key,null);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4, display:"flex" }}><X size={15}/></button>}
                        </label>
                      </div>
                    ))}
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <label style={lbl}>Personal Statement *</label>
                        <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>{form.essay.length}/2000</span>
                      </div>
                      <textarea style={{ ...inp, height:isMobile?120:148, resize:"vertical" }} placeholder="Describe your academic goals, motivations, and why you wish to join this program…" maxLength={2000} value={form.essay} onChange={e=>setField("essay",e.target.value)}/>
                      {errors.essay&&<p style={errS}>{errors.essay}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Create Application Password *</label>
                      <div style={{ position:"relative" }}>
                        <input style={inp} type={showPass?"text":"password"} placeholder="Minimum 8 characters" value={form.password} onChange={e=>setField("password",e.target.value)}/>
                        <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}>
                          {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                        </button>
                      </div>
                      {errors.password&&<p style={errS}>{errors.password}</p>}
                      {form.password&&(
                        <div style={{ display:"flex", gap:4, marginTop:7 }}>
                          {[form.password.length>=8,/[A-Z]/.test(form.password),/[0-9]/.test(form.password),/[^A-Za-z0-9]/.test(form.password)].map((ok,i)=>(
                            <div key={i} style={{ flex:1, height:3, borderRadius:99, background:ok?["#2563EB","#10B981","#F59E0B","#8B5CF6"][i]:C.inputBorder, transition:"background .3s" }}/>
                          ))}
                        </div>
                      )}
                    </div>
                    <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", padding:isMobile?"13px":"15px 18px", borderRadius:13, background:C.inputBg, border:`1px solid ${errors.terms?"#EF4444":C.inputBorder}` }}>
                      <div onClick={()=>setField("terms",!form.terms)} style={{ width:21, height:21, borderRadius:6, border:`2px solid ${form.terms?"#2563EB":C.inputBorder}`, background:form.terms?"#2563EB":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all .2s" }}>
                        {form.terms&&<Check size={12} color="#fff" strokeWidth={3}/>}
                      </div>
                      <span style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>
                        I certify all information is accurate. I agree to Royal University's{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Terms</span>,{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Privacy Policy</span>, and{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Code of Conduct</span>.
                      </span>
                    </label>
                    {errors.terms&&<p style={errS}>{errors.terms}</p>}
                  </div>
                )}

                {/* STEP 4 — Review */}
                {step===4 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {selProg&&(()=>{const Icon=selProg.icon;return(
                      <div style={{ padding:isMobile?"16px":"22px", borderRadius:16, background:`color-mix(in srgb,${selProg.color} 10%,transparent)`, border:`1px solid color-mix(in srgb,${selProg.color} 25%,transparent)`, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:`color-mix(in srgb,${selProg.color} 18%,transparent)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Icon size={24} color={selProg.color}/>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:17, fontWeight:800 }}>{selProg.title}</div>
                          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>Level: {selProg.level} · Dept: {selProg.dept}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Status</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#F59E0B", marginTop:2 }}>⏳ Pending</div>
                        </div>
                      </div>
                    );})()}
                    <div style={{ display:"grid", gridTemplateColumns:reviewCols, gap:10 }}>
                      {[["Full Name",`${form.firstName} ${form.lastName}`],["Father's Name",form.fatherName],["Email",form.email],["Phone",form.phone],["Date of Birth",form.dob],["Gender",form.gender],["CNIC",form.cnic||"—"],["Nationality",form.nationality],["SSC Marks",form.sscMarks&&form.sscTotal?`${form.sscMarks}/${form.sscTotal} (${sscPct}%)`:"—"],["SSC Board/Year",form.sscBoard&&form.sscYear?`${form.sscBoard}, ${form.sscYear}`:"—"],["HSSC Marks",form.hsscMarks&&form.hsscTotal?`${form.hsscMarks}/${form.hsscTotal} (${hsscPct}%)`:"—"],["HSSC Board/Year",form.hsscBoard&&form.hsscYear?`${form.hsscBoard}, ${form.hsscYear}`:"—"]].map(([k,v])=>(
                        <div key={k} style={{ padding:"12px 14px", borderRadius:12, background:C.inputBg, border:`1px solid ${C.inputBorder}` }}>
                          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{k}</div>
                          <div style={{ fontWeight:600, fontSize:13, wordBreak:"break-word" }}>{v||"—"}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding:"14px 16px", borderRadius:13, background:d?"rgba(37,99,235,.08)":"rgba(37,99,235,.05)", border:"1px solid rgba(37,99,235,.2)", display:"flex", gap:11, alignItems:"flex-start" }}>
                      <Shield size={16} color="#2563EB" style={{ flexShrink:0, marginTop:1 }}/>
                      <span style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>All data encrypted. Admission ID generated on submission — required for fee payment.</span>
                    </div>
                  </div>
                )}

                {/* STEP 5 — Submit */}
                {step===5 && (
                  <div style={{ textAlign:"center", padding:isMobile?"16px 0":"20px 0" }}>
                    <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,rgba(37,99,235,.14),rgba(37,99,235,.07))", border:"2px solid rgba(37,99,235,.28)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", boxShadow:"0 0 0 11px rgba(37,99,235,.06)" }}>
                      <Sparkles size={32} color="#2563EB"/>
                    </div>
                    <h3 style={{ fontSize:isMobile?19:22, fontWeight:800, marginBottom:12 }}>Ready to Submit!</h3>
                    <p style={{ fontSize:isMobile?13:15, color:C.muted, lineHeight:1.7, maxWidth:460, margin:`0 auto ${isMobile?20:28}px` }}>
                      Click <strong style={{color:C.text}}>Submit Application</strong> to send your application. You'll receive a unique <strong style={{color:"#2563EB"}}>Admission ID</strong> — save it for fee payment and tracking.
                    </p>
                    {submitError&&(
                      <div style={{ padding:"13px 16px", borderRadius:13, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#EF4444", fontSize:13, fontWeight:600, marginBottom:18, display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                        <AlertCircle size={15} style={{flexShrink:0}}/>{submitError}
                      </div>
                    )}
                    <button onClick={handleSubmit} disabled={submitting} className="pbtn" style={{ ...pbtn, padding:"13px 40px", fontSize:15, opacity:submitting?.75:1, minWidth:200, justifyContent:"center", margin:"0 auto" }}>
                      {submitting?<><div style={{width:17,height:17,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Submitting…</>:<><Sparkles size={17}/> Submit Application</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div style={{ padding:isMobile?"14px 18px 20px":"18px 34px 26px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, color:C.muted }}>Step {step+1}/{STEPS.length}</div>
                <div style={{ display:"flex", gap:9 }}>
                  {step>0&&<button onClick={goPrev} className="gbtn" style={gbtn}><ChevronLeft size={14}/> Back</button>}
                  {step<STEPS.length-1&&<button onClick={goNext} className="pbtn" style={pbtn}>Continue <ChevronRight size={14}/></button>}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display:"flex", gap:isMobile?16:28, justifyContent:"center", flexWrap:"wrap", padding:"6px 0 12px" }}>
              {[[Shield,"256-bit SSL"],[Clock,"5-Min Apply"],[Users,"28K+ Alumni"],[Award,"HEC Accredited"]].map(([Icon,text])=>(
                <div key={text} style={{ display:"flex", alignItems:"center", gap:6, color:C.muted, fontSize:12, fontWeight:500 }}>
                  <Icon size={12} color="#2563EB"/> {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SUCCESS STATE ══ */}
        {activeTab==="apply"&&submitted&&(
          <div className="sa-fwd" style={{ maxWidth:680 }}>
            <div style={{ background:C.cardBg, backdropFilter:"blur(32px)", borderRadius:isMobile?20:26, border:`1px solid ${C.border}`, boxShadow:d?"0 32px 80px rgba(0,0,0,.4)":"0 32px 80px rgba(37,99,235,.09)", overflow:"hidden" }}>
              <div style={{ padding:isMobile?"32px 20px 0":"42px 40px 0", textAlign:"center" }}>
                <div style={{ animation:"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both", width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#10B981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", boxShadow:"0 0 0 14px rgba(16,185,129,.1),0 8px 32px rgba(16,185,129,.35)" }}>
                  <Check size={36} color="#fff" strokeWidth={2.5}/>
                </div>
                <h2 style={{ fontSize:isMobile?22:28, fontWeight:900, marginBottom:12, letterSpacing:"-0.03em" }}>Application Submitted!</h2>
                <p style={{ fontSize:isMobile?13:15, color:C.muted, lineHeight:1.7, maxWidth:480, margin:"0 auto" }}>
                  Congratulations, <strong style={{color:C.text}}>{form.firstName} {form.lastName}</strong>! Your application for <strong style={{color:"#2563EB"}}>{selProg?.title}</strong> has been received.
                </p>
              </div>
              {/* Admission ID */}
              <div style={{ margin:isMobile?"20px 16px":"28px 40px", padding:isMobile?"18px":"22px 24px", borderRadius:16, background:d?"rgba(37,99,235,.1)":"rgba(37,99,235,.06)", border:"1px solid rgba(37,99,235,.28)", textAlign:"center" }}>
                <div style={{ fontSize:12, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Your Unique Admission ID</div>
                <div style={{ fontSize:isMobile?24:30, fontWeight:900, fontFamily:"monospace", color:"#2563EB", letterSpacing:"0.07em", marginBottom:10 }}>{generatedId}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>⚠️ <strong style={{color:C.text}}>Save this ID.</strong> Required for fee payment and tracking.</div>
              </div>
              <div style={{ padding:isMobile?"0 16px 24px":"0 40px 32px", display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:10 }}>
                {[["Status","Under Review","#F59E0B"],["Payment","Pending","#EF4444"],["Decision","Mar 15, 2026","#2563EB"],["Email","Sent ✓","#10B981"],["Program",selProg?.level,C.text],["Dept",selProg?.dept,C.text]].map(([k,v,color])=>(
                  <div key={k} style={{ padding:"12px 14px", borderRadius:13, background:C.inputBg, border:`1px solid ${C.inputBorder}` }}>
                    <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{k}</div>
                    <div style={{ fontWeight:700, fontSize:13, color:color||C.text, wordBreak:"break-word" }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:isMobile?"14px 16px 24px":"20px 40px 34px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
                <button onClick={()=>{setActiveTab("payment");setPaymentId(generatedId);}} className="pbtn" style={pbtn}><CreditCard size={15}/> Pay Fee Now</button>
                <button onClick={resetApp} className="gbtn" style={gbtn}><RefreshCw size={14}/> New Application</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden admin link in footer */}
      <div style={{ textAlign:"center", paddingBottom:24, color:C.muted, fontSize:11 }}>
        <button onClick={()=>setShowAdminLogin(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:11, fontFamily:"inherit", opacity:.4 }}>
          Staff Login
        </button>
      </div>
    </div>
  );
}
