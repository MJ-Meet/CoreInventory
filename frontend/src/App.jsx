// ─────────────────────────────────────────────
// src/App.jsx  –  Root component & router
// ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import ProductsPage    from './pages/ProductsPage';
import OperationsPage  from './pages/OperationsPage';
import MoveHistoryPage from './pages/MoveHistoryPage';
import SettingsPage    from './pages/SettingsPage';
import ProfilePage     from './pages/ProfilePage';
import Sidebar         from './components/Sidebar';
import ToastContainer  from './components/ToastContainer';
import { useToast }    from './hooks/useToast';

export default function App() {
  // null = not logged in
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: session.user.user_metadata?.role || 'staff'
        });
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: session.user.user_metadata?.role || 'staff'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Initializing StockIQ...</p>
        </div>
      </div>
    );
  }

  // ── Show login screen when not authenticated ──
  if (!user) {
    return (
      <>
        <LoginPage onLogin={(u) => { 
          setUser({
            ...u,
            name: u.user_metadata?.full_name || u.email,
            role: u.user_metadata?.role || u.role || 'staff'
          }); 
          setActivePage('dashboard'); 
        }} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Persistent sidebar with all nav links */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
      />

      {/* ml-56 offsets the fixed 224px sidebar */}
      <main className="flex-1 ml-56 min-h-screen" style={{ background: '#080c14' }}>

        {/* ── Sticky topbar ── */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-6 h-14"
          style={{ background:'rgba(8,12,20,0.9)', borderBottom:'1px solid rgba(255,255,255,0.05)', backdropFilter:'blur(12px)' }}
        >
          {/* Breadcrumb trail */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>StockIQ</span>
            <span>/</span>
            <span className="text-slate-300 capitalize">{activePage.replace('-',' ')}</span>
          </div>

          {/* Notification + user pill */}
          <div className="flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M4.214 3.227a.75.75 0 00-1.156-.956 8.97 8.97 0 00-1.856 3.826.75.75 0 001.466.316 7.47 7.47 0 011.546-3.186zM16.942 2.271a.75.75 0 00-1.157.956 7.47 7.47 0 011.547 3.186.75.75 0 001.466-.316 8.97 8.97 0 00-1.856-3.826z"/>
                <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zm0 14.5a2 2 0 01-1.95-1.557 33.54 33.54 0 003.9 0A2 2 0 0110 16.5z" clipRule="evenodd"/>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Click pill to go to profile page */}
            <button
              onClick={() => setActivePage('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/[0.04] transition-colors"
              style={{ border:'1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase"
                style={{ background:'linear-gradient(135deg,#388bfd,#a855f7)' }}>
                {(user.name || user.email || 'U')[0]}
              </div>
              <span className="text-xs text-slate-400 capitalize">{user.role || 'staff'}</span>
            </button>
          </div>
        </div>

        {/* Page router – key forces remount/animation on nav change */}
        <div key={activePage} className="animate-fade-up">
          {activePage === 'dashboard'    && <DashboardPage   setActivePage={setActivePage} />}
          {activePage === 'products'     && <ProductsPage    addToast={addToast} />}
          {activePage === 'operations'   && <OperationsPage  addToast={addToast} />}
          {activePage === 'move-history' && <MoveHistoryPage />}
          {activePage === 'settings'     && <SettingsPage    addToast={addToast} />}
          {activePage === 'profile'      && <ProfilePage     user={user} setUser={setUser} onLogout={() => setUser(null)} addToast={addToast} />}
        </div>
      </main>

      {/* Toast portal */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
