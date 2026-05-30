import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// CONFIG & AUTH UTILITIES
// ─────────────────────────────────────────────
const BASE_URL = "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("saps-token");
const setToken = (t) => localStorage.setItem("saps-token", t);
const clearToken = () => {
  localStorage.removeItem("saps-token");
  localStorage.removeItem("saps-page");
};
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const validatePassword = (pw) => {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(pw))
    return "Password must contain at least one special character (!@#$…).";
  return null;
};

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return iso || "—"; }
};

const pillCls = (label) => {
  if (!label) return "";
  return { "Excellent": "excellent", "Good": "good", "Average": "average", "At Risk": "at-risk" }[label] || "";
};

const getTokenPayload = () => {
  try { return JSON.parse(atob(getToken().split(".")[1])); } catch { return {}; }
};

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:   #0f1e35;
      --navy2:  #162844;
      --blue:   #1e4db7;
      --blue2:  #2563eb;
      --cyan:   #38bdf8;
      --green:  #22c55e;
      --amber:  #f59e0b;
      --red:    #ef4444;
      --slate:  #94a3b8;
      --white:  #f8fafc;
      --card:   rgba(255,255,255,0.04);
      --border: rgba(255,255,255,0.08);
      --radius: 14px;
      --font:   'Sora', sans-serif;
      --mono:   'JetBrains Mono', monospace;
    }

    body { font-family: var(--font); background: var(--navy); color: var(--white); min-height: 100vh; }

    .saps-app { min-height: 100vh; display: flex; flex-direction: column; }

    .split { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    @media (max-width: 768px) { .split { grid-template-columns: 1fr; } }

    .split-left {
      background: linear-gradient(145deg, var(--navy2) 0%, #0a1628 100%);
      padding: 48px 56px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .split-left::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 60%);
      pointer-events: none;
    }
    .split-right {
      background: var(--white);
      padding: 48px 56px;
      display: flex; flex-direction: column; justify-content: center;
      color: #0f172a;
    }

    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
    .logo-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--blue2); display: grid; place-items: center; font-size: 18px;
    }
    .logo-text { font-size: 20px; font-weight: 700; letter-spacing: 1px; color: var(--white); }

    .hero-title { font-size: clamp(28px, 4vw, 44px); font-weight: 800; line-height: 1.15; margin-bottom: 20px; }
    .hero-sub { font-size: 15px; color: var(--slate); line-height: 1.7; max-width: 340px; margin-bottom: 40px; }

    .steps { display: flex; flex-direction: column; gap: 16px; }
    .step { display: flex; align-items: flex-start; gap: 14px; }
    .step-num {
      width: 28px; height: 28px; border-radius: 50%; background: var(--blue2);
      font-size: 13px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; margin-top: 2px;
    }
    .step-title { font-size: 14px; font-weight: 600; color: var(--white); }
    .step-desc  { font-size: 12px; color: var(--slate); margin-top: 2px; }

    .feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 40px; }
    .feat-card {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 12px; padding: 16px;
    }
    .feat-title { font-size: 18px; font-weight: 700; color: var(--white); }
    .feat-sub   { font-size: 11px; color: var(--slate); margin-top: 4px; line-height: 1.5; }

    .form-title   { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .form-sub     { font-size: 13px; color: #64748b; margin-bottom: 28px; }

    .role-toggle  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
    .role-btn {
      border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px;
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      background: #fff; transition: all .2s; font-family: var(--font);
    }
    .role-btn.active { border-color: var(--blue2); background: #eff6ff; }
    .role-btn .rb-icon { font-size: 22px; }
    .role-btn .rb-label { font-size: 13px; font-weight: 600; color: #0f172a; }
    .role-btn .rb-sub   { font-size: 10px; color: #64748b; }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; color: #475569; margin-bottom: 6px; }
    .field input, .field select {
      width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px;
      font-family: var(--font); font-size: 14px; color: #0f172a; outline: none; transition: border .2s;
      background: #fff;
    }
    .field input:focus, .field select:focus { border-color: var(--blue2); }

    .btn-primary {
      width: 100%; padding: 13px; border: none; border-radius: 10px;
      background: var(--blue2); color: #fff; font-family: var(--font);
      font-size: 15px; font-weight: 700; cursor: pointer; transition: background .2s, transform .1s;
      margin-top: 6px;
    }
    .btn-primary:hover { background: var(--blue); }
    .btn-primary:active { transform: scale(.98); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .form-link { text-align: center; margin-top: 16px; font-size: 13px; color: #64748b; }
    .form-link a { color: var(--blue2); font-weight: 600; cursor: pointer; text-decoration: none; }
    .form-link a:hover { text-decoration: underline; }

    .pw-hint { font-size: 11px; color: #94a3b8; margin-top: -8px; margin-bottom: 10px; }

    .navbar {
      background: var(--navy2); border-bottom: 1px solid var(--border);
      padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 100;
    }
    .nav-left { display: flex; align-items: center; gap: 14px; }
    .view-badge {
      font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 10px;
      border-radius: 20px; text-transform: uppercase;
    }
    .view-badge.student { background: rgba(37,99,235,.25); color: #93c5fd; }
    .view-badge.teacher { background: rgba(34,197,94,.2);  color: #86efac; }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .nav-name { font-size: 14px; font-weight: 500; color: var(--slate); }

    .dash-shell { padding: 32px 36px; max-width: 1200px; margin: 0 auto; }

    .greeting-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .greeting-title { font-size: 30px; font-weight: 800; }
    .greeting-sub   { font-size: 14px; color: var(--slate); margin-top: 4px; }
    .sem-badge {
      background: var(--card); border: 1px solid var(--border);
      padding: 6px 16px; border-radius: 20px; font-size: 13px; color: var(--slate);
    }

    .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 900px) { .stat-row { grid-template-columns: 1fr 1fr; } }
    .stat-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px 24px;
    }
    .stat-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--slate); margin-bottom: 8px; }
    .stat-value { font-size: 30px; font-weight: 800; line-height: 1; }
    .stat-value.green { color: var(--green); }
    .stat-value.white { color: var(--white); }
    .stat-sub   { font-size: 12px; color: var(--slate); margin-top: 4px; }

    .pred-banner {
      background: linear-gradient(120deg, rgba(30,77,183,.35) 0%, rgba(37,99,235,.2) 100%);
      border: 1px solid rgba(37,99,235,.4); border-radius: var(--radius);
      padding: 22px 28px; display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 28px;
    }
    .pred-left { display: flex; align-items: center; gap: 16px; }
    .pred-icon { font-size: 28px; }
    .pred-lbl  { font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--cyan); margin-bottom: 4px; }
    .pred-title{ font-size: 22px; font-weight: 800; }
    .pred-conf { font-size: 12px; color: var(--slate); margin-top: 3px; }
    .model-badge {
      background: var(--navy); border: 1px solid var(--border);
      border-radius: 20px; padding: 6px 14px; font-family: var(--mono);
      font-size: 11px; color: var(--cyan);
    }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
    .panel {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 24px;
    }
    .panel-title { font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--slate); margin-bottom: 18px; }

    .subject-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .subject-name { font-size: 13px; width: 150px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 99px; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 99px; }
    .bar-fill.high   { background: var(--green); }
    .bar-fill.mid    { background: var(--blue2); }
    .bar-fill.low    { background: var(--amber); }
    .subject-score { font-size: 13px; font-weight: 600; font-family: var(--mono); width: 28px; text-align: right; }

    .pred-hist-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border);
    }
    .pred-hist-row:last-child { border-bottom: none; }
    .ph-sem { font-size: 13px; font-weight: 600; }
    .ph-date{ font-size: 11px; color: var(--slate); margin-top: 2px; }
    .pill {
      font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;
    }
    .pill.good      { background: rgba(37,99,235,.2); color: #93c5fd; }
    .pill.excellent { background: rgba(34,197,94,.15); color: #86efac; }
    .pill.average   { background: rgba(245,158,11,.15); color: #fcd34d; }
    .pill.at-risk   { background: rgba(239,68,68,.15); color: #fca5a5; }

    .teacher-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .teacher-title  { font-size: 30px; font-weight: 800; }
    .teacher-sub    { font-size: 14px; color: var(--slate); margin-top: 4px; }
    .header-btns    { display: flex; gap: 10px; }
    .btn-outline {
      padding: 9px 18px; border-radius: 9px; font-family: var(--font);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
      border: 1.5px solid var(--border); background: var(--card); color: var(--white);
    }
    .btn-outline:hover { border-color: var(--blue2); color: var(--blue2); }
    .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-filled {
      padding: 9px 18px; border-radius: 9px; font-family: var(--font);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
      border: 1.5px solid var(--blue2); background: var(--blue2); color: #fff;
      display: flex; align-items: center; gap: 6px;
    }
    .btn-filled:hover { background: var(--blue); }
    .btn-filled:disabled { opacity: 0.5; cursor: not-allowed; }

    .teacher-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
    @media (max-width: 900px) { .teacher-layout { grid-template-columns: 1fr; } }

    .upload-zone {
      border: 2px dashed var(--border); border-radius: 12px; padding: 28px 20px;
      text-align: center; cursor: pointer; transition: border .2s;
      background: rgba(255,255,255,.02);
    }
    .upload-zone:hover { border-color: var(--blue2); }
    .upload-icon { font-size: 32px; margin-bottom: 10px; }
    .upload-label { font-size: 13px; color: var(--slate); line-height: 1.6; }

    .dist-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .dist-label { font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .dist-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dist-count { font-size: 13px; font-weight: 700; font-family: var(--mono); }

    .search-bar {
      display: flex; align-items: center; gap: 10px;
      border: 1.5px solid var(--border); border-radius: 10px;
      padding: 10px 14px; background: rgba(255,255,255,.03); margin-bottom: 18px;
    }
    .search-bar input {
      flex: 1; background: none; border: none; outline: none;
      font-family: var(--font); font-size: 14px; color: var(--white);
    }
    .search-bar input::placeholder { color: var(--slate); }

    .tbl-header {
      display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr;
      gap: 10px; padding: 0 0 12px;
      border-bottom: 1px solid var(--border); font-size: 10px;
      font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--slate);
    }
    .tbl-row {
      display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr;
      gap: 10px; align-items: center; padding: 14px 0;
      border-bottom: 1px solid var(--border); transition: background .15s;
    }
    .tbl-row:last-child { border-bottom: none; }
    .tbl-row:hover { background: rgba(255,255,255,.02); border-radius: 8px; }
    .student-name { font-size: 13px; font-weight: 600; }
    .student-id   { font-size: 11px; color: var(--slate); font-family: var(--mono); }
    .tbl-val      { font-size: 13px; font-weight: 500; font-family: var(--mono); }
    .btn-predict {
      padding: 6px 14px; border-radius: 7px; border: 1.5px solid var(--border);
      background: var(--card); color: var(--white); font-family: var(--font);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; white-space: nowrap;
    }
    .btn-predict:hover { border-color: var(--blue2); color: var(--blue2); }

    .toast {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      background: var(--navy2); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px 20px; font-size: 13px;
      color: var(--white); display: flex; align-items: center; gap: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,.4);
      animation: slideIn .3s ease;
    }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .btn-logout {
      padding: 5px 14px; border-radius: 7px; border: 1.5px solid rgba(239,68,68,.3);
      background: transparent; color: #fca5a5; font-family: var(--font);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s;
    }
    .btn-logout:hover { background: rgba(239,68,68,.15); border-color: var(--red); }
  `}</style>
);

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const Toast = ({ msg, icon = "✅" }) => (
  <div className="toast">{icon} {msg}</div>
);

// ─────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────
const RegisterPage = ({ onNavigate }) => {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, icon) => { setToast({ msg, icon }); setTimeout(() => setToast(null), 3500); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      showToast("Please fill in all required fields.", "⚠️"); return;
    }
    if (form.password !== form.confirm) {
      showToast("Passwords do not match.", "❌"); return;
    }
    const pwError = validatePassword(form.password);
    if (pwError) { showToast(pwError, "❌"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed.");
      showToast("Account created! Redirecting to login…", "🎉");
      setTimeout(() => onNavigate("login"), 1800);
    } catch (err) {
      showToast(err.message, "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <div className="logo">
          <div className="logo-icon">📊</div>
          <span className="logo-text">SAPS</span>
        </div>
        <div className="hero-title">Get started<br />in under a minute.</div>
        <p className="hero-sub">Create your account and you'll be on your dashboard right away.</p>
        <div className="steps">
          {[
            ["Pick your role", "Student or teacher — different dashboards await"],
            ["Fill in your details", "Name and institution email"],
            ["Set a password", "Min 8 chars, 1 uppercase, 1 number, 1 special character"],
            ["You're in", "See your progress and predictions instantly"],
          ].map(([title, desc], i) => (
            <div className="step" key={i}>
              <div className="step-num">{i + 1}</div>
              <div>
                <div className="step-title">{title}</div>
                <div className="step-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="split-right">
        <div className="form-title">Create your account</div>
        <div className="form-sub">All fields are required</div>

        <div className="role-toggle">
          {[
            { id: "student", icon: "🎓", label: "Student", sub: "View progress & predictions" },
            { id: "teacher", icon: "📋", label: "Teacher", sub: "Manage data & predictions" },
          ].map(({ id, icon, label, sub }) => (
            <button key={id} className={`role-btn ${role === id ? "active" : ""}`} onClick={() => setRole(id)}>
              <span className="rb-icon">{icon}</span>
              <div>
                <div className="rb-label">{label}</div>
                <div className="rb-sub">{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="field-row">
          <div className="field">
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Arjun" />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Mehta" />
          </div>
        </div>
        <div className="field">
          <label>Institution Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="you@institution.edu" type="email" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Password</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input name="confirm" value={form.confirm} onChange={handleChange} type="password" placeholder="••••••••" />
          </div>
        </div>
        <p className="pw-hint">Min 8 chars · 1 uppercase · 1 number · 1 special character</p>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
        <div className="form-link">
          Already have an account?{" "}
          <a onClick={() => onNavigate("login")}>Sign in</a>
        </div>
      </div>
      {toast && <Toast {...toast} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
const LoginPage = ({ onNavigate }) => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, icon) => { setToast({ msg, icon }); setTimeout(() => setToast(null), 2500); };

  const handleLogin = async () => {
    if (!email || !password) { showToast("Please enter your email and password.", "⚠️"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed.");
      setToken(data.access_token);
      localStorage.setItem("saps-page", data.role);
      showToast("Signing you in…", "🔐");
      setTimeout(() => onNavigate(data.role), 1000);
    } catch (err) {
      showToast(err.message, "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split">
      <div className="split-left">
        <div className="logo">
          <div className="logo-icon">📊</div>
          <span className="logo-text">SAPS</span>
        </div>
        <div className="hero-title">Know where you stand. Before results day.</div>
        <p className="hero-sub">Your marks and attendance, turned into a clear picture of where you're headed.</p>
        <div className="feat-grid">
          {[
            ["Early", "Spot students who need help"],
            ["Clear", "See your progress at a glance"],
            ["Fair", "Predictions based on your data only"],
            ["Private", "Only you and your teacher can see"],
          ].map(([title, sub]) => (
            <div className="feat-card" key={title}>
              <div className="feat-title">{title}</div>
              <div className="feat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="split-right">
        <div className="form-title">Welcome back</div>
        <div className="form-sub">Sign in to your account to continue</div>

        <div className="role-toggle">
          {[
            { id: "student", icon: "🎓", label: "Student", sub: "View progress & predictions" },
            { id: "teacher", icon: "📋", label: "Teacher", sub: "Manage data & predictions" },
          ].map(({ id, icon, label, sub }) => (
            <button key={id} className={`role-btn ${role === id ? "active" : ""}`} onClick={() => setRole(id)}>
              <span className="rb-icon">{icon}</span>
              <div>
                <div className="rb-label">{label}</div>
                <div className="rb-sub">{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="field">
          <label>Email Address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@institution.edu" />
        </div>
        <div className="field">
          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="form-link">
          Don't have an account?{" "}
          <a onClick={() => onNavigate("register")}>Register here</a>
        </div>
      </div>
      {toast && <Toast {...toast} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────
const StudentDashboard = ({ onNavigate }) => {
  const [progress, setProgress] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, icon) => { setToast({ msg, icon }); setTimeout(() => setToast(null), 2500); };

  const handleLogout = () => { clearToken(); onNavigate("login"); };

  useEffect(() => {
    const headers = authHeaders();
    Promise.all([
      fetch(`${BASE_URL}/api/student/progress`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${BASE_URL}/api/student/prediction`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${BASE_URL}/api/student/history`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([prog, pred, hist]) => {
      setProgress(prog);
      setPrediction(pred);
      setHistory(hist || []);
      setLoading(false);
    });
  }, []);

  const barCls = (score) => score >= 75 ? "high" : score >= 60 ? "mid" : "low";
  const subjectEntries = progress?.marks ? Object.entries(progress.marks) : [];
  const avgMarks = subjectEntries.length
    ? (subjectEntries.reduce((a, [, v]) => a + v, 0) / subjectEntries.length).toFixed(1)
    : null;

  const displayName = getTokenPayload().email?.split("@")[0] || "Student";

  return (
    <div className="saps-app">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo" style={{ marginBottom: 0 }}>
            <div className="logo-icon">📊</div>
            <span className="logo-text">SAPS</span>
          </div>
          <span className="view-badge student">Student View</span>
        </div>
        <div className="nav-right">
          <span className="nav-name">{displayName}</span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div className="dash-shell">
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--slate)", fontSize: 15 }}>
            Loading your dashboard…
          </div>
        ) : (
          <>
            <div className="greeting-row">
              <div>
                <div className="greeting-title">Welcome, {displayName}</div>
                <div className="greeting-sub">
                  {progress
                    ? `${progress.term} · Last updated ${fmtDate(progress.uploaded_at)}`
                    : "No academic record uploaded yet — ask your teacher."}
                </div>
              </div>
              {progress?.term && <div className="sem-badge">{progress.term}</div>}
            </div>

            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-label">Overall Marks</div>
                <div className="stat-value white">{avgMarks ? `${avgMarks}%` : "—"}</div>
                <div className="stat-sub">Across {subjectEntries.length} subjects</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Attendance</div>
                <div className={`stat-value ${progress?.attendance_pct >= 75 ? "green" : "white"}`}>
                  {progress?.attendance_pct != null ? `${progress.attendance_pct}%` : "—"}
                </div>
                <div className="stat-sub">
                  {progress?.attendance_pct != null
                    ? (progress.attendance_pct >= 75 ? "Above minimum" : "Below 75% threshold")
                    : "No data yet"}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Prediction</div>
                <div className="stat-value white">{prediction?.prediction_label || "—"}</div>
                <div className="stat-sub">
                  {prediction
                    ? `Confidence: ${Math.round(prediction.confidence_score * 100)}%`
                    : "Not generated yet"}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Generated On</div>
                <div className="stat-value white" style={{ fontSize: 18 }}>
                  {prediction ? fmtDate(prediction.generated_at) : "—"}
                </div>
                <div className="stat-sub">{prediction?.model_version || ""}</div>
              </div>
            </div>

            {prediction && (
              <div className="pred-banner">
                <div className="pred-left">
                  <div className="pred-icon">📈</div>
                  <div>
                    <div className="pred-lbl">Latest Prediction</div>
                    <div className="pred-title">{prediction.prediction_label}</div>
                    <div className="pred-conf">
                      Confidence: {Math.round(prediction.confidence_score * 100)}% · Generated {fmtDate(prediction.generated_at)}
                    </div>
                  </div>
                </div>
                <div className="model-badge">{prediction.model_version}</div>
              </div>
            )}

            {!prediction && (
              <div style={{
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "var(--radius)", padding: "16px 24px", marginBottom: 28,
                fontSize: 13, color: "#fcd34d"
              }}>
                ⏳ No prediction yet — ask your teacher to run one for you.
              </div>
            )}

            <div className="two-col">
              <div className="panel">
                <div className="panel-title">Subject-wise Marks</div>
                {subjectEntries.length === 0 ? (
                  <div style={{ color: "var(--slate)", fontSize: 13 }}>No marks uploaded yet.</div>
                ) : (
                  subjectEntries.map(([name, score]) => (
                    <div className="subject-row" key={name}>
                      <span className="subject-name">{name}</span>
                      <div className="bar-track">
                        <div className={`bar-fill ${barCls(score)}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="subject-score">{score}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="panel">
                <div className="panel-title">Prediction History</div>
                {history.length === 0 ? (
                  <div style={{ color: "var(--slate)", fontSize: 13 }}>No prediction history yet.</div>
                ) : (
                  history.map((item, i) => (
                    <div className="pred-hist-row" key={i}>
                      <div>
                        <div className="ph-sem">{item.prediction_label}</div>
                        <div className="ph-date">{fmtDate(item.generated_at)}</div>
                      </div>
                      <span className={`pill ${pillCls(item.prediction_label)}`}>{item.prediction_label}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {toast && <Toast {...toast} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// UPLOAD MODAL (CSV → JSON API calls)
// ─────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess, showToast }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: [] });

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    const headers = lines[0].split(",").map(h => h.trim());
    const reqCols = ["student_id", "term", "attendance_pct"];
    for (const col of reqCols) {
      if (!headers.includes(col)) throw new Error(`Missing required column: "${col}"`);
    }
    const subjectCols = headers.filter(h => !reqCols.includes(h));
    if (subjectCols.length === 0) throw new Error("CSV must include at least one subject column.");

    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map(v => v.trim());
      if (vals.length !== headers.length) throw new Error(`Row ${i + 2}: column count mismatch.`);
      const row = {};
      headers.forEach((h, idx) => { row[h] = vals[idx]; });
      if (isNaN(parseFloat(row.attendance_pct))) throw new Error(`Row ${i + 2}: attendance_pct must be a number.`);
      const marks = {};
      for (const s of subjectCols) {
        if (isNaN(parseFloat(row[s]))) throw new Error(`Row ${i + 2}: "${s}" must be a number.`);
        marks[s] = parseFloat(row[s]);
      }
      return { student_id: row.student_id, term: row.term, attendance_pct: parseFloat(row.attendance_pct), marks };
    });
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) { showToast("Only .csv files are supported.", "⚠️"); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setPreview(parseCSV(ev.target.result)); }
      catch (err) { showToast(err.message, "❌"); setPreview(null); }
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!preview?.length) return;
    setUploading(true);
    setProgress({ done: 0, total: preview.length, errors: [] });
    const errors = [];
    const headers = authHeaders();

    for (let i = 0; i < preview.length; i++) {
      const row = preview[i];
      try {
        const marksRes = await fetch(`${BASE_URL}/api/teacher/marks`, {
          method: "POST", headers,
          body: JSON.stringify({ student_id: row.student_id, term: row.term, marks: row.marks }),
        });
        if (!marksRes.ok) {
          const d = await marksRes.json();
          throw new Error(`Marks for ${row.student_id}: ${d.detail || marksRes.status}`);
        }
      } catch (err) {
        errors.push(err.message);
        setProgress(p => ({ ...p, done: p.done + 1, errors: [...p.errors, err.message] }));
        continue;
      }

      try {
        const attRes = await fetch(`${BASE_URL}/api/teacher/attendance`, {
          method: "POST", headers,
          body: JSON.stringify({ student_id: row.student_id, term: row.term, attendance_pct: row.attendance_pct }),
        });
        if (!attRes.ok) {
          const d = await attRes.json();
          throw new Error(`Attendance for ${row.student_id}: ${d.detail || attRes.status}`);
        }
      } catch (err) {
        errors.push(err.message);
        setProgress(p => ({ ...p, errors: [...p.errors, err.message] }));
      }

      setProgress(p => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
    if (errors.length === 0) {
      onSuccess();
    } else {
      showToast(`${preview.length - errors.length}/${preview.length} rows uploaded. See errors below.`, "⚠️");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 16,
        padding: 32, width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Upload Student Data</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--slate)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{
          background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "var(--slate)"
        }}>
          <strong style={{ color: "var(--white)" }}>Expected CSV format:</strong><br />
          <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>student_id, term, attendance_pct, Math, Science, English</code><br />
          <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>abc-123, Semester 4, 88, 82, 76, 91</code><br />
          <span style={{ marginTop: 6, display: "block" }}>Use the exact <code style={{ fontFamily: "var(--mono)" }}>user_id</code> from student registration.</span>
        </div>

        <label className="upload-zone" style={{ display: "block", cursor: "pointer" }}>
          <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} />
          <div className="upload-icon">📄</div>
          <div className="upload-label">{file ? file.name : "Click to select a .csv file"}</div>
        </label>

        {preview && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "#86efac", marginBottom: 8 }}>
              ✅ Parsed {preview.length} row(s) — subjects: {Object.keys(preview[0]?.marks || {}).join(", ")}
            </div>
            <div style={{ maxHeight: 140, overflowY: "auto" }}>
              {preview.slice(0, 5).map((r, i) => (
                <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--slate)", fontFamily: "var(--mono)" }}>
                  {r.student_id} · {r.term} · Att: {r.attendance_pct}% · {Object.entries(r.marks).map(([k, v]) => `${k}:${v}`).join(", ")}
                </div>
              ))}
              {preview.length > 5 && <div style={{ color: "var(--slate)", fontSize: 11, padding: "4px 0" }}>…and {preview.length - 5} more rows</div>}
            </div>
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--slate)" }}>
            Uploading {progress.done}/{progress.total} students…
          </div>
        )}
        {progress.errors.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 100, overflowY: "auto" }}>
            {progress.errors.map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: "#fca5a5", padding: "2px 0" }}>⚠️ {e}</div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="btn-outline" onClick={onClose} disabled={uploading} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-filled" onClick={handleUpload} disabled={!preview || uploading} style={{ flex: 1 }}>
            {uploading ? "Uploading…" : `Upload ${preview?.length || 0} row(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TEACHER DASHBOARD
// ─────────────────────────────────────────────
const TeacherDashboard = ({ onNavigate }) => {
  const [students, setStudents] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, icon) => { setToast({ msg, icon }); setTimeout(() => setToast(null), 3000); };
  const handleLogout = () => { clearToken(); onNavigate("login"); };

  const loadData = () => {
    const headers = authHeaders();
    Promise.all([
      fetch(`${BASE_URL}/api/teacher/students`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BASE_URL}/api/teacher/dashboard`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([studs, stats]) => {
      setStudents(studs || []);
      setDashStats(stats);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handlePredict = async (studentId) => {
    showToast(`Running prediction for ${studentId}…`, "🤖");
    try {
      const res = await fetch(`${BASE_URL}/api/teacher/predict?student_id=${studentId}`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed.");
      showToast(`${data.prediction_label} · ${Math.round(data.confidence_score * 100)}% confidence`, "✅");
      setStudents(prev => prev.map(s =>
        s.user_id === studentId
          ? { ...s, latest_prediction: data.prediction_label, confidence: data.confidence_score }
          : s
      ));
      // Refresh stats silently
      fetch(`${BASE_URL}/api/teacher/dashboard`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : null).then(stats => stats && setDashStats(stats));
    } catch (err) {
      showToast(err.message, "❌");
    }
  };

  const handleExport = () => {
    const rows = [
      ["Name", "User ID", "Email", "Prediction", "Confidence"],
      ...students.map(s => [
        s.name, s.user_id, s.email,
        s.latest_prediction || "—",
        s.confidence != null ? `${Math.round(s.confidence * 100)}%` : "—",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "saps-students.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded.", "💾");
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.user_id.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const dist = dashStats?.label_distribution || {};
  const teacherName = getTokenPayload().email?.split("@")[0] || "Teacher";

  return (
    <div className="saps-app">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo" style={{ marginBottom: 0 }}>
            <div className="logo-icon" style={{ background: "#166534" }}>📊</div>
            <span className="logo-text">SAPS</span>
          </div>
          <span className="view-badge teacher">Teacher View</span>
        </div>
        <div className="nav-right">
          <span className="nav-name">{teacherName}</span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div className="dash-shell">
        <div className="teacher-header">
          <div>
            <div className="teacher-title">Class Overview</div>
            <div className="teacher-sub">
              {dashStats ? `${dashStats.total_students} students enrolled · ${dashStats.students_with_predictions} predictions run` : "Loading…"}
            </div>
          </div>
          <div className="header-btns">
            <button className="btn-outline" onClick={handleExport} disabled={students.length === 0}>Export CSV</button>
            <button className="btn-filled" onClick={() => setUploadModal(true)}>＋ Upload Data</button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value white">{dashStats?.total_students ?? "—"}</div>
            <div className="stat-sub">Enrolled</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Predictions Run</div>
            <div className="stat-value white">{dashStats?.students_with_predictions ?? "—"}</div>
            <div className="stat-sub">
              {dashStats
                ? `${dashStats.total_students - dashStats.students_with_predictions} pending`
                : ""}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Marks</div>
            <div className="stat-value white">
              {dashStats?.avg_marks != null ? `${dashStats.avg_marks}%` : "—"}
            </div>
            <div className="stat-sub">Across all subjects</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">At Risk</div>
            <div className="stat-value white">{dist["At Risk"] ?? "—"}</div>
            <div className="stat-sub">Below threshold</div>
          </div>
        </div>

        <div className="teacher-layout">
          {/* LEFT — distribution + avg attendance */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel">
              <div className="panel-title">Prediction Distribution</div>
              {["Excellent", "Good", "Average", "At Risk"].map((label) => (
                <div className="dist-row" key={label}>
                  <div className="dist-label">
                    <div className="dist-dot" style={{
                      background: { Excellent: "#22c55e", Good: "#38bdf8", Average: "#f59e0b", "At Risk": "#ef4444" }[label]
                    }} />
                    {label}
                  </div>
                  <div className="dist-count">{dist[label] ?? 0}</div>
                </div>
              ))}
            </div>
            {dashStats?.avg_attendance != null && (
              <div className="panel">
                <div className="panel-title">Avg Attendance</div>
                <div className="stat-value white" style={{ fontSize: 28 }}>{dashStats.avg_attendance}%</div>
                <div className="stat-sub">Across all students</div>
              </div>
            )}
          </div>

          {/* RIGHT — student records */}
          <div className="panel">
            <div className="panel-title">Student Records</div>
            <div className="search-bar">
              <span style={{ color: "var(--slate)" }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or ID…"
              />
            </div>
            {loading ? (
              <div style={{ color: "var(--slate)", padding: "20px 0", textAlign: "center" }}>Loading students…</div>
            ) : (
              <>
                <div className="tbl-header">
                  <span>Student</span>
                  <span>Email</span>
                  <span>Prediction</span>
                  <span></span>
                </div>
                {filtered.map((s) => (
                  <div className="tbl-row" key={s.user_id}>
                    <div>
                      <div className="student-name">{s.name}</div>
                      <div className="student-id">{s.user_id}</div>
                    </div>
                    <div className="tbl-val" style={{ fontSize: 12, color: "var(--slate)" }}>{s.email}</div>
                    <span className={`pill ${pillCls(s.latest_prediction)}`}>
                      {s.latest_prediction || "Pending"}
                    </span>
                    <button className="btn-predict" onClick={() => handlePredict(s.user_id)}>
                      Predict
                    </button>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--slate)", padding: "28px 0" }}>
                    {students.length === 0 ? "No students registered yet." : "No students match your search."}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {uploadModal && (
        <UploadModal
          onClose={() => setUploadModal(false)}
          onSuccess={() => {
            setUploadModal(false);
            loadData();
            showToast("Data uploaded successfully!", "✅");
          }}
          showToast={showToast}
        />
      )}
      {toast && <Toast {...toast} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(() => {
    // If token exists and page is stored, restore session
    if (getToken() && localStorage.getItem("saps-page")) {
      return localStorage.getItem("saps-page");
    }
    return "login";
  });

  const navigate = (dest) => {
    setPage(dest);
    if (dest !== "login" && dest !== "register") {
      localStorage.setItem("saps-page", dest);
    }
  };

  return (
    <>
      <GlobalStyles />
      {page === "register" && <RegisterPage onNavigate={navigate} />}
      {page === "login"    && <LoginPage    onNavigate={navigate} />}
      {page === "student"  && <StudentDashboard onNavigate={navigate} />}
      {page === "teacher"  && <TeacherDashboard onNavigate={navigate} />}
    </>
  );
}
