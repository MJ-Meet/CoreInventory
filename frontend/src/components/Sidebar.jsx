// ─────────────────────────────────────────────
// src/components/Sidebar.jsx
// Fixed left navigation – 7 items + user footer
// ─────────────────────────────────────────────
import React from 'react';

// ── Nav item definitions ──
const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>,
  },
  {
    id: 'products', label: 'Products',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2zM2 7.5h16l-1.68 8.39A2 2 0 0114.34 17H5.66a2 2 0 01-1.97-1.61L2 7.5z"/></svg>,
  },
  {
    id: 'operations', label: 'Operations',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668 1.304.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254V16h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H9.25V4.509a31.742 31.742 0 00-3.34.254l1.771 7.85a.75.75 0 01-.387.831A4.98 4.98 0 015 14a4.98 4.98 0 01-2.294-.556.75.75 0 01-.387-.832l1.702-7.545c-.37.07-.738.149-1.103.232a.75.75 0 01-.336-1.461 33.186 33.186 0 016.668-1.304V2.75A.75.75 0 0110 2z" clipRule="evenodd"/></svg>,
  },
  {
    id: 'move-history', label: 'Move History',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd"/></svg>,
  },
  {
    id: 'settings', label: 'Settings',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
  },
  {
    id: 'profile', label: 'Profile',
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd"/></svg>,
  },
];

export default function Sidebar({ activePage, setActivePage, user, onLogout }) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-30"
      style={{ background:'rgba(8,12,20,0.97)', borderRight:'1px solid rgba(255,255,255,0.05)' }}
    >
      {/* ── Logo / Brand ── */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#388bfd 0%,#1e5fa8 100%)' }}>
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2zM2 7.5h16l-1.68 8.39A2 2 0 0114.34 17H5.66a2 2 0 01-1.97-1.61L2 7.5z"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white leading-none tracking-wide">StockIQ</p>
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-wider uppercase">Inventory</p>
          </div>
        </div>
      </div>

      {/* ── Navigation links ── */}
      <nav className="flex-1 px-3 pt-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer group ${
                active ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
              style={
                active
                  ? { background:'rgba(56,139,253,0.12)', border:'1px solid rgba(56,139,253,0.2)', color:'#388bfd' }
                  : { border:'1px solid transparent' }
              }
            >
              {/* Icon */}
              <span className={`transition-colors flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                {item.icon}
              </span>
              {/* Label */}
              <span className="font-medium">{item.label}</span>
              {/* Active dot */}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{ boxShadow:'0 0 6px rgba(56,139,253,0.8)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── User footer + logout ── */}
      <div className="px-3 pb-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#388bfd,#a855f7)' }}
          >
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-600 truncate capitalize">{user?.role || 'staff'}</p>
          </div>
          {/* Logout button */}
          <button
            onClick={onLogout}
            className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
            title="Logout"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 010 1.5h-2.5A1.75 1.75 0 012 13.25V2.75zm10.44 4.5H6.75a.75.75 0 000 1.5h5.69l-1.97 1.97a.75.75 0 101.06 1.06l3.25-3.25a.75.75 0 000-1.06l-3.25-3.25a.75.75 0 10-1.06 1.06l1.97 1.97z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
