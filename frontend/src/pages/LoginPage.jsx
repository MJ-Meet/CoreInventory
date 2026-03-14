// ─────────────────────────────────────────────
// src/pages/LoginPage.jsx
// Features:
//   • Sign In  (validates against mockUsers)
//   • Sign Up  (register new account form)
//   • Forgot Password (shows reset modal)
//   • Two-Step OTP Verification (simulated)
//   • Role selector
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { mockUsers } from '../data/mockData';

// Role options shown on sign-in
const roles = [
  { value:'admin',  label:'Admin',  desc:'Full access'    },
  { value:'staff',  label:'Staff',  desc:'Ops & products' },
  { value:'viewer', label:'Viewer', desc:'Read only'      },
];

// ── Shared input style (reused across all forms) ──
const inp = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-all";
const inpStyle = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };
const lbl = "text-xs text-slate-500 uppercase tracking-wider mb-1.5 block";

export default function LoginPage({ onLogin }) {
  // ── Which screen is active ──
  // 'signin' | 'signup' | 'otp' | 'forgot'
  const [screen, setScreen] = useState('signin');

  // ── Sign-in form state ──
  const [email,    setEmail]    = useState('admin@stockiq.in');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('admin');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // ── Sign-up form state ──
  const [suName,  setSuName]  = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPw,    setSuPw]    = useState('');
  const [suRole,  setSuRole]  = useState('staff');
  const [suErr,   setSuErr]   = useState('');

  // ── OTP state (simulated 2-step) ──
  const [otpCode,    setOtpCode]    = useState('');
  const [otpError,   setOtpError]   = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  // Simulated OTP always "123456"
  const FAKE_OTP = '123456';

  // ── Forgot password state ──
  const [fpEmail,  setFpEmail]  = useState('');
  const [fpStep,   setFpStep]   = useState('email'); // 'email' | 'otp' | 'success'
  const [fpOtp,    setFpOtp]    = useState('');
  const [fpNewPw,  setFpNewPw]  = useState('');
  const [fpError,  setFpError]  = useState('');

  // ────────────────────────────────────────────
  // SIGN IN – validate credentials, then show OTP
  // ────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // In a real app, you might fetch user profile or roles from a table
      // For now, we'll keep the mock role selection and pass the supabase user
      setPendingUser({ ...data.user, role });
      
      // If the user wants OTP for every login, we keep it simulated or implement real MFA
      // For now, let's keep the user's requested flow of OTP for reset
      // and let's assume direct login for now to make it "connected to supabase"
      onLogin({ ...data.user, role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // OTP VERIFY – confirm the simulated OTP code
  // ────────────────────────────────────────────
  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpCode !== FAKE_OTP) {
      setOtpError('Incorrect OTP. Try 123456 (demo).');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLogin(pendingUser); // passes user up to App.jsx
    }, 800);
  };

  // ────────────────────────────────────────────
  // SIGN UP – register new account (frontend only)
  // ────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!suName || !suEmail || !suPw) { setSuErr('All fields are required.'); return; }
    if (suPw.length < 6)              { setSuErr('Password must be at least 6 characters.'); return; }
    setSuErr(''); setLoading(true);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: suEmail,
        password: suPw,
        options: {
          data: {
            full_name: suName,
            role: suRole,
          }
        }
      });

      if (signUpError) throw signUpError;

      alert('Registration successful! Please check your email for verification.');
      setEmail(suEmail);
      setScreen('signin');
    } catch (err) {
      setSuErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // FORGOT PASSWORD – simulate sending OTP
  // ────────────────────────────────────────────
  const handleForgotPwSendOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Enter your email address.'); return; }
    setFpError(''); setLoading(true);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(fpEmail);
      if (resetError) throw resetError;
      
      setFpStep('otp');
    } catch (err) {
      setFpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPwReset = async (e) => {
    e.preventDefault();
    if (!fpOtp) { setFpError('Enter the OTP code.'); return; }
    if (fpNewPw.length < 6) { setFpError('Password must be at least 6 characters.'); return; }
    setFpError(''); setLoading(true);
    
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: fpEmail,
        token: fpOtp,
        type: 'recovery',
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: fpNewPw,
      });
      if (updateError) throw updateError;

      setFpStep('success');
    } catch (err) {
      setFpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared glowing orb background ──
  const OrbsBg = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div style={{ position:'absolute', top:'-10%', left:'20%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(56,139,253,0.07) 0%,transparent 70%)' }}/>
      <div style={{ position:'absolute', bottom:'-5%', right:'15%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.05) 0%,transparent 70%)' }}/>
    </div>
  );

  // ── Logo block (shared across screens) ──
  const Logo = () => (
    <div className="text-center mb-7 animate-fade-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ background:'linear-gradient(135deg,#388bfd 0%,#1e5fa8 100%)', boxShadow:'0 0 32px rgba(56,139,253,0.28)' }}>
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v2H2V5zM2 9h20l-2.15 10.73A2 2 0 0117.88 21H6.12a2 2 0 01-1.97-1.27L2 9z"/>
        </svg>
      </div>
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">StockIQ</h1>
      <p className="text-slate-500 text-sm mt-1">Inventory Management System</p>
    </div>
  );

  // ════════════════════════════════════════════
  // RENDER – switch between screens
  // ════════════════════════════════════════════
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      <OrbsBg />

      <div className="w-full max-w-sm relative z-10">
        <Logo />

        {/* ──────────── SIGN IN SCREEN ──────────── */}
        {screen === 'signin' && (
          <div className="glass rounded-2xl p-7 animate-fade-up delay-100">
            <h2 className="font-display text-base font-semibold text-white mb-5">Sign in to continue</h2>

            {/* Role selector */}
            <div className="mb-5">
              <label className={lbl}>Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className="py-2 px-2 rounded-lg text-center transition-all duration-200 cursor-pointer"
                    style={role === r.value
                      ? { background:'rgba(56,139,253,0.12)', border:'1px solid rgba(56,139,253,0.3)' }
                      : { border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p className={`text-xs font-medium ${role===r.value?'text-blue-300':'text-slate-400'}`}>{r.label}</p>
                    <p className={`text-[10px] mt-0.5 ${role===r.value?'text-blue-500':'text-slate-600'}`}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@company.com" className={inp} style={inpStyle}/>
              </div>

              {/* Password */}
              <div>
                <label className={lbl}>Password</label>
                <div className="relative">
                  <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••" className={`${inp} pr-10`} style={inpStyle}/>
                  {/* Show/hide toggle */}
                  <button type="button" onClick={()=>setShowPw(p=>!p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                    {showPw
                      ? <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd"/><path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/></svg>
                      : <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer" onClick={()=>setRememberMe(v=>!v)}>
                  <div className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                    style={{ borderColor:'rgba(255,255,255,0.15)', background: rememberMe ? 'rgba(56,139,253,0.25)':'rgba(255,255,255,0.04)' }}>
                    {rememberMe && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#388bfd" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <span className="text-xs text-slate-500">Remember me</span>
                </label>
                {/* Forgot password link → switch screen */}
                <button type="button" onClick={()=>{ setFpStep('email'); setFpEmail(''); setFpOtp(''); setFpNewPw(''); setFpError(''); setScreen('forgot'); }}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

              {/* Demo credentials hint */}
              <p className="text-[10px] text-slate-600 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                Demo: admin@stockiq.in / admin123
              </p>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: loading ? 'rgba(56,139,253,0.5)' : 'linear-gradient(135deg,#388bfd,#1e5fa8)', boxShadow:'0 0 20px rgba(56,139,253,0.22)' }}>
                {loading
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>Verifying…</>
                  : 'Sign In →'
                }
              </button>
            </form>

            {/* Switch to sign-up */}
            <p className="text-center text-xs text-slate-600 mt-4">
              No account?{' '}
              <button onClick={()=>setScreen('signup')} className="text-blue-500 hover:text-blue-400 cursor-pointer">
                Create one
              </button>
            </p>
          </div>
        )}

        {/* ──────────── OTP / 2-STEP VERIFICATION ──────────── */}
        {screen === 'otp' && (
          <div className="glass rounded-2xl p-7 animate-fade-up delay-100">
            {/* Mail icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-5"
              style={{ background:'rgba(56,139,253,0.12)', border:'1px solid rgba(56,139,253,0.2)' }}>
              <svg viewBox="0 0 20 20" fill="#388bfd" className="w-6 h-6">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
              </svg>
            </div>

            <h2 className="font-display text-base font-semibold text-white text-center mb-1">Check your email</h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              We sent a 6-digit OTP to <span className="text-slate-300">{pendingUser?.email}</span>
              <br/><span className="text-slate-600">(Demo OTP: 123456)</span>
            </p>

            <form onSubmit={handleOtpVerify} className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Enter OTP</label>
                {/* Big OTP input */}
                <input
                  type="text" maxLength={6} value={otpCode}
                  onChange={e=>setOtpCode(e.target.value.replace(/\D/g,''))}
                  placeholder="• • • • • •"
                  className="w-full px-3.5 py-3 rounded-lg text-xl text-white text-center font-mono placeholder-slate-700 tracking-[0.5em] transition-all"
                  style={inpStyle}
                  autoFocus
                />
              </div>

              {otpError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{otpError}</p>}

              <button type="submit" disabled={loading || otpCode.length < 6}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)', boxShadow:'0 0 20px rgba(56,139,253,0.22)' }}>
                {loading
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>Verifying…</>
                  : 'Verify & Login'
                }
              </button>
            </form>

            <button onClick={()=>setScreen('signin')} className="mt-4 w-full text-center text-xs text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">
              ← Back to sign in
            </button>
          </div>
        )}

        {/* ──────────── SIGN UP SCREEN ──────────── */}
        {screen === 'signup' && (
          <div className="glass rounded-2xl p-7 animate-fade-up delay-100">
            <h2 className="font-display text-base font-semibold text-white mb-5">Create account</h2>

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Full Name</label>
                <input type="text" value={suName} onChange={e=>setSuName(e.target.value)}
                  placeholder="Your name" className={inp} style={inpStyle}/>
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={suEmail} onChange={e=>setSuEmail(e.target.value)}
                  placeholder="you@company.com" className={inp} style={inpStyle}/>
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" value={suPw} onChange={e=>setSuPw(e.target.value)}
                  placeholder="Min. 6 characters" className={inp} style={inpStyle}/>
              </div>
              {/* Role */}
              <div>
                <label className={lbl}>Role</label>
                <select value={suRole} onChange={e=>setSuRole(e.target.value)}
                  className={`${inp} cursor-pointer`} style={{ ...inpStyle, background:'rgba(255,255,255,0.04)' }}>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {suErr && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{suErr}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)', boxShadow:'0 0 20px rgba(56,139,253,0.22)' }}>
                {loading
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>Creating…</>
                  : 'Create Account'
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 mt-4">
              Already have one?{' '}
              <button onClick={()=>setScreen('signin')} className="text-blue-500 hover:text-blue-400 cursor-pointer">
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ──────────── FORGOT PASSWORD SCREEN ──────────── */}
        {screen === 'forgot' && (
          <div className="glass rounded-2xl p-7 animate-fade-up delay-100">
            {fpStep === 'email' && (
              <>
                <h2 className="font-display text-base font-semibold text-white mb-2">Reset password</h2>
                <p className="text-xs text-slate-500 mb-5">
                  Enter your email and we'll send a 6-digit OTP to reset your password.
                </p>
                <form onSubmit={handleForgotPwSendOtp} className="flex flex-col gap-4">
                  <div>
                    <label className={lbl}>Email</label>
                    <input type="email" value={fpEmail} onChange={e=>setFpEmail(e.target.value)}
                      placeholder="you@company.com" className={inp} style={inpStyle}/>
                  </div>
                  {fpError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{fpError}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)' }}>
                    {loading
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>Sending…</>
                      : 'Send Reset OTP'
                    }
                  </button>
                </form>
              </>
            )}

            {fpStep === 'otp' && (
              <>
                <h2 className="font-display text-base font-semibold text-white mb-2">Check your email</h2>
                <p className="text-xs text-slate-500 mb-5">
                  Enter the 6-digit OTP sent to <span className="text-slate-300">{fpEmail}</span> and your new password. (Demo OTP: 123456)
                </p>
                <form onSubmit={handleForgotPwReset} className="flex flex-col gap-4">
                  <div>
                    <label className={lbl}>OTP Code</label>
                    <input type="text" maxLength={6} value={fpOtp} onChange={e=>setFpOtp(e.target.value.replace(/\D/g,''))}
                      placeholder="123456" className={`${inp} tracking-[0.2em] font-mono`} style={inpStyle}/>
                  </div>
                  <div>
                    <label className={lbl}>New Password</label>
                    <input type="password" value={fpNewPw} onChange={e=>setFpNewPw(e.target.value)}
                      placeholder="Minimum 6 characters" className={inp} style={inpStyle}/>
                  </div>
                  {fpError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{fpError}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)' }}>
                    {loading
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>Verifying…</>
                      : 'Reset Password'
                    }
                  </button>
                </form>
              </>
            )}

            {fpStep === 'success' && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)' }}>
                  <svg viewBox="0 0 20 20" fill="#4ade80" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                </div>
                <h3 className="font-display font-semibold text-white mb-2">Password Reset!</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Your password has been successfully updated.
                </p>
              </div>
            )}
            <button onClick={()=>setScreen('signin')} className="mt-2 w-full text-center text-xs text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">
              ← Back to sign in
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-700 mt-5 animate-fade-up delay-300">
          Hackathon Demo · StockIQ IMS v2.0
        </p>
      </div>
    </div>
  );
}
