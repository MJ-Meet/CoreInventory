// ─────────────────────────────────────────────
// src/pages/DashboardPage.jsx
// KPIs: Total stock, Low/Out, Pending Receipts,
//       Pending Deliveries, Internal Transfers
// Filters: doc type, status, warehouse, category
// ─────────────────────────────────────────────
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { chartData } from '../data/mockData';

// ── Sparkline SVG (no external lib) ──
function SparkLine({ data, color, height = 36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((v - min) / (max - min + 1)) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// ── Bar chart for stock movement ──
function StockChart({ period }) {
  const d = chartData[period] || chartData.weekly;
  const maxVal = Math.max(...d.in, ...d.out, 1);
  const H = 110, barW = 8, gap = 4, slotW = barW * 2 + gap + 12;
  return (
    <svg width="100%" viewBox={`0 0 ${slotW * d.labels.length} ${H + 24}`} preserveAspectRatio="none">
      {d.in.map((v, i) => {
        const x = i * slotW + 6;
        const inH = (v / maxVal) * H, outH = (d.out[i] / maxVal) * H;
        return (
          <g key={i}>
            <rect x={x}              y={H - inH}  width={barW} height={inH}  rx="2" fill="#388bfd" opacity="0.85"/>
            <rect x={x + barW + gap} y={H - outH} width={barW} height={outH} rx="2" fill="#a855f7" opacity="0.75"/>
            <text x={x + barW} y={H + 14} textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.6)" fontFamily="DM Sans,sans-serif">{d.labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── KPI card component ──
function KpiCard({ label, value, sub, subColor, icon, iconBg, trend, sparkData, sparkColor, delay, onClick }) {
  return (
    <div
      className={`glass rounded-xl p-5 flex flex-col gap-3 animate-fade-up ${delay} ${onClick ? 'cursor-pointer hover:border-blue-500/20 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="stat-num text-white">{value}</p>
          {sub && <p className={`text-xs mt-1 ${subColor || 'text-slate-500'}`}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      {sparkData && <div className="h-9 opacity-60"><SparkLine data={sparkData} color={sparkColor} height={36}/></div>}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-600">vs last week</span>
        </div>
      )}
    </div>
  );
}

// ── Status badge colours ──
const statusColors = {
  Done:     { bg:'rgba(34,197,94,0.1)',  color:'#4ade80', border:'rgba(34,197,94,0.2)'  },
  Ready:    { bg:'rgba(56,139,253,0.1)', color:'#60a5fa', border:'rgba(56,139,253,0.2)' },
  Waiting:  { bg:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'rgba(245,158,11,0.2)' },
  Draft:    { bg:'rgba(100,116,139,0.1)',color:'#94a3b8', border:'rgba(100,116,139,0.2)'},
  Canceled: { bg:'rgba(239,68,68,0.1)',  color:'#f87171', border:'rgba(239,68,68,0.2)'  },
};
function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.Draft;
  return <span className="badge" style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{status}</span>;
}

// ── Doc type badge ──
const docColors = {
  Receipt:    { bg:'rgba(34,197,94,0.08)',  color:'#4ade80'  },
  Delivery:   { bg:'rgba(56,139,253,0.08)', color:'#60a5fa'  },
  Transfer:   { bg:'rgba(168,85,247,0.08)', color:'#c084fc'  },
  Adjustment: { bg:'rgba(245,158,11,0.08)', color:'#fbbf24'  },
};
function DocBadge({ type }) {
  const c = docColors[type] || docColors.Adjustment;
  return <span className="badge" style={{ background:c.bg, color:c.color }}>{type}</span>;
}

export default function DashboardPage({ setActivePage }) {
  const [period, setPeriod]   = useState('weekly');
  const [products, setProducts] = useState([]);
  const [operations, setOperations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ──
  const [filterDocType,   setFilterDocType]   = useState('All');
  const [filterStatus,    setFilterStatus]    = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterCategory,  setFilterCategory]  = useState('All');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: prods } = await supabase.from('products').select('*');
      const { data: ops }   = await supabase.from('operations').select('*');
      const { data: ledger } = await supabase.from('stock_ledger').select('*').order('created_at', { ascending: false }).limit(10);
      
      setProducts(prods || []);
      setOperations(ops || []);
      setHistory(ledger || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived KPI numbers ──
  const stats = useMemo(() => {
    const p = products;
    const o = operations;
    return {
      totalStock:   p.reduce((s, p) => s + (p.quantity || 0), 0),
      lowStock:     p.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < (p.min_quantity || 0)).length,
      outStock:     p.filter(p => (p.quantity || 0) <= 0).length,
      pendingR:     o.filter(r => r.type === 'Receipt'  && (r.status === 'Waiting' || r.status === 'Ready')).length,
      pendingD:     o.filter(r => r.type === 'Delivery' && (r.status === 'Waiting' || r.status === 'Ready')).length,
      pendingT:     o.filter(r => r.type === 'Transfer' && (r.status === 'Waiting' || r.status === 'Ready' || r.status === 'Draft')).length,
    };
  }, [products, operations]);

  // ── Filtered move history for the snapshot table ──
  const filteredHistory = useMemo(() => {
    return history.filter(m => {
      // For stock_ledger, we don't have all types in this simple view
      // But we can show them as adjustments or general moves
      return true;
    });
  }, [history]);

  // ── Low-stock items for alert table ──
  const alertItems = useMemo(() => {
    return products.filter(p => {
      const isLow = (p.quantity || 0) < (p.min_quantity || 0);
      if (!isLow) return false;
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      return true;
    });
  }, [products, filterCategory]);

  const selStyle = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Page heading ── */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* ── Low stock alert banner ── */}
      {(stats.lowStock + stats.outStock) > 0 && (
        <div className="animate-fade-up delay-100 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400 flex-shrink-0">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm text-amber-200">
            <strong className="font-semibold">{stats.lowStock + stats.outStock} items</strong> need attention —{' '}
            <span className="text-amber-400">{stats.lowStock} low stock</span> and{' '}
            <span className="text-red-400">{stats.outStock} out of stock</span>
          </p>
        </div>
      )}

      {/* ── 5 KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total product stock */}
        <KpiCard
          label="Total Stock" value={stats.totalStock.toLocaleString('en-IN')} sub="Units on hand" subColor="text-slate-400"
          delay="delay-100"
          icon={<svg viewBox="0 0 20 20" fill="#388bfd" className="w-5 h-5"><path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2zM2 7.5h16l-1.68 8.39A2 2 0 0114.34 17H5.66a2 2 0 01-1.97-1.61L2 7.5z"/></svg>}
          iconBg="rgba(56,139,253,0.12)" sparkData={[800,950,880,1050,980,1100,stats.totalStock/10]} sparkColor="#388bfd" trend={12}
        />
        {/* 2. Low / out of stock */}
        <KpiCard
          label="Low / Out Stock" value={stats.lowStock + stats.outStock} sub={`${stats.lowStock} low · ${stats.outStock} out`} subColor="text-amber-500"
          delay="delay-150"
          icon={<svg viewBox="0 0 20 20" fill="#f59e0b" className="w-5 h-5"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>}
          iconBg="rgba(245,158,11,0.12)" sparkData={[3,5,4,6,5,5,stats.lowStock+stats.outStock]} sparkColor="#f59e0b" trend={-8}
        />
        {/* 3. Pending receipts */}
        <KpiCard
          label="Pending Receipts" value={stats.pendingR} sub="Waiting / Ready" subColor="text-blue-400"
          delay="delay-200"
          icon={<svg viewBox="0 0 20 20" fill="#60a5fa" className="w-5 h-5"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd"/></svg>}
          iconBg="rgba(96,165,250,0.12)" trend={5}
          onClick={() => setActivePage('operations')}
        />
        {/* 4. Pending deliveries */}
        <KpiCard
          label="Pending Deliveries" value={stats.pendingD} sub="To be dispatched" subColor="text-purple-400"
          delay="delay-250"
          icon={<svg viewBox="0 0 20 20" fill="#c084fc" className="w-5 h-5"><path d="M6.5 3A1.5 1.5 0 005 4.5v.25H3.5A1.5 1.5 0 002 6.25v9.5A1.5 1.5 0 003.5 17.25h13A1.5 1.5 0 0018 15.75v-9.5A1.5 1.5 0 0016.5 4.75H15V4.5A1.5 1.5 0 0013.5 3h-7z"/></svg>}
          iconBg="rgba(192,132,252,0.12)" trend={-3}
          onClick={() => setActivePage('operations')}
        />
        {/* 5. Internal transfers scheduled */}
        <KpiCard
          label="Transfers Pending" value={stats.pendingT} sub="Internal moves" subColor="text-teal-400"
          delay="delay-300"
          icon={<svg viewBox="0 0 20 20" fill="#2dd4bf" className="w-5 h-5"><path d="M8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm0 5a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M5 4a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0z"/></svg>}
          iconBg="rgba(45,212,191,0.12)" trend={2}
          onClick={() => setActivePage('operations')}
        />
      </div>

      {/* ── Stock movement chart + recent activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-5 animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Stock Movement</h3>
              <p className="text-xs text-slate-600 mt-0.5">IN vs OUT transactions</p>
            </div>
            <div className="flex gap-1">
              {['weekly','monthly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize ${period===p?'text-blue-300':'text-slate-600 hover:text-slate-400'}`}
                  style={period===p ? { background:'rgba(56,139,253,0.12)', border:'1px solid rgba(56,139,253,0.2)' } : { border:'1px solid transparent' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-85 inline-block"/>Stock IN</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 opacity-75 inline-block"/>Stock OUT</span>
          </div>
          <div className="h-32 overflow-hidden"><StockChart period={period}/></div>
        </div>

        {/* Recent activity feed */}
        <div className="glass rounded-xl p-5 animate-fade-up delay-350">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {history.map(m => (
              <div key={m.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  m.quantity_change > 0 ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
                }`}>
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                    <circle cx="6" cy="6" r="3"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">
                    {products.find(p=>p.id === m.product_id)?.name || 'Unknown Product'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {m.quantity_change > 0 ? 'Stock Add' : 'Stock Remove'} · {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                  </p>
                </div>
                <StatusBadge status="Done"/>
              </div>
            ))}
            {history.length === 0 && <p className="text-xs text-slate-600">No activity yet</p>}
          </div>
        </div>
      </div>

      {/* ── Inventory snapshot table ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-400">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Inventory Operations Snapshot</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <tr>
                {['Doc ID','Type','Product','Qty','Status','Date'].map(h=>(
                  <th key={h} className="text-left text-xs text-slate-600 uppercase tracking-wider pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(m => (
                <tr key={m.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-2.5 pr-4 font-mono text-[10px] text-slate-500 truncate max-w-[80px]">{m.id}</td>
                  <td className="py-2.5 pr-4"><DocBadge type="Adjustment"/></td>
                  <td className="py-2.5 pr-4 text-slate-200 font-medium text-xs whitespace-nowrap">
                    {products.find(p=>p.id === m.product_id)?.name || 'Product'}
                  </td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: (m.quantity_change||0) >= 0 ? '#4ade80' : '#f87171' }}>
                    {(m.quantity_change||0) >= 0 ? '+' : ''}{m.quantity_change}
                  </td>
                  <td className="py-2.5 pr-4"><StatusBadge status="Done"/></td>
                  <td className="py-2.5 pr-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                    {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Today'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className="text-center text-slate-600 text-sm py-8">No records available</p>
          )}
        </div>
      </div>

      {/* ── Stock alert table ── */}
      <div className="glass rounded-xl p-5 animate-fade-up delay-500">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-white text-sm">Items Needing Attention</h3>
            <span className="badge" style={{ background:'rgba(245,158,11,0.12)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.2)' }}>{alertItems.length}</span>
          </div>
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs text-slate-300 cursor-pointer" style={selStyle}>
            <option value="All">All Categories</option>
            <option>Electronics</option><option>Furniture</option><option>Stationery</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <tr>{['Product','SKU','Category','Qty','Min Qty','Status'].map(h=>(
                <th key={h} className="text-left text-xs text-slate-600 uppercase tracking-wider pb-3 pr-4 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {alertItems.map(p => (
                <tr key={p.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-3 pr-4 text-slate-200 font-medium text-xs">{p.name}</td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-slate-500">{p.sku}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{p.category}</td>
                  <td className="py-3 pr-4 text-xs text-white font-bold">{p.quantity}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{p.min_quantity}</td>
                  <td className="py-3">
                    {(p.quantity || 0) <= 0
                       ? <span className="badge" style={{ background:'rgba(239,68,68,0.1)',  color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'  }}>Out of Stock</span>
                       : <span className="badge" style={{ background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.2)' }}>Low Stock</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
