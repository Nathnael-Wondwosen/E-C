import { useState } from "react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #eef1fb;
  --white:       #ffffff;
  --surface:     #f5f7ff;
  --border:      #dce2f4;
  --border-focus:#4f6ef7;
  --accent:      #3a5fff;
  --accent2:     #7c3aed;
  --accent-lt:   #edf0ff;
  --text:        #0d1630;
  --muted:       #6b7a99;
  --error:       #d93a5c;
  --font-h:      'Syne', sans-serif;
  --font-b:      'Outfit', sans-serif;
  --r:           13px;
}

html, body, #root {
  height: 100%;
  font-size: 14px;
}

body {
  font-family: var(--font-b);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── BG DECORATION ── */
.bg {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.blob {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: .6;
}
.b1 { width: 520px; height: 440px; top: -180px; left: -160px;
  background: radial-gradient(circle, #c5d2ff 0%, transparent 65%); }
.b2 { width: 440px; height: 380px; bottom: -140px; right: -120px;
  background: radial-gradient(circle, #d5c5ff 0%, transparent 65%); }
.b3 { width: 260px; height: 240px; top: 42%; left: 50%;
  background: radial-gradient(circle, #bcd9fe 0%, transparent 65%); }
.dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(58,95,255,.13) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}

/* ── LAYOUT ── */
.page {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px 16px;
}

/* ── CARD ── */
.card {
  width: 100%;
  max-width: 1020px;
  display: grid;
  grid-template-columns: 360px 1fr;
  background: var(--white);
  border-radius: 22px;
  border: 1px solid var(--border);
  box-shadow: 0 12px 48px rgba(58,95,255,.1), 0 2px 8px rgba(0,0,0,.05);
  overflow: hidden;
  animation: up .45s cubic-bezier(.22,1,.36,1) both;
}
@keyframes up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── LEFT PANEL ── */
.left {
  background: linear-gradient(158deg, #1f3aa8 0%, #3357dc 52%, #5b32c9 100%);
  padding: 34px 28px;
  display: flex; flex-direction: column;
  color: #fff;
  position: relative; overflow: hidden;
}
.left::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(circle at 18% 14%, rgba(255,255,255,.16) 0%, transparent 48%),
    radial-gradient(circle at 82% 86%, rgba(0,0,0,.1) 0%, transparent 48%);
}
.left > * { position: relative; z-index: 1; }

.ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,.1); pointer-events: none; }
.rg1 { width: 240px; height: 240px; top: -80px; right: -72px; }
.rg2 { width: 160px; height: 160px; top: -28px; right: -24px; }
.rg3 { width: 300px; height: 300px; bottom: -110px; left: -80px; }

.logo {
  display: flex; align-items: center; gap: 8px; margin-bottom: 34px;
}
.logo-ic {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
}
.logo span { font-family: var(--font-h); font-size: 15px; font-weight: 700; }

.l-tag {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22);
  font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  margin-bottom: 14px;
}
.l-h {
  font-family: var(--font-h); font-size: 23px; font-weight: 800;
  line-height: 1.18; margin-bottom: 12px;
}
.l-h em { font-style: normal; opacity: .7; }
.l-p { font-size: 12.5px; line-height: 1.7; opacity: .72; margin-bottom: 32px; }

.feats { display: flex; flex-direction: column; gap: 10px; }
.feat {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px; border-radius: 11px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.1);
}
.feat-box {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.18);
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.feat-txt strong { display: block; font-size: 12px; font-weight: 600; margin-bottom: 1px; }
.feat-txt span   { font-size: 11px; opacity: .62; line-height: 1.5; }

.l-foot { margin-top: auto; padding-top: 32px; }
.trust { display: flex; align-items: center; gap: 9px; }
.avs { display: flex; }
.av {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; margin-left: -6px;
}
.av:first-child { margin-left: 0; }
.trust-txt { font-size: 11px; opacity: .78; line-height: 1.45; }
.trust-txt b { opacity: 1; }

/* ── RIGHT PANEL ── */
.right {
  padding: 36px 36px;
  background: var(--white);
  overflow-y: auto;
  max-height: 100vh;
}

.f-head { margin-bottom: 22px; }
.f-eye {
  font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 6px;
}
.f-title {
  font-family: var(--font-h); font-size: 21px; font-weight: 800;
  color: var(--text); letter-spacing: -.3px; margin-bottom: 4px;
}
.f-sub { font-size: 12.5px; color: var(--muted); }

/* Role pills */
.role-sec { margin-bottom: 18px; }
.sec-lbl {
  font-size: 10.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--muted);
}
.role-row {
  margin-top: 0;
  display: flex; align-items: center; gap: 10px;
}
.role-text {
  font-family: var(--font-b); font-size: 13px; font-weight: 500; color: var(--text);
  white-space: nowrap;
}
.role-opts {
  flex: 1;
  display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
}
.rr {
  border: 1.5px solid var(--border); border-radius: 11px;
  padding: 9px 10px; cursor: pointer; background: var(--surface);
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-b); font-size: 12.5px; font-weight: 600;
  color: var(--muted); transition: all .18s;
}
.rr:hover { border-color: #aabcff; background: #f2f4ff; color: var(--text); }
.rr input { margin: 0; accent-color: var(--accent); }
.rr.on {
  border-color: var(--accent); background: var(--accent-lt);
  color: var(--accent);
  box-shadow: 0 0 0 3px rgba(58,95,255,.09);
}
.rr-ic { font-size: 15px; line-height: 1; }
.role-note { margin-top: 6px; font-size: 11px; color: var(--muted); }
.role-note b { color: var(--accent); }

/* Grid rows */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.g1 { margin-bottom: 10px; }

/* Field */
.fld { display: flex; flex-direction: column; gap: 5px; }
.lbl {
  font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  color: var(--muted);
}
.iw { position: relative; }
.ic {
  position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
  font-size: 13px; pointer-events: none; opacity: .45;
}
.inp {
  width: 100%;
  padding: 10px 11px 10px 36px;
  border: 1.5px solid var(--border); border-radius: var(--r);
  background: var(--surface);
  font-family: var(--font-b); font-size: 13px;
  color: var(--text); outline: none;
  transition: border-color .17s, background .17s, box-shadow .17s;
}
.inp::placeholder { color: #b4bdd4; }
.inp:focus {
  border-color: var(--border-focus);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79,110,247,.1);
}
select.inp { cursor: pointer; appearance: none; }
select.inp option { background: #fff; }

.eye {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--muted);
  opacity: .65; padding: 3px; transition: opacity .15s; line-height: 0;
}
.eye:hover { opacity: 1; }

/* Seller slide */
.seller-slide { overflow: hidden; transition: max-height .33s cubic-bezier(.22,1,.36,1), opacity .26s; }
.seller-slide.open { max-height: 110px; opacity: 1; }
.seller-slide.shut { max-height: 0;    opacity: 0; }

/* Error */
.err {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 13px; border-radius: 10px; margin-bottom: 10px;
  background: #fff5f8; border: 1.5px solid #ffc5d0;
  color: var(--error); font-size: 12px;
  animation: jolt .25s;
}
@keyframes jolt {
  0%,100%{transform:translateX(0)} 30%{transform:translateX(-4px)} 70%{transform:translateX(3px)}
}

/* Terms */
.terms {
  font-size: 11px; color: var(--muted); margin-bottom: 13px; margin-top: 12px;
  line-height: 1.65;
}
.terms a { color: var(--accent); text-decoration: none; }

/* Submit */
.sub-btn {
  width: 100%; padding: 12px;
  border: none; border-radius: var(--r);
  font-family: var(--font-h); font-size: 13.5px; font-weight: 700; letter-spacing: .02em;
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform .14s, box-shadow .14s, filter .14s;
}
.sub-btn:not(:disabled) {
  background: linear-gradient(115deg, #253fc8, #3a5fff 50%, #6d28d9);
  color: #fff;
  box-shadow: 0 5px 22px rgba(58,95,255,.32);
}
.sub-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 9px 28px rgba(58,95,255,.4);
  filter: brightness(1.04);
}
.sub-btn:not(:disabled):active { transform: translateY(0); }
.sub-btn:disabled { background: #e8eaf2; color: #a0aabf; cursor: not-allowed; }
.shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.22) 50%, transparent 62%);
  transform: translateX(-120%); transition: transform .5s;
}
.sub-btn:hover .shimmer { transform: translateX(120%); }

/* OR divider */
.or { display: flex; align-items: center; gap: 9px; margin: 12px 0; }
.or-ln { flex: 1; height: 1px; background: var(--border); }
.or-tx { font-size: 11px; color: var(--muted); white-space: nowrap; }

/* Google btn */
.g-btn {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--r);
  background: var(--surface);
  font-family: var(--font-b); font-size: 13px; font-weight: 500;
  color: var(--text); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .17s, border-color .17s, box-shadow .17s;
}
.g-btn:hover {
  background: #fff; border-color: #aabcff;
  box-shadow: 0 3px 12px rgba(58,95,255,.09);
}

/* Footer */
.foot { margin-top: 16px; text-align: center; font-size: 12.5px; color: var(--muted); }
.foot a { color: var(--accent); font-weight: 600; text-decoration: none; }
.foot a:hover { text-decoration: underline; }

/* ── RESPONSIVE ── */
@media (max-width: 780px) {
  .card { grid-template-columns: 1fr; }
  .left { display: none; }
  .right { padding: 28px 22px; }
  .role-row { flex-direction: column; align-items: stretch; gap: 7px; }
  .role-text { white-space: normal; }
}
@media (max-width: 480px) {
  .g2 { grid-template-columns: 1fr; }
  .right { padding: 22px 14px; }
}
`;

const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const GIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", confirmPassword: "",
    userType: "buyer", companyName: "", businessType: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handle = e => set(e.target.name, e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.userType === "seller" && !form.companyName) { setError("Company name is required for sellers."); return; }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false); setDone(true);
  };

  if (done) return (
    <>
      <style>{STYLES}</style>
      <div className="bg"><div className="blob b1"/><div className="blob b2"/><div className="blob b3"/><div className="dots"/></div>
      <div className="page" style={{ flexDirection: "column", gap: 14, textAlign: "center" }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: "linear-gradient(135deg,#3a5fff,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", boxShadow: "0 8px 28px rgba(58,95,255,.3)", margin: "0 auto" }}>✓</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#0d1630" }}>Account created!</div>
        <div style={{ fontSize: 13.5, color: "#6b7a99" }}>Welcome, <strong style={{ color: "#3a5fff" }}>{form.name}</strong>. You're all set.</div>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>

      <div className="bg">
        <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
        <div className="dots"/>
      </div>

      <div className="page">
        <div className="card">

          {/* LEFT */}
          <aside className="left">
            <div className="ring rg1"/><div className="ring rg2"/><div className="ring rg3"/>
            <div className="logo">
              <div className="logo-ic">⬡</div>
              <span>TradeEthiopia</span>
            </div>
            <span className="l-tag">Join the platform</span>
            <h1 className="l-h">Commerce,<br/><em>reimagined</em><br/>for Ethiopia.</h1>
            <p className="l-p">Connect with verified buyers and sellers. One smart platform for modern trade.</p>
            <div className="feats">
              {[
                { ic:"🛒", t:"Smart Buying",    d:"Browse verified suppliers & order confidently." },
                { ic:"📦", t:"Seller Dashboard", d:"Manage listings, track orders & grow revenue." },
                { ic:"🔐", t:"Secure by default", d:"Role-aware auth with full data protection." },
              ].map(f => (
                <div className="feat" key={f.t}>
                  <div className="feat-box">{f.ic}</div>
                  <div className="feat-txt"><strong>{f.t}</strong><span>{f.d}</span></div>
                </div>
              ))}
            </div>
            <div className="l-foot">
              <div className="trust">
                <div className="avs">
                  {["🧑","👩","👨","🧕","👦"].map((e,i) => <div className="av" key={i}>{e}</div>)}
                </div>
                <div className="trust-txt"><b>2,400+ businesses</b><br/>joined this month</div>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="right">
            <div className="f-head">
              <div className="f-eye">Account Setup</div>
              <h2 className="f-title">Create your account</h2>
              <p className="f-sub">Get started in under 2 minutes.</p>
            </div>

            <form onSubmit={submit}>

              {/* Role */}
              <div className="role-sec">
                <div className="role-row">
                  <div className="role-text">I want to</div>
                  <div className="role-opts">
                    <label className={`rr ${form.userType==="buyer"?"on":""}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="buyer"
                        checked={form.userType==="buyer"}
                        onChange={handle}
                      />
                      <span className="rr-ic">B</span>
                      <span>Buy Products</span>
                    </label>
                    <label className={`rr ${form.userType==="seller"?"on":""}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="seller"
                        checked={form.userType==="seller"}
                        onChange={handle}
                      />
                      <span className="rr-ic">S</span>
                      <span>Sell Products</span>
                    </label>
                  </div>
                </div>
                <p className="role-note">Role: <b>{form.userType}</b> - applies to Google sign-up too</p>
              </div>

              {/* Name + Email */}
              <div className="g2">
                <div className="fld">
                  <label className="lbl">Full Name</label>
                  <div className="iw">
                    <span className="ic">👤</span>
                    <input className="inp" name="name" type="text" placeholder="Your full name"
                      value={form.name} onChange={handle} required/>
                  </div>
                </div>
                <div className="fld">
                  <label className="lbl">Email</label>
                  <div className="iw">
                    <span className="ic">✉️</span>
                    <input className="inp" name="email" type="email" placeholder="you@email.com"
                      value={form.email} onChange={handle} required/>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="g1">
                <div className="fld">
                  <label className="lbl">Phone Number</label>
                  <div className="iw">
                    <span className="ic">📱</span>
                    <input className="inp" name="phone" type="tel" placeholder="+251 900 000 000"
                      value={form.phone} onChange={handle} required/>
                  </div>
                </div>
              </div>

              {/* Seller fields */}
              <div className={`seller-slide ${form.userType==="seller"?"open":"shut"}`}>
                <div className="g2" style={{marginBottom:10}}>
                  <div className="fld">
                    <label className="lbl">Company Name</label>
                    <div className="iw">
                      <span className="ic">🏢</span>
                      <input className="inp" name="companyName" type="text" placeholder="Your company"
                        value={form.companyName} onChange={handle}
                        required={form.userType==="seller"}/>
                    </div>
                  </div>
                  <div className="fld">
                    <label className="lbl">Business Type</label>
                    <div className="iw">
                      <span className="ic" style={{fontSize:11}}>▾</span>
                      <select className="inp" name="businessType" value={form.businessType}
                        onChange={handle} required={form.userType==="seller"} style={{paddingLeft:30}}>
                        <option value="">Select type</option>
                        <option>Manufacturer</option>
                        <option>Distributor</option>
                        <option>Wholesaler</option>
                        <option>Retailer</option>
                        <option>Service Provider</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="g2">
                <div className="fld">
                  <label className="lbl">Password</label>
                  <div className="iw">
                    <span className="ic">🔒</span>
                    <input className="inp" name="password" type={showPw?"text":"password"}
                      placeholder="Min. 8 characters" value={form.password} onChange={handle}
                      required style={{paddingRight:36}}/>
                    <button type="button" className="eye" onClick={() => setShowPw(p=>!p)}>
                      {showPw ? <EyeOff/> : <EyeOn/>}
                    </button>
                  </div>
                </div>
                <div className="fld">
                  <label className="lbl">Confirm Password</label>
                  <div className="iw">
                    <span className="ic">🔒</span>
                    <input className="inp" name="confirmPassword" type={showPw?"text":"password"}
                      placeholder="Repeat password" value={form.confirmPassword}
                      onChange={handle} required/>
                  </div>
                </div>
              </div>

              {error && <div className="err">⚠️ {error}</div>}

              <p className="terms">
                By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>

              <button type="submit" className="sub-btn" disabled={loading}>
                <div className="shimmer"/>
                {loading ? "Creating your account…" : `Create Account as ${form.userType === "buyer" ? "Buyer" : "Seller"}`}
              </button>

              <div className="or">
                <div className="or-ln"/><span className="or-tx">or continue with Google as {form.userType}</span><div className="or-ln"/>
              </div>

              <button type="button" className="g-btn">
                <GIcon/> Continue with Google
              </button>
            </form>

            <div className="foot">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

