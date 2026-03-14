// ─────────────────────────────────────────────
// src/pages/ProfilePage.jsx
// Shows: user avatar, name, email, role/position
// Actions: edit name, change password (frontend),
//          logout (sends back to login)
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// Role display config
const roleConfig = {
  admin:  { label:'Administrator',      color:'#388bfd', bg:'rgba(56,139,253,0.12)',  border:'rgba(56,139,253,0.25)'  },
  staff:  { label:'Warehouse Staff',    color:'#4ade80', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.25)'  },
  viewer: { label:'Read-Only Analyst',  color:'#c084fc', bg:'rgba(192,132,252,0.12)', border:'rgba(192,132,252,0.25)' },
};

// Permission list per role
const permissions = {
  admin:  ['View Dashboard','Manage Products','Record Operations','View Move History','Edit Settings','Manage Users'],
  staff:  ['View Dashboard','Manage Products','Record Operations','View Move History'],
  viewer: ['View Dashboard','View Products','View Move History'],
};

const inp = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-all";
const inpStyle = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };
const lbl = "text-xs text-slate-500 uppercase tracking-wider mb-1.5 block";

export default function ProfilePage({ user, setUser, onLogout, addToast }) {
  // Editable fields
  const [editMode,  setEditMode]  = useState(false);
  const [name,      setName]      = useState(user?.name     || '');
  const [position,  setPosition]  = useState(user?.position || '');

  // Change password fields
  const [showPwForm, setShowPwForm] = useState(false);
  const [oldPw,      setOldPw]     = useState('');
  const [newPw,      setNewPw]     = useState('');
  const [confirmPw,  setConfirmPw] = useState('');
  const [pwError,    setPwError]   = useState('');

  const rc = roleConfig[user?.role] || roleConfig.staff;
  const perms = permissions[user?.role] || permissions.viewer;

  // Save profile changes
  const saveProfile = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name, position }
      });
      if (error) throw error;
      
      setUser(prev => ({ ...prev, name, position }));
      setEditMode(false);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6)    { setPwError('New password must be 6+ characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.');             return; }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      setOldPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
      addToast('Password updated successfully', 'success');
    } catch (err) {
      setPwError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast('Signed out successfully', 'info');
    setTimeout(onLogout, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">

      {/* ── Heading ── */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Profile card ── */}
      <div className="glass rounded-xl p-6 animate-fade-up delay-100">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background:'linear-gradient(135deg,#388bfd,#a855f7)', boxShadow:'0 0 20px rgba(56,139,253,0.3)' }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-emerald-400"/>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editMode ? (
              /* ── Edit mode fields ── */
              <div className="flex flex-col gap-3">
                <div>
                  <label className={lbl}>Display Name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} className={inp} style={inpStyle}/>
                </div>
                <div>
                  <label className={lbl}>Position / Title</label>
                  <input value={position} onChange={e=>setPosition(e.target.value)} placeholder="e.g. Warehouse Manager" className={inp} style={inpStyle}/>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={saveProfile}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                    style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)' }}>
                    Save
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                    style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── Display mode ── */
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display text-lg font-bold text-white">{name || 'No name set'}</h2>
                  <button onClick={() => setEditMode(true)}
                    className="text-slate-600 hover:text-blue-400 transition-colors cursor-pointer p-1 rounded hover:bg-blue-500/10">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-slate-400 mb-2">{position || 'No position set'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </>
            )}
          </div>
        </div>

        {/* Role + position badge row */}
        <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <span className="badge" style={{ background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
            {rc.label}
          </span>
          <span className="badge" style={{ background:'rgba(255,255,255,0.05)', color:'#94a3b8' }}>
            {user?.role?.toUpperCase()}
          </span>
          <span className="badge" style={{ background:'rgba(34,197,94,0.08)', color:'#4ade80' }}>
            ● Online
          </span>
        </div>
      </div>

      {/* ── Permissions card ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-150">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Access Permissions</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Show all possible permissions, tick or cross based on role */}
          {['View Dashboard','Manage Products','Record Operations','View Move History','Edit Settings','Manage Users'].map(p => {
            const has = perms.includes(p);
            return (
              <div key={p} className="flex items-center gap-2 py-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  has ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/50 text-slate-600'
                }`}>
                  {has
                    ? <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    : <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  }
                </div>
                <span className={`text-xs ${has ? 'text-slate-300' : 'text-slate-600'}`}>{p}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Security / change password ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-white text-sm">Security</h3>
          <button onClick={() => setShowPwForm(v => !v)}
            className="text-xs text-blue-500 hover:text-blue-400 cursor-pointer transition-colors">
            {showPwForm ? 'Cancel' : 'Change password'}
          </button>
        </div>

        {showPwForm ? (
          <form onSubmit={changePassword} className="flex flex-col gap-3">
            <div>
              <label className={lbl}>Current Password</label>
              <input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="••••••••" className={inp} style={inpStyle}/>
            </div>
            <div>
              <label className={lbl}>New Password</label>
              <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min. 6 characters" className={inp} style={inpStyle}/>
            </div>
            <div>
              <label className={lbl}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Repeat new password" className={inp} style={inpStyle}/>
            </div>
            {pwError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{pwError}</p>}
            <button type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-medium text-white cursor-pointer mt-1"
              style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)' }}>
              Update Password
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-500">Password last changed: never (demo mode)</p>
        )}
      </div>

      {/* ── Danger zone / logout ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-250"
        style={{ border:'1px solid rgba(239,68,68,0.15)' }}>
        <h3 className="font-display font-semibold text-white text-sm mb-1">Sign Out</h3>
        <p className="text-xs text-slate-500 mb-4">This will end your current session and return to the login screen.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-red-400 cursor-pointer hover:bg-red-500/10 transition-all"
          style={{ border:'1px solid rgba(239,68,68,0.25)' }}>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 010 1.5h-2.5A1.75 1.75 0 012 13.25V2.75zm10.44 4.5H6.75a.75.75 0 000 1.5h5.69l-1.97 1.97a.75.75 0 101.06 1.06l3.25-3.25a.75.75 0 000-1.06l-3.25-3.25a.75.75 0 10-1.06 1.06l1.97 1.97z" clipRule="evenodd"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
