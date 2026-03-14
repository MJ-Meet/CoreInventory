// ─────────────────────────────────────────────
// src/pages/MoveHistoryPage.jsx
// Shows complete movement log with filters:
//   • Doc type (Receipt/Delivery/Transfer/Adjustment)
//   • Status (Draft/Waiting/Ready/Done/Canceled)
//   • Warehouse / location
//   • Product category (via product lookup)
// ─────────────────────────────────────────────
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mockMoveHistory, mockReceipts, mockDeliveries, mockTransfers } from '../data/mockData';

// ── Status badge colours ──
const statusColors = {
  Done:     { bg:'rgba(34,197,94,0.1)',  color:'#4ade80', border:'rgba(34,197,94,0.2)'   },
  Ready:    { bg:'rgba(56,139,253,0.1)', color:'#60a5fa', border:'rgba(56,139,253,0.2)'  },
  Waiting:  { bg:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'rgba(245,158,11,0.2)'  },
  Draft:    { bg:'rgba(100,116,139,0.1)',color:'#94a3b8', border:'rgba(100,116,139,0.2)' },
  Canceled: { bg:'rgba(239,68,68,0.1)',  color:'#f87171', border:'rgba(239,68,68,0.2)'   },
};
function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.Draft;
  return <span className="badge" style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{status}</span>;
}

// ── Doc type badge colours ──
const docColors = {
  Receipt:    'rgba(34,197,94,0.08)',
  Delivery:   'rgba(56,139,253,0.08)',
  Transfer:   'rgba(168,85,247,0.08)',
  Adjustment: 'rgba(245,158,11,0.08)',
};
const docTextColors = {
  Receipt:'#4ade80', Delivery:'#60a5fa', Transfer:'#c084fc', Adjustment:'#fbbf24',
};
function DocBadge({ type }) {
  return (
    <span className="badge" style={{ background: docColors[type]||'rgba(100,116,139,0.08)', color: docTextColors[type]||'#94a3b8' }}>
      {type}
    </span>
  );
}

const selStyle = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };

export default function MoveHistoryPage() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [counts, setCounts]   = useState({ Receipt:0, Delivery:0, Transfer:0, Adjustment:0 });

  // ── Filter state ──
  const [filterDocType,   setFilterDocType]   = useState('All');
  const [filterStatus,    setFilterStatus]    = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [search,          setSearch]          = useState('');
  const [sortDir,         setSortDir]         = useState('desc'); // newest first

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: ledger } = await supabase
        .from('stock_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      setHistory(ledger || []);

      const { data: prods } = await supabase.from('products').select('*');
      setProducts(prods || []);

      // Approximate counts (logic can be more complex with actual operation types)
      setCounts({
        Receipt: (ledger || []).filter(l => l.quantity_change > 0).length,
        Delivery:(ledger || []).filter(l => l.quantity_change < 0).length,
        Transfer: 0, 
        Adjustment: (ledger || []).length
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Apply filters + search ──
  const filtered = useMemo(() => {
    let list = [...history];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => {
        const pName = products.find(p=>p.id === m.product_id)?.name || '';
        return pName.toLowerCase().includes(q) || (m.note || '').toLowerCase().includes(q);
      });
    }
    // We can add more filter logic as schema evolves
    return list;
  }, [history, products, search, sortDir]);


  return (
    <div className="p-6 space-y-6">

      {/* ── Heading ── */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Move History</h1>
        <p className="text-slate-500 text-sm mt-0.5">Complete audit trail of all stock movements</p>
      </div>
      {/* ── Mini summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100">
        {[
          { label:'Receipts',    count:counts.Receipt,    color:'#4ade80', bg:'rgba(34,197,94,0.1)'   },
          { label:'Deliveries',  count:counts.Delivery,   color:'#60a5fa', bg:'rgba(56,139,253,0.1)'  },
          { label:'Transfers',   count:counts.Transfer,   color:'#c084fc', bg:'rgba(168,85,247,0.1)'  },
          { label:'Adjustments', count:counts.Adjustment, color:'#fbbf24', bg:'rgba(245,158,11,0.1)'  },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily:'Syne,sans-serif' }}>{count}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
              <span className="w-3 h-3 rounded-full" style={{ background: color }}/>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="glass rounded-xl p-4 animate-fade-up delay-150">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg viewBox="0 0 16 16" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600">
              <path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215l-3.04-3.04zM11.5 7a4.499 4.499 0 11-8.997 0A4.499 4.499 0 0111.5 7z"/>
            </svg>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search product, doc ID, user…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs text-white placeholder-slate-600"
              style={selStyle}/>
          </div>

          {/* Filter: doc type */}
          <select value={filterDocType} onChange={e=>setFilterDocType(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selStyle}>
            <option value="All">All Types</option>
            <option>Receipt</option><option>Delivery</option><option>Transfer</option><option>Adjustment</option>
          </select>

          {/* Filter: status */}
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selStyle}>
            <option value="All">All Status</option>
            <option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option><option>Canceled</option>
          </select>

          {/* Filter: warehouse */}
          <select value={filterWarehouse} onChange={e=>setFilterWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selStyle}>
            <option value="All">All Warehouses</option>
            <option>Warehouse A</option><option>Warehouse B</option><option>Warehouse C</option>
          </select>

          {/* Sort toggle */}
          <button onClick={()=>setSortDir(d=>d==='desc'?'asc':'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-all"
            style={selStyle}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path d="M3.5 2A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14H9a1.5 1.5 0 001.5-1.5V8.293a1.5 1.5 0 00-.44-1.06l-3.293-3.293A1.5 1.5 0 005.707 3.5H3.5zm7.648 1.646a.5.5 0 01.708 0l2 2a.5.5 0 01-.708.708L12.5 5.707V11.5a.5.5 0 01-1 0V5.707l-.648.647a.5.5 0 01-.708-.708l2-2z"/>
            </svg>
            {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>

          {/* Result count */}
          <span className="ml-auto text-xs text-slate-600">{filtered.length} records</span>
        </div>
      </div>

      {/* ── History table ── */}
      <div className="glass rounded-xl overflow-hidden animate-fade-up delay-200">
        <table className="w-full text-sm">
          <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <tr>
              {['Doc ID','Type','Product','Qty','From','To','Status','Date','User'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} className="trow animate-slide-right"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', animationDelay:`${i*30}ms` }}>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{m.id.slice(0,8)}</td>
                <td className="px-4 py-3">
                   <DocBadge type={m.quantity_change > 0 ? 'Receipt' : 'Delivery'}/>
                </td>
                <td className="px-4 py-3 text-xs text-slate-200 font-medium whitespace-nowrap">
                   {products.find(p=>p.id === m.product_id)?.name || m.product_id}
                </td>
                <td className="px-4 py-3 text-xs font-bold" style={{ fontFamily:'Syne,sans-serif', color: m.quantity_change >= 0 ? '#4ade80' : '#f87171' }}>
                  {m.quantity_change >= 0 ? '+' : ''}{m.quantity_change}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">System</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">Location</td>
                <td className="px-4 py-3"><StatusBadge status="Done"/></td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono whitespace-nowrap">{m.created_at?.slice(0,16)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Auto</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 text-sm">No records match your filters</div>
        )}
      </div>
    </div>
  );
}
