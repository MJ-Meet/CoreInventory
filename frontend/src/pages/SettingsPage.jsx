// ─────────────────────────────────────────────
// src/pages/SettingsPage.jsx
// Shows warehouses with addresses, capacity bars,
// manager info, and an edit modal per warehouse.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { mockWarehouses } from '../data/mockData';

// Capacity bar component
function CapacityBar({ used, capacity }) {
  const pct = Math.round((used / capacity) * 100);
  const color = pct > 80 ? '#f87171' : pct > 60 ? '#fbbf24' : '#4ade80';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
        <span>Capacity</span>
        <span style={{ color }}>{pct}% used ({used}/{capacity})</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width:`${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

const inp = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-all";
const inpStyle = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };
const lbl = "text-xs text-slate-500 uppercase tracking-wider mb-1.5 block";

export default function SettingsPage({ addToast }) {
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [editingWh, setEditingWh]   = useState(null); // warehouse being edited
  const [editForm,  setEditForm]    = useState({});

  // Open edit modal pre-filled with selected warehouse data
  const openEdit = (wh) => {
    setEditingWh(wh.id);
    setEditForm({ ...wh });
  };

  // Save warehouse changes (frontend-only state update)
  const saveEdit = () => {
    setWarehouses(prev => prev.map(w => w.id === editingWh ? { ...editForm } : w));
    setEditingWh(null);
    addToast('Warehouse settings saved', 'success');
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Heading ── */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage warehouse locations and configuration</p>
      </div>

      {/* ── App settings card ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-100">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Application Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low stock threshold */}
          <div>
            <label className={lbl}>Default Low Stock Threshold (%)</label>
            <input type="number" defaultValue={20} className={inp} style={inpStyle}/>
            <p className="text-[10px] text-slate-600 mt-1">Products below this % of min qty trigger alerts</p>
          </div>
          {/* Default warehouse */}
          <div>
            <label className={lbl}>Default Warehouse</label>
            <select className={`${inp} cursor-pointer`} style={{ ...inpStyle, background:'rgba(255,255,255,0.04)' }}>
              {warehouses.map(w => <option key={w.id}>{w.name}</option>)}
            </select>
          </div>
          {/* Currency */}
          <div>
            <label className={lbl}>Currency</label>
            <select className={`${inp} cursor-pointer`} style={{ ...inpStyle, background:'rgba(255,255,255,0.04)' }}>
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          {/* Date format */}
          <div>
            <label className={lbl}>Date Format</label>
            <select className={`${inp} cursor-pointer`} style={{ ...inpStyle, background:'rgba(255,255,255,0.04)' }}>
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => addToast('App settings saved','success')}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)', boxShadow:'0 0 12px rgba(56,139,253,0.2)' }}>
            Save Settings
          </button>
        </div>
      </div>

      {/* ── Warehouse cards ── */}
      <div className="animate-fade-up delay-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white text-sm">Warehouse Locations</h3>
          <button
            onClick={() => addToast('Add warehouse – connect to backend','info')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)', boxShadow:'0 0 12px rgba(56,139,253,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/>
            </svg>
            Add Warehouse
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh, i) => (
            <div key={wh.id}
              className={`glass rounded-xl p-5 flex flex-col gap-3 animate-fade-up`}
              style={{ animationDelay:`${i*0.1}s` }}>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white font-display">{wh.name}</span>
                    <span className="badge" style={{
                      background: wh.type==='Main' ? 'rgba(56,139,253,0.1)' : wh.type==='Secondary' ? 'rgba(168,85,247,0.1)' : 'rgba(100,116,139,0.1)',
                      color:      wh.type==='Main' ? '#60a5fa'              : wh.type==='Secondary' ? '#c084fc'              : '#94a3b8',
                      border:     'none',
                    }}>{wh.type}</span>
                  </div>
                </div>
                {/* Edit button */}
                <button onClick={() => openEdit(wh)}
                  className="text-slate-500 hover:text-blue-400 transition-colors cursor-pointer p-1 rounded hover:bg-blue-500/10">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"/>
                  </svg>
                </button>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0">
                  <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2 6a6 6 0 1110.174 4.31l3.008 3.007a.75.75 0 11-1.06 1.06l-3.007-3.007A6 6 0 012 6z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs text-slate-400 leading-relaxed">{wh.address}</p>
              </div>

              {/* Manager + Phone */}
              <div className="flex flex-col gap-1.5 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-slate-600 flex-shrink-0">
                    <path d="M10.561 8.073a6.005 6.005 0 013.432 5.142.75.75 0 11-1.498.07 4.5 4.5 0 00-8.99 0 .75.75 0 01-1.498-.07 6.004 6.004 0 013.431-5.142 3.999 3.999 0 115.123 0z"/>
                  </svg>
                  <p className="text-xs text-slate-400">{wh.manager}</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-slate-600 flex-shrink-0">
                    <path d="M1.5 4.5a3 3 0 013-3h.003a3 3 0 012.986 2.754 2.25 2.25 0 00.476.563c.234.186.568.27.921.27h.065c.353 0 .687-.084.921-.27a2.25 2.25 0 00.476-.563A3 3 0 0113.497 1.5H13.5a3 3 0 013 3v1.5a3 3 0 01-3 3h-.003a3 3 0 01-2.986-2.754 2.25 2.25 0 00-.476-.563c-.234-.186-.568-.27-.921-.27h-.065c-.353 0-.687.084-.921.27a2.25 2.25 0 00-.476.563A3 3 0 012.503 10.5H2.5a3 3 0 01-3-3V4.5z"/>
                  </svg>
                  <p className="text-xs text-slate-400">{wh.phone}</p>
                </div>
              </div>

              {/* Capacity bar */}
              <CapacityBar used={wh.used} capacity={wh.capacity}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notification settings ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-300">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Notification Preferences</h3>
        <div className="flex flex-col gap-3">
          {[
            { label:'Low stock alerts', desc:'Notify when product falls below minimum qty', default:true },
            { label:'New receipt arrivals', desc:'Notify when a receipt is marked as Ready', default:true  },
            { label:'Pending delivery reminders', desc:'Daily reminder for pending deliveries', default:false },
            { label:'Transfer completions', desc:'Notify when internal transfer is Done', default:true },
          ].map(({ label, desc, default: on }, i) => {
            const [enabled, setEnabled] = useState(on);
            return (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p className="text-xs font-medium text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
                </div>
                {/* Toggle switch */}
                <button onClick={() => setEnabled(v => !v)}
                  className="relative w-9 h-5 rounded-full cursor-pointer transition-all flex-shrink-0"
                  style={{ background: enabled ? 'rgba(56,139,253,0.6)' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: enabled ? '18px' : '2px' }}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Edit Warehouse Modal ── */}
      {editingWh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}>
          <div className="w-full max-w-md glass rounded-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white">Edit Warehouse</h3>
              <button onClick={() => setEditingWh(null)} className="text-slate-500 hover:text-slate-300 cursor-pointer text-lg leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[['name','Warehouse Name'],['address','Address'],['manager','Manager'],['phone','Phone']].map(([k,l]) => (
                <div key={k}>
                  <label className={lbl}>{l}</label>
                  <input value={editForm[k]||''} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                    className={inp} style={inpStyle}/>
                </div>
              ))}
              <div>
                <label className={lbl}>Type</label>
                <select value={editForm.type||'Main'} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpStyle, background:'rgba(255,255,255,0.04)' }}>
                  <option>Main</option><option>Secondary</option><option>Overflow</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingWh(null)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
                Cancel
              </button>
              <button onClick={saveEdit}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#388bfd,#1e5fa8)' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
