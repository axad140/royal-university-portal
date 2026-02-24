"use client";
import { useState, useEffect, useRef } from "react";
import {
  GraduationCap, ChevronRight, ChevronLeft, Sun, Moon, Check,
  User, Mail, Phone, BookOpen, Award, Upload, Eye, EyeOff,
  Globe, Microscope, Cpu, Palette, Scale, Heart, Building,
  Star, ArrowRight, Sparkles, Shield, Clock, Users, Search,
  CreditCard, CheckCircle, AlertCircle, X, RefreshCw, FileText,
  Hash, Calendar, Layers, Brain, Lock, Database, Zap, TrendingUp,
  FlaskConical, Calculator, Languages, Activity, Code2
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  SUPABASE CONFIG — Replace with your actual credentials
//  Required table: admissions
//  Required columns: admission_id, first_name, last_name,
//    father_name, email, phone, dob, gender, nationality,
//    cnic, address, program_id, program_title, ssc_marks,
//    ssc_total, ssc_board, ssc_year, hssc_marks, hssc_total,
//    hssc_board, hssc_year, prev_degree, prev_cgpa,
//    prev_institution, essay, transcript_url, cnic_url,
//    photo_url, payment_status, status, submitted_at, paid_at
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL = "https://uwdwuqvtrpsvpfjcqben.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dPwyiUWp9Sc58mo1M-deAg_rI3pWVj1";
const STORAGE_BUCKET = "admission-docs";

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

async function updatePaymentStatus(admissionId) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admissions?admission_id=eq.${encodeURIComponent(admissionId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "return=representation" },
        body: JSON.stringify({ payment_status: "Paid", paid_at: new Date().toISOString() }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    if (!Array.isArray(json) || json.length === 0) throw new Error("not_found");
    return { success: true, data: json[0] };
  } catch (e) { return { success: false, error: String(e) }; }
}

// ═══════════════════════════════════════════════════════════
//  25 PROGRAMS
// ═══════════════════════════════════════════════════════════
const PROGRAMS = [
  { id: "bs-cs",   title: "BS Computer Science",        icon: Cpu,          level: "BS",  dept: "Computing",    color: "#2563EB" },
  { id: "bs-ai",   title: "BS Artificial Intelligence", icon: Brain,        level: "BS",  dept: "Computing",    color: "#7C3AED" },
  { id: "bs-se",   title: "BS Software Engineering",    icon: Code2,        level: "BS",  dept: "Computing",    color: "#0891B2" },
  { id: "bs-ds",   title: "BS Data Science",            icon: Database,     level: "BS",  dept: "Computing",    color: "#059669" },
  { id: "bs-cy",   title: "BS Cyber Security",          icon: Shield,       level: "BS",  dept: "Computing",    color: "#DC2626" },
  { id: "bs-it",   title: "BS Information Technology",  icon: Layers,       level: "BS",  dept: "Computing",    color: "#D97706" },
  { id: "bs-ee",   title: "BS Electrical Engineering",  icon: Zap,          level: "BS",  dept: "Engineering",  color: "#EA580C" },
  { id: "bs-me",   title: "BS Mechanical Engineering",  icon: Activity,     level: "BS",  dept: "Engineering",  color: "#65A30D" },
  { id: "bs-civ",  title: "BS Civil Engineering",       icon: Building,     level: "BS",  dept: "Engineering",  color: "#78716C" },
  { id: "bs-ba",   title: "BS Business Administration", icon: TrendingUp,   level: "BS",  dept: "Business",     color: "#2563EB" },
  { id: "bs-af",   title: "BS Accounting & Finance",    icon: Calculator,   level: "BS",  dept: "Business",     color: "#16A34A" },
  { id: "bs-psy",  title: "BS Psychology",              icon: Heart,        level: "BS",  dept: "Social Sci.",  color: "#DB2777" },
  { id: "bs-phy",  title: "BS Physics",                 icon: FlaskConical, level: "BS",  dept: "Sciences",     color: "#9333EA" },
  { id: "bs-math", title: "BS Mathematics",             icon: Hash,         level: "BS",  dept: "Sciences",     color: "#0284C7" },
  { id: "bs-bio",  title: "BS Biotechnology",           icon: Microscope,   level: "BS",  dept: "Sciences",     color: "#10B981" },
  { id: "bs-eng",  title: "BS English",                 icon: Languages,    level: "BS",  dept: "Arts",         color: "#F59E0B" },
  { id: "ms-cs",   title: "MS Computer Science",        icon: Cpu,          level: "MS",  dept: "Computing",    color: "#3B82F6" },
  { id: "ms-ds",   title: "MS Data Science",            icon: Database,     level: "MS",  dept: "Computing",    color: "#8B5CF6" },
  { id: "ms-ai",   title: "MS Artificial Intelligence", icon: Brain,        level: "MS",  dept: "Computing",    color: "#4F46E5" },
  { id: "ms-cy",   title: "MS Cyber Security",          icon: Lock,         level: "MS",  dept: "Computing",    color: "#EF4444" },
  { id: "ms-se",   title: "MS Software Engineering",    icon: Code2,        level: "MS",  dept: "Computing",    color: "#06B6D4" },
  { id: "ms-pm",   title: "MS Project Management",      icon: Layers,       level: "MS",  dept: "Business",     color: "#F97316" },
  { id: "ms-ee",   title: "MS Electrical Engineering",  icon: Zap,          level: "MS",  dept: "Engineering",  color: "#FBBF24" },
  { id: "mba",     title: "MBA (Executive)",            icon: Building,     level: "MBA", dept: "Business",     color: "#059669" },
  { id: "ms-cp",   title: "MS Clinical Psychology",     icon: Heart,        level: "MS",  dept: "Health Sci.",  color: "#E11D48" },
];

const STEPS = ["Program", "Personal", "Academics", "Documents", "Review", "Submit"];

const EMPTY_FORM = {
  firstName: "", lastName: "", fatherName: "", email: "", phone: "",
  dob: "", gender: "", nationality: "Pakistani", cnic: "", address: "",
  program: "",
  sscMarks: "", sscTotal: "", sscBoard: "", sscYear: "",
  hsscMarks: "", hsscTotal: "", hsscBoard: "", hsscYear: "",
  prevDegree: "", prevCgpa: "", prevInstitution: "",
  essay: "", password: "", terms: false,
};

const EMPTY_FILES = { transcript: null, cnic: null, photo: null };

// ═══════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ═══════════════════════════════════════════════════════════
export default function UniversityPortal() {
  const [dark, setDark] = useState(true);
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState("apply");
  const [scrolled, setScrolled] = useState(false);
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
  const [files, setFiles] = useState(EMPTY_FILES);
  const [form, setForm] = useState(EMPTY_FORM);
  const formRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const d = dark;
  const C = {
    bg:          d ? "#03070E" : "#EDF2FF",
    cardBg:      d ? "rgba(8,18,45,0.72)" : "rgba(255,255,255,0.72)",
    border:      d ? "rgba(255,255,255,0.07)" : "rgba(37,99,235,0.13)",
    text:        d ? "#E6EFFF" : "#081529",
    muted:       d ? "#6080A8" : "#4A6FA5",
    inputBg:     d ? "rgba(255,255,255,0.04)" : "rgba(37,99,235,0.03)",
    inputBorder: d ? "rgba(255,255,255,0.09)" : "rgba(37,99,235,0.17)",
    accent: "#2563EB",
  };

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
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };
  const goPrev = () => {
    setErrors({});
    setAnimDir(-1);
    setStep(s => Math.max(s - 1, 0));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
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
    if (!trimmed) { setPaymentResult({ success: false, message: "Please enter your Admission ID." }); return; }
    setPaymentLoading(true);
    setPaymentResult(null);
    const result = await updatePaymentStatus(trimmed);
    setPaymentLoading(false);
    if (result.success) {
      setPaymentResult({ success: true, message: `Payment confirmed for ${result.data.first_name} ${result.data.last_name}. Status updated to Paid.`, data: result.data });
    } else {
      setPaymentResult({ success: false, message: result.error && result.error.includes("not_found") ? "Admission ID not found. Please verify and try again." : "Update failed. Verify your Admission ID or Supabase config." });
    }
  };

  const resetApp = () => {
    setSubmitted(false); setStep(0); setForm(EMPTY_FORM);
    setFiles(EMPTY_FILES); setErrors({}); setGeneratedId(""); setSubmitError("");
  };

  // ── Style helpers (pure objects, no hooks)
  const inp = { width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.inputBorder}`, background: C.inputBg, color: C.text, fontSize: 14, outline: "none", backdropFilter: "blur(8px)", transition: "border-color .2s, box-shadow .2s", fontFamily: "inherit" };
  const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, display: "block", letterSpacing: "0.06em", textTransform: "uppercase" };
  const err = { fontSize: 11, color: "#F87171", marginTop: 3 };
  const pbtn = { padding: "12px 28px", borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", boxShadow: "0 6px 24px rgba(37,99,235,.35)", transition: "all .2s", fontFamily: "inherit" };
  const gbtn = { padding: "12px 24px", borderRadius: 50, fontWeight: 600, fontSize: 14, cursor: "pointer", background: "transparent", color: C.muted, display: "flex", alignItems: "center", gap: 8, transition: "all .2s", fontFamily: "inherit", border: `1px solid ${C.border}` };

  const selProg = PROGRAMS.find(p => p.id === form.program);
  const sscPct  = form.sscMarks  && form.sscTotal  && +form.sscTotal  > 0 ? ((+form.sscMarks  / +form.sscTotal)  * 100).toFixed(1) : null;
  const hsscPct = form.hsscMarks && form.hsscTotal && +form.hsscTotal > 0 ? ((+form.hsscMarks / +form.hsscTotal) * 100).toFixed(1) : null;
  const stepAnimClass = animDir >= 0 ? "sa-fwd" : "sa-bwd";

  const STEP_ICONS = [BookOpen, User, Award, FileText, CheckCircle, Sparkles];
  const STEP_TITLES = ["Select Your Program","Personal Information","Academic Qualifications","Documents & Statement","Review Application","Finalize & Submit"];
  const STEP_SUBS = [
    "Browse and select from 25 programs across all disciplines.",
    "Provide your personal details as per your CNIC / B-Form.",
    "Enter your SSC, HSSC (or equivalent) results accurately.",
    "Upload required documents and write your personal statement.",
    "Carefully review all information before proceeding.",
    "Submit your application and receive your unique Admission ID.",
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit','DM Sans',system-ui", transition: "background .3s,color .3s", overflowX: "hidden" }}>
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
      <div aria-hidden style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-22%",left:"-14%",width:720,height:720,borderRadius:"50%",background:d?"radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 68%)":"radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 68%)",animation:"float-a 9s ease-in-out infinite"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-12%",width:640,height:640,borderRadius:"50%",background:d?"radial-gradient(circle,rgba(79,70,229,.10) 0%,transparent 65%)":"radial-gradient(circle,rgba(79,70,229,.05) 0%,transparent 65%)",animation:"float-b 11s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"35%",right:"18%",width:300,height:300,borderRadius:"50%",background:d?"radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 65%)":"radial-gradient(circle,rgba(6,182,212,.04) 0%,transparent 65%)",animation:"float-a 14s ease-in-out infinite reverse"}}/>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:200,width:"min(calc(100% - 40px),1100px)",background:scrolled?(d?"rgba(3,7,14,.9)":"rgba(237,242,255,.9)"):"transparent",backdropFilter:scrolled?"blur(28px) saturate(180%)":"none",borderRadius:18,padding:"12px 24px",border:scrolled?`1px solid ${C.border}`:"1px solid transparent",boxShadow:scrolled?(d?"0 8px 40px rgba(0,0,0,.35)":"0 8px 40px rgba(37,99,235,.1)"):"none",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .35s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#2563EB,#1E40AF)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(37,99,235,.45)",flexShrink:0}}>
            <GraduationCap size={20} color="#fff"/>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:15,letterSpacing:"-0.02em",lineHeight:1}}>
              <span style={{color:"#2563EB"}}>Royal</span><span style={{color:C.text}}> University</span>
            </div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>Est. 1892</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:26,fontSize:14,fontWeight:500}}>
          {["Programs","Faculty","Campus","Research"].map(n=>(
            <a key={n} href="#" className="nav-link" style={{color:C.muted}}>{n}</a>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setDark(!d)} style={{width:36,height:36,borderRadius:10,border:`1px solid ${C.border}`,background:C.inputBg,cursor:"pointer",color:C.text,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {d?<Sun size={15} color="#FBBF24"/>:<Moon size={15} color="#6366F1"/>}
          </button>
          <button className="pbtn" onClick={()=>{setActiveTab("apply");formRef.current?.scrollIntoView({behavior:"smooth"});}} style={pbtn}>
            Apply Now <ArrowRight size={14}/>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{position:"relative",zIndex:1,padding:"140px 24px 60px",textAlign:"center",maxWidth:820,margin:"0 auto"}}>
        <div className="fadeUp" style={{display:"inline-flex",alignItems:"center",gap:8,background:d?"rgba(37,99,235,.12)":"rgba(37,99,235,.07)",border:"1px solid rgba(37,99,235,.27)",borderRadius:50,padding:"7px 18px",fontSize:12,color:"#60A5FA",marginBottom:28,backdropFilter:"blur(10px)",fontWeight:600,letterSpacing:"0.02em"}}>
          <Sparkles size={13}/> Admissions Open — Fall 2026 · 25 Programs Available
        </div>
        <h1 className="fadeUp d1" style={{fontSize:"clamp(2.6rem,6.5vw,5.2rem)",fontWeight:900,lineHeight:1.06,letterSpacing:"-0.035em",marginBottom:22}}>
          Begin Your Academic<br/>
          <span style={{background:"linear-gradient(130deg,#2563EB 0%,#60A5FA 50%,#A5B4FC 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Journey Today</span>
        </h1>
        <p className="fadeUp d2" style={{fontSize:17,color:C.muted,maxWidth:520,margin:"0 auto 36px",lineHeight:1.75,fontWeight:400}}>
          Join 28,000+ students across 25 world-class undergraduate and postgraduate programs. HEC Accredited. Internationally recognised.
        </p>
        <div className="fadeUp d3" style={{display:"flex",gap:48,justifyContent:"center",flexWrap:"wrap"}}>
          {[["25","Programs"],["28K+","Students"],["98%","Employment"],["#1","Nationally Ranked"]].map(([v,l])=>(
            <div key={l}>
              <div style={{fontSize:26,fontWeight:900,color:"#2563EB",letterSpacing:"-0.03em"}}>{v}</div>
              <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.04em",textTransform:"uppercase",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div ref={formRef} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"0 24px 80px"}}>

        {/* Tab switcher */}
        <div style={{display:"flex",gap:6,marginBottom:28,background:C.cardBg,backdropFilter:"blur(20px)",borderRadius:16,padding:6,border:`1px solid ${C.border}`,width:"fit-content"}}>
          {[["apply",GraduationCap,"Apply for Admission"],["payment",CreditCard,"Pay Admission Fee"]].map(([tab,Icon,label])=>(
            <button key={tab} className="tab-btn" onClick={()=>setActiveTab(tab)} style={{padding:"9px 20px",borderRadius:11,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8,background:activeTab===tab?"linear-gradient(135deg,#2563EB,#1D4ED8)":"transparent",color:activeTab===tab?"#fff":C.muted,boxShadow:activeTab===tab?"0 4px 16px rgba(37,99,235,.3)":"none"}}>
              <Icon size={15}/> {label}
            </button>
          ))}
        </div>

        {/* ══ PAYMENT TAB ══ */}
        {activeTab==="payment" && (
          <div className="sa-fwd" style={{maxWidth:560}}>
            <div style={{background:C.cardBg,backdropFilter:"blur(32px)",borderRadius:24,border:`1px solid ${C.border}`,boxShadow:d?"0 24px 80px rgba(0,0,0,.4)":"0 24px 80px rgba(37,99,235,.08)",overflow:"hidden"}}>
              <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${C.border}`,background:d?"rgba(37,99,235,.05)":"rgba(37,99,235,.025)"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:48,height:48,borderRadius:14,background:"rgba(37,99,235,.14)",border:"1px solid rgba(37,99,235,.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CreditCard size={22} color="#2563EB"/>
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:20}}>Pay Admission Fee</div>
                    <div style={{fontSize:13,color:C.muted,marginTop:2}}>Enter your Admission ID to confirm payment</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"28px 32px"}}>
                <div style={{padding:"16px 18px",borderRadius:14,background:d?"rgba(37,99,235,.08)":"rgba(37,99,235,.05)",border:"1px solid rgba(37,99,235,.2)",marginBottom:24,fontSize:13,color:C.muted,lineHeight:1.7}}>
                  <strong style={{color:"#2563EB"}}>💡 How it works:</strong> After submitting your application, you receive a unique Admission ID like{" "}
                  <code style={{background:"rgba(37,99,235,.15)",padding:"1px 7px",borderRadius:5,color:"#60A5FA",fontFamily:"monospace",fontSize:13}}>ADM-XXXX-1234</code>. Enter it below to mark your fee as Paid in the database.
                </div>
                <label style={lbl}>Your Admission ID</label>
                <div style={{display:"flex",gap:10,marginBottom:20}}>
                  <input style={{...inp,flex:1,fontFamily:"monospace",fontSize:15,letterSpacing:"0.05em"}} placeholder="ADM-XXXX-0000" value={paymentId} onChange={e=>{setPaymentId(e.target.value);setPaymentResult(null);}} onKeyDown={e=>e.key==="Enter"&&handlePayment()}/>
                  <button onClick={handlePayment} disabled={paymentLoading} className="pbtn" style={{...pbtn,padding:"11px 20px",flexShrink:0,opacity:paymentLoading?.7:1}}>
                    {paymentLoading?<div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>:<CheckCircle size={16}/>}
                    {paymentLoading?"Verifying…":"Confirm"}
                  </button>
                </div>
                {paymentResult && (
                  <div style={{padding:"16px 18px",borderRadius:14,background:paymentResult.success?(d?"rgba(16,185,129,.1)":"rgba(16,185,129,.07)"):(d?"rgba(239,68,68,.1)":"rgba(239,68,68,.07)"),border:`1px solid ${paymentResult.success?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`,display:"flex",alignItems:"flex-start",gap:12}}>
                    {paymentResult.success?<CheckCircle size={20} color="#10B981" style={{flexShrink:0,marginTop:1}}/>:<AlertCircle size={20} color="#EF4444" style={{flexShrink:0,marginTop:1}}/>}
                    <div>
                      <div style={{fontWeight:700,color:paymentResult.success?"#10B981":"#EF4444",marginBottom:4,fontSize:14}}>
                        {paymentResult.success?"Payment Confirmed!":"Verification Failed"}
                      </div>
                      <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{paymentResult.message}</div>
                      {paymentResult.success && paymentResult.data && (
                        <div style={{marginTop:12,display:"flex",flexWrap:"wrap",gap:8}}>
                          {[["Program",paymentResult.data.program_title],["Status","Paid ✓"],["Paid At",paymentResult.data.paid_at?new Date(paymentResult.data.paid_at).toLocaleString():"—"]].map(([k,v])=>(
                            <div key={k} style={{padding:"7px 12px",borderRadius:9,background:C.inputBg,border:`1px solid ${C.inputBorder}`}}>
                              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
                              <div style={{fontSize:13,fontWeight:600,color:C.text,marginTop:2}}>{v}</div>
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

        {/* ══ APPLICATION TAB — FORM ══ */}
        {activeTab==="apply" && !submitted && (
          <div>
            {/* Step progress */}
            <div style={{marginBottom:32}}>
              <div style={{display:"flex",alignItems:"flex-start"}}>
                {STEPS.map((s,i)=>(
                  <div key={s} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
                      <div
                        onClick={()=>{if(i<step){setAnimDir(-1);setErrors({});setStep(i);}}}
                        style={{width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<step?"linear-gradient(135deg,#2563EB,#1D4ED8)":i===step?"linear-gradient(135deg,#2563EB,#60A5FA)":C.inputBg,border:`2px solid ${i<=step?"#2563EB":C.inputBorder}`,color:i<=step?"#fff":C.muted,fontSize:13,fontWeight:700,cursor:i<step?"pointer":"default",boxShadow:i===step?"0 0 0 5px rgba(37,99,235,.18),0 4px 14px rgba(37,99,235,.32)":"none",transition:"all .3s"}}
                      >
                        {i<step?<Check size={15} strokeWidth={3}/>:i+1}
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:i<=step?"#2563EB":C.muted,whiteSpace:"nowrap",letterSpacing:"0.04em",textTransform:"uppercase"}}>{s}</span>
                    </div>
                    {i<STEPS.length-1 && <div style={{flex:1,height:2,marginBottom:24,marginLeft:4,marginRight:4,background:i<step?"#2563EB":C.inputBorder,borderRadius:2,transition:"background .4s"}}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Card */}
            <div style={{background:C.cardBg,backdropFilter:"blur(32px)",borderRadius:26,border:`1px solid ${C.border}`,boxShadow:d?"0 32px 90px rgba(0,0,0,.42)":"0 32px 90px rgba(37,99,235,.09)",overflow:"hidden",marginBottom:20}}>
              {/* Header */}
              <div style={{padding:"26px 34px 22px",borderBottom:`1px solid ${C.border}`,background:d?"rgba(37,99,235,.05)":"rgba(37,99,235,.025)"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:13,background:"rgba(37,99,235,.13)",border:"1px solid rgba(37,99,235,.24)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {(() => { const Icon = STEP_ICONS[step]; return <Icon size={20} color="#2563EB"/>; })()}
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:19,letterSpacing:"-0.02em"}}>{STEP_TITLES[step]}</div>
                    <div style={{fontSize:13,color:C.muted,marginTop:2}}>{STEP_SUBS[step]}</div>
                  </div>
                </div>
              </div>

              {/* Body — keyed for animation */}
              <div key={step} className={stepAnimClass} style={{padding:"30px 34px"}}>

                {/* STEP 0 — Program */}
                {step===0 && (
                  <div>
                    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                      <div style={{position:"relative",flex:1,minWidth:200}}>
                        <Search size={15} color={C.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
                        <input style={{...inp,paddingLeft:36}} placeholder="Search programs…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {["ALL","BS","MS","MBA"].map(l=>(
                          <button key={l} onClick={()=>setLevelFilter(l)} style={{padding:"10px 16px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",border:`1px solid ${levelFilter===l?"#2563EB":C.inputBorder}`,background:levelFilter===l?"rgba(37,99,235,.14)":C.inputBg,color:levelFilter===l?"#2563EB":C.muted,transition:"all .18s",fontFamily:"inherit"}}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{maxHeight:470,overflowY:"auto",paddingRight:4}}>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
                        {filteredPrograms.map(p=>{
                          const Icon=p.icon;
                          const sel=form.program===p.id;
                          return (
                            <div key={p.id} className="card-h prog-card" onClick={()=>setField("program",p.id)} style={{"--pc":p.color,borderRadius:18,padding:"17px 15px",cursor:"pointer",background:sel?`color-mix(in srgb,${p.color} 11%,transparent)`:C.inputBg,border:`2px solid ${sel?p.color:C.inputBorder}`,boxShadow:sel?`0 8px 28px color-mix(in srgb,${p.color} 28%,transparent)`:"none",transition:"all .22s",position:"relative"}}>
                              {sel && <div style={{position:"absolute",top:10,right:10,width:20,height:20,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${p.color}66`}}><Check size={11} color="#fff" strokeWidth={3}/></div>}
                              <div style={{width:40,height:40,borderRadius:11,background:`color-mix(in srgb,${p.color} 18%,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:11,border:`1px solid color-mix(in srgb,${p.color} 25%,transparent)`}}>
                                <Icon size={20} color={p.color}/>
                              </div>
                              <div style={{fontWeight:700,fontSize:13,lineHeight:1.3,marginBottom:7}}>{p.title}</div>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:10,padding:"2px 8px",borderRadius:50,background:`color-mix(in srgb,${p.color} 15%,transparent)`,color:p.color,fontWeight:700}}>{p.level}</span>
                                <span style={{fontSize:10,color:C.muted,fontWeight:500}}>{p.dept}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {filteredPrograms.length===0 && (
                        <div style={{textAlign:"center",padding:48,color:C.muted}}>
                          <Search size={32} style={{marginBottom:10,opacity:.35}}/>
                          <div style={{fontWeight:600}}>No programs match your search.</div>
                        </div>
                      )}
                    </div>
                    {errors.program && <p style={{...err,marginTop:12}}>{errors.program}</p>}
                  </div>
                )}

                {/* STEP 1 — Personal */}
                {step===1 && (
                  <div style={{display:"flex",flexDirection:"column",gap:18}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div><label style={lbl}>First Name *</label><input style={inp} placeholder="Muhammad" value={form.firstName} onChange={e=>setField("firstName",e.target.value)}/>{errors.firstName&&<p style={err}>{errors.firstName}</p>}</div>
                      <div><label style={lbl}>Last Name *</label><input style={inp} placeholder="Ahmed" value={form.lastName} onChange={e=>setField("lastName",e.target.value)}/>{errors.lastName&&<p style={err}>{errors.lastName}</p>}</div>
                    </div>
                    <div><label style={lbl}>Father's Name *</label><input style={inp} placeholder="Father's full name" value={form.fatherName} onChange={e=>setField("fatherName",e.target.value)}/>{errors.fatherName&&<p style={err}>{errors.fatherName}</p>}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div><label style={lbl}>Email Address *</label><input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setField("email",e.target.value)}/>{errors.email&&<p style={err}>{errors.email}</p>}</div>
                      <div><label style={lbl}>Phone Number *</label><input style={inp} placeholder="03xx-xxxxxxx" value={form.phone} onChange={e=>setField("phone",e.target.value)}/>{errors.phone&&<p style={err}>{errors.phone}</p>}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                      <div><label style={lbl}>Date of Birth *</label><input style={inp} type="date" value={form.dob} onChange={e=>setField("dob",e.target.value)}/>{errors.dob&&<p style={err}>{errors.dob}</p>}</div>
                      <div><label style={lbl}>Gender *</label>
                        <select style={inp} value={form.gender} onChange={e=>setField("gender",e.target.value)}>
                          <option value="">Select…</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>{errors.gender&&<p style={err}>{errors.gender}</p>}
                      </div>
                      <div><label style={lbl}>Nationality</label><input style={inp} placeholder="Pakistani" value={form.nationality} onChange={e=>setField("nationality",e.target.value)}/></div>
                    </div>
                    <div><label style={lbl}>CNIC / B-Form *</label><input style={inp} placeholder="xxxxx-xxxxxxx-x" value={form.cnic} onChange={e=>setField("cnic",e.target.value)}/>{errors.cnic&&<p style={err}>{errors.cnic}</p>}</div>
                    <div><label style={lbl}>Residential Address</label><textarea style={{...inp,height:78,resize:"vertical"}} placeholder="House No, Street, City, Province" value={form.address} onChange={e=>setField("address",e.target.value)}/></div>
                  </div>
                )}

                {/* STEP 2 — Academics */}
                {step===2 && (
                  <div style={{display:"flex",flexDirection:"column",gap:22}}>
                    {/* SSC */}
                    {[
                      {label:"SSC / Matric Examination",dot:"#2563EB",mk:"sscMarks",mt:"sscTotal",mb:"sscBoard",my:"sscYear",pct:sscPct,ek:{m:"sscMarks",t:"sscTotal",b:"sscBoard",y:"sscYear"}},
                      {label:"HSSC / Intermediate Examination",dot:"#7C3AED",mk:"hsscMarks",mt:"hsscTotal",mb:"hsscBoard",my:"hsscYear",pct:hsscPct,ek:{m:"hsscMarks",t:"hsscTotal",b:"hsscBoard",y:"hsscYear"}},
                    ].map(({label,dot,mk,mt,mb,my,pct,ek})=>(
                      <div key={label} style={{padding:"20px 22px",borderRadius:18,border:`1px solid ${C.inputBorder}`,background:C.inputBg}}>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0}}/>{label}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
                          <div><label style={lbl}>Marks Obtained *</label><input style={inp} type="number" placeholder="850" value={form[mk]} onChange={e=>setField(mk,e.target.value)}/>{errors[ek.m]&&<p style={err}>{errors[ek.m]}</p>}</div>
                          <div><label style={lbl}>Total Marks *</label><input style={inp} type="number" placeholder="1100" value={form[mt]} onChange={e=>setField(mt,e.target.value)}/>{errors[ek.t]&&<p style={err}>{errors[ek.t]}</p>}</div>
                          <div><label style={lbl}>Board *</label><input style={inp} placeholder="e.g. FBISE" value={form[mb]} onChange={e=>setField(mb,e.target.value)}/>{errors[ek.b]&&<p style={err}>{errors[ek.b]}</p>}</div>
                          <div><label style={lbl}>Year *</label><input style={inp} type="number" placeholder="2023" value={form[my]} onChange={e=>setField(my,e.target.value)}/>{errors[ek.y]&&<p style={err}>{errors[ek.y]}</p>}</div>
                        </div>
                        {pct && (
                          <div style={{marginTop:14}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
                              <span style={{color:C.muted,fontWeight:600}}>Percentage</span>
                              <span style={{color:+pct>=70?"#10B981":+pct>=50?"#F59E0B":"#EF4444",fontWeight:700}}>{pct}%</span>
                            </div>
                            <div style={{height:6,borderRadius:99,background:C.border,overflow:"hidden"}}>
                              <div style={{height:"100%",borderRadius:99,width:`${Math.min(+pct,100)}%`,background:+pct>=70?"linear-gradient(90deg,#10B981,#059669)":+pct>=50?"linear-gradient(90deg,#F59E0B,#D97706)":"linear-gradient(90deg,#EF4444,#DC2626)",transition:"width .6s"}}/>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Previous degree for MS/MBA */}
                    {selProg && (selProg.level==="MS"||selProg.level==="MBA") && (
                      <div style={{padding:"20px 22px",borderRadius:18,border:`1px solid ${C.inputBorder}`,background:C.inputBg}}>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#059669",flexShrink:0}}/>Bachelor's Degree (required for {selProg.level})
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                          <div><label style={lbl}>Degree Title</label><input style={inp} placeholder="e.g. BS CS" value={form.prevDegree} onChange={e=>setField("prevDegree",e.target.value)}/></div>
                          <div><label style={lbl}>CGPA (out of 4.0)</label><input style={inp} type="number" step="0.01" min="0" max="4" placeholder="3.5" value={form.prevCgpa} onChange={e=>setField("prevCgpa",e.target.value)}/></div>
                          <div><label style={lbl}>Institution</label><input style={inp} placeholder="University name" value={form.prevInstitution} onChange={e=>setField("prevInstitution",e.target.value)}/></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3 — Documents */}
                {step===3 && (
                  <div style={{display:"flex",flexDirection:"column",gap:20}}>
                    {[
                      {key:"transcript",label:"Academic Transcript / Mark Sheet",hint:"PDF, JPG, PNG — max 5 MB"},
                      {key:"cnic",      label:"CNIC / B-Form (Front & Back)",    hint:"JPG, PNG, PDF — max 5 MB"},
                      {key:"photo",     label:"Recent Passport-size Photo",       hint:"JPG, PNG — max 2 MB"},
                    ].map(({key,label,hint})=>(
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <label style={{display:"flex",alignItems:"center",gap:14,padding:"15px 18px",borderRadius:14,border:`2px dashed ${files[key]?"#2563EB":C.inputBorder}`,background:files[key]?(d?"rgba(37,99,235,.08)":"rgba(37,99,235,.04)"):C.inputBg,cursor:"pointer",transition:"all .2s"}}>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{const f=e.target.files;if(f&&f.length>0)setFile(key,f[0]);}}/>
                          <div style={{width:40,height:40,borderRadius:11,background:files[key]?"rgba(37,99,235,.2)":C.inputBg,border:`1px solid ${files[key]?"rgba(37,99,235,.35)":C.inputBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {files[key]?<Check size={18} color="#2563EB"/>:<Upload size={18} color={C.muted}/>}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:14,color:files[key]?C.text:C.muted}}>{files[key]?files[key].name:"Click to upload"}</div>
                            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{hint}</div>
                          </div>
                          {files[key] && (
                            <button onClick={e=>{e.preventDefault();setFile(key,null);}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4,display:"flex"}}>
                              <X size={16}/>
                            </button>
                          )}
                        </label>
                      </div>
                    ))}

                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <label style={lbl}>Personal Statement *</label>
                        <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{form.essay.length}/2000</span>
                      </div>
                      <textarea style={{...inp,height:148,resize:"vertical"}} placeholder="Describe your academic goals, motivations, research interests, and why you wish to join this program…" maxLength={2000} value={form.essay} onChange={e=>setField("essay",e.target.value)}/>
                      {errors.essay&&<p style={err}>{errors.essay}</p>}
                    </div>

                    <div>
                      <label style={lbl}>Create Application Password *</label>
                      <div style={{position:"relative"}}>
                        <input style={inp} type={showPass?"text":"password"} placeholder="Minimum 8 characters" value={form.password} onChange={e=>setField("password",e.target.value)}/>
                        <button onClick={()=>setShowPass(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted,display:"flex"}}>
                          {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                        </button>
                      </div>
                      {errors.password&&<p style={err}>{errors.password}</p>}
                      {form.password && (
                        <div style={{display:"flex",gap:5,marginTop:8}}>
                          {[form.password.length>=8,/[A-Z]/.test(form.password),/[0-9]/.test(form.password),/[^A-Za-z0-9]/.test(form.password)].map((ok,i)=>(
                            <div key={i} style={{flex:1,height:3,borderRadius:99,background:ok?["#2563EB","#10B981","#F59E0B","#8B5CF6"][i]:C.inputBorder,transition:"background .3s"}}/>
                          ))}
                        </div>
                      )}
                    </div>

                    <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",padding:"15px 18px",borderRadius:14,background:C.inputBg,border:`1px solid ${errors.terms?"#EF4444":C.inputBorder}`}}>
                      <div onClick={()=>setField("terms",!form.terms)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${form.terms?"#2563EB":C.inputBorder}`,background:form.terms?"#2563EB":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
                        {form.terms&&<Check size={13} color="#fff" strokeWidth={3}/>}
                      </div>
                      <span style={{fontSize:13,color:C.muted,lineHeight:1.65}}>
                        I certify all information is accurate. I agree to Royal University's{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Terms of Admission</span>,{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Privacy Policy</span>, and{" "}
                        <span style={{color:"#2563EB",fontWeight:600}}>Code of Conduct</span>.
                      </span>
                    </label>
                    {errors.terms&&<p style={err}>{errors.terms}</p>}
                  </div>
                )}

                {/* STEP 4 — Review */}
                {step===4 && (
                  <div style={{display:"flex",flexDirection:"column",gap:16}}>
                    {selProg && (() => {
                      const Icon=selProg.icon;
                      return (
                        <div style={{padding:22,borderRadius:18,background:`color-mix(in srgb,${selProg.color} 10%,transparent)`,border:`1px solid color-mix(in srgb,${selProg.color} 25%,transparent)`,display:"flex",alignItems:"center",gap:16}}>
                          <div style={{width:52,height:52,borderRadius:15,background:`color-mix(in srgb,${selProg.color} 18%,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Icon size={26} color={selProg.color}/>
                          </div>
                          <div>
                            <div style={{fontSize:18,fontWeight:800}}>{selProg.title}</div>
                            <div style={{fontSize:13,color:C.muted,marginTop:3}}>Level: {selProg.level} · Dept: {selProg.dept}</div>
                          </div>
                          <div style={{marginLeft:"auto",textAlign:"right"}}>
                            <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Status</div>
                            <div style={{fontSize:13,fontWeight:700,color:"#F59E0B",marginTop:2}}>⏳ Pending Payment</div>
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[
                        ["Full Name",`${form.firstName} ${form.lastName}`],
                        ["Father's Name",form.fatherName],
                        ["Email",form.email],
                        ["Phone",form.phone],
                        ["Date of Birth",form.dob],
                        ["Gender",form.gender],
                        ["CNIC",form.cnic||"—"],
                        ["Nationality",form.nationality],
                        ["SSC Marks",form.sscMarks&&form.sscTotal?`${form.sscMarks}/${form.sscTotal} (${sscPct}%)`:"—"],
                        ["SSC Board/Year",form.sscBoard&&form.sscYear?`${form.sscBoard}, ${form.sscYear}`:"—"],
                        ["HSSC Marks",form.hsscMarks&&form.hsscTotal?`${form.hsscMarks}/${form.hsscTotal} (${hsscPct}%)`:"—"],
                        ["HSSC Board/Year",form.hsscBoard&&form.hsscYear?`${form.hsscBoard}, ${form.hsscYear}`:"—"],
                      ].map(([k,v])=>(
                        <div key={k} style={{padding:"13px 16px",borderRadius:12,background:C.inputBg,border:`1px solid ${C.inputBorder}`}}>
                          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{k}</div>
                          <div style={{fontWeight:600,fontSize:14,wordBreak:"break-word"}}>{v||"—"}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{padding:"15px 18px",borderRadius:14,background:C.inputBg,border:`1px solid ${C.inputBorder}`}}>
                      <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Documents</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
                        {[["Transcript",files.transcript],["CNIC/B-Form",files.cnic],["Photo",files.photo]].map(([label,file])=>(
                          <div key={label} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:9,background:file?(d?"rgba(16,185,129,.12)":"rgba(16,185,129,.08)"):C.border,border:`1px solid ${file?"rgba(16,185,129,.3)":C.inputBorder}`}}>
                            {file?<Check size={13} color="#10B981"/>:<X size={13} color="#EF4444"/>}
                            <span style={{fontSize:12,fontWeight:600,color:file?"#10B981":"#EF4444"}}>{label}: {file?"Ready":"Not uploaded"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {form.essay && (
                      <div style={{padding:"15px 18px",borderRadius:14,background:C.inputBg,border:`1px solid ${C.inputBorder}`}}>
                        <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:7}}>Statement Preview</div>
                        <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{form.essay.slice(0,220)}{form.essay.length>220?"…":""}</div>
                      </div>
                    )}

                    <div style={{padding:"14px 18px",borderRadius:14,background:d?"rgba(37,99,235,.08)":"rgba(37,99,235,.05)",border:"1px solid rgba(37,99,235,.2)",display:"flex",gap:12,alignItems:"flex-start"}}>
                      <Shield size={18} color="#2563EB" style={{flexShrink:0,marginTop:1}}/>
                      <span style={{fontSize:13,color:C.muted,lineHeight:1.6}}>All data is encrypted. A unique Admission ID will be generated on submission and is required for fee payment and status tracking.</span>
                    </div>
                  </div>
                )}

                {/* STEP 5 — Submit */}
                {step===5 && (
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,rgba(37,99,235,.14),rgba(37,99,235,.07))",border:"2px solid rgba(37,99,235,.28)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 0 0 12px rgba(37,99,235,.06)"}}>
                      <Sparkles size={36} color="#2563EB"/>
                    </div>
                    <h3 style={{fontSize:22,fontWeight:800,marginBottom:12}}>Ready to Submit!</h3>
                    <p style={{fontSize:15,color:C.muted,lineHeight:1.7,maxWidth:480,margin:"0 auto 28px"}}>
                      Your application is complete. Click <strong style={{color:C.text}}>Submit Application</strong> to send it. You'll receive a unique <strong style={{color:"#2563EB"}}>Admission ID</strong> — save it for fee payment and tracking.
                    </p>
                    {submitError && (
                      <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                        <AlertCircle size={16} style={{flexShrink:0}}/>{submitError}
                      </div>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
                      <button onClick={handleSubmit} disabled={submitting} className="pbtn" style={{...pbtn,padding:"14px 44px",fontSize:16,opacity:submitting?.75:1,minWidth:220,justifyContent:"center"}}>
                        {submitting?<><div style={{width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Submitting…</>:<><Sparkles size={18}/> Submit Application</>}
                      </button>
                      <p style={{fontSize:12,color:C.muted}}>Ensure all details are correct — this action cannot be undone.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div style={{padding:"18px 34px 26px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:12,color:C.muted,fontWeight:500}}>Step {step+1} of {STEPS.length}</div>
                <div style={{display:"flex",gap:10}}>
                  {step>0 && <button onClick={goPrev} className="gbtn" style={gbtn}><ChevronLeft size={15}/> Back</button>}
                  {step<STEPS.length-1 && <button onClick={goNext} className="pbtn" style={pbtn}>Continue <ChevronRight size={15}/></button>}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{display:"flex",gap:28,justifyContent:"center",flexWrap:"wrap",padding:"8px 0 12px"}}>
              {[[Shield,"256-bit SSL"],[Clock,"5-Min Apply"],[Users,"28K+ Alumni"],[Award,"HEC Accredited"]].map(([Icon,text])=>(
                <div key={text} style={{display:"flex",alignItems:"center",gap:7,color:C.muted,fontSize:12,fontWeight:500}}>
                  <Icon size={13} color="#2563EB"/> {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SUCCESS STATE ══ */}
        {activeTab==="apply" && submitted && (
          <div className="sa-fwd" style={{maxWidth:680}}>
            <div style={{background:C.cardBg,backdropFilter:"blur(32px)",borderRadius:26,border:`1px solid ${C.border}`,boxShadow:d?"0 32px 80px rgba(0,0,0,.4)":"0 32px 80px rgba(37,99,235,.09)",overflow:"hidden"}}>
              <div style={{padding:"42px 40px 0",textAlign:"center"}}>
                <div style={{animation:"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both",width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#10B981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 0 0 16px rgba(16,185,129,.1),0 8px 32px rgba(16,185,129,.35)"}}>
                  <Check size={40} color="#fff" strokeWidth={2.5}/>
                </div>
                <h2 style={{fontSize:28,fontWeight:900,marginBottom:12,letterSpacing:"-0.03em"}}>Application Submitted!</h2>
                <p style={{fontSize:15,color:C.muted,lineHeight:1.7,maxWidth:480,margin:"0 auto"}}>
                  Congratulations, <strong style={{color:C.text}}>{form.firstName} {form.lastName}</strong>! Your application for <strong style={{color:"#2563EB"}}>{selProg?.title}</strong> has been received and is under review.
                </p>
              </div>

              {/* Admission ID */}
              <div style={{margin:"28px 40px",padding:"22px 24px",borderRadius:18,background:d?"rgba(37,99,235,.1)":"rgba(37,99,235,.06)",border:"1px solid rgba(37,99,235,.28)",textAlign:"center"}}>
                <div style={{fontSize:12,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Your Unique Admission ID</div>
                <div style={{fontSize:30,fontWeight:900,fontFamily:"monospace",color:"#2563EB",letterSpacing:"0.07em",marginBottom:10}}>{generatedId}</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>⚠️ <strong style={{color:C.text}}>Save this ID.</strong> Required for fee payment and application tracking. A confirmation email has been sent to <strong style={{color:C.text}}>{form.email}</strong>.</div>
              </div>

              <div style={{padding:"0 40px 32px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                {[["Status","Under Review","#F59E0B"],["Payment","Pending","#EF4444"],["Decision By","Mar 15, 2026","#2563EB"],["Email","Sent ✓","#10B981"],["Program",selProg?.level,C.text],["Dept",selProg?.dept,C.text]].map(([k,v,color])=>(
                  <div key={k} style={{padding:"14px 16px",borderRadius:14,background:C.inputBg,border:`1px solid ${C.inputBorder}`}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k}</div>
                    <div style={{fontWeight:700,fontSize:13,color:color||C.text,wordBreak:"break-word"}}>{v||"—"}</div>
                  </div>
                ))}
              </div>

              <div style={{padding:"20px 40px 34px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                <button onClick={()=>{setActiveTab("payment");setPaymentId(generatedId);}} className="pbtn" style={pbtn}>
                  <CreditCard size={16}/> Pay Fee Now
                </button>
                <button onClick={resetApp} className="gbtn" style={gbtn}>
                  <RefreshCw size={15}/> New Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
