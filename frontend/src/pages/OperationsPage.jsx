// ─────────────────────────────────────────────
// src/pages/OperationsPage.jsx
// Tabs:
//   1. Receipts      – incoming stock
//   2. Deliveries    – outgoing stock
//   3. Adjustments   – inventory corrections
// Each tab has: list table + create form + filters
// ─────────────────────────────────────────────
import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { mockProducts, mockReceipts, mockDeliveries, mockTransactions, suppliers, warehouses } from '../data/mockData';

// ── Shared styles ──
const inp = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-all";
const inpS = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };
const lbl = "text-xs text-slate-500 uppercase tracking-wider mb-1.5 block";
const selS = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };

// ── Status badge ──
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

// ─────────────────────────────────────────────
// RECEIPTS TAB
// ─────────────────────────────────────────────
function ReceiptsTab({ addToast }) {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus,    setFilterStatus]    = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [form, setForm] = useState({ product_id:'', qty:'', contact_name:'', warehouse_id:'', scheduledDate:'', note:'' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch operations of type 'receipt'
      const { data: ops, error: opsErr } = await supabase
        .from('operations')
        .select('*')
        .eq('type', 'receipt')
        .order('created_at', { ascending: false });
      if (opsErr) throw opsErr;
      setReceipts(ops || []);

      const { data: prods } = await supabase.from('products').select('*');
      setProducts(prods || []);

      const { data: whs } = await supabase.from('warehouses').select('*');
      setWarehousesList(whs || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  };

  // Filter receipts
  const filtered = useMemo(() => {
    return receipts.filter(r => {
      if (filterStatus    !== 'All' && r.status    !== filterStatus)    return false;
      if (filterWarehouse !== 'All' && r.warehouse !== filterWarehouse) return false;
      return true;
    });
  }, [receipts, filterStatus, filterWarehouse]);

  // Create new receipt
  const createReceipt = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.qty) { addToast('Product and quantity required','error'); return; }
    
    try {
      const { data, error } = await supabase
        .from('operations')
        .insert([{
          type: 'receipt',
          status: 'draft',
          reference: `RC-${Date.now()}`,
          destination_location_id: form.warehouse_id,
          contact_name: form.contact_name,
          scheduled_date: form.scheduledDate,
          note: form.note,
          // We'll need to insert Operation Items too if this was a full system
          // For now, let's keep it simple as the mock data did
        }])
        .select();

      if (error) throw error;
      
      addToast(`Receipt recorded successfully`,'success');
      fetchData();
      setShowForm(false);
      setForm({ product_id:'', qty:'', contact_name:'', warehouse_id:'', scheduledDate:'', note:'' });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Receipts Report', 14, 15);
    
    const tableColumn = ["ID", "Product", "Qty", "Supplier", "Warehouse", "Scheduled Date", "Status", "Note"];
    const tableRows = [];

    filtered.forEach(r => {
      const rowData = [
        r.reference || r.id,
        products.find(p=>p.id === r.product_id)?.name || r.product_id || '—',
        r.quantity || 0,
        r.contact_name || '—',
        warehousesList.find(w=>w.id === r.destination_location_id)?.name || '—',
        r.scheduled_date || r.created_at?.slice(0,10),
        r.status,
        r.note || '—'
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] }
    });
    
    doc.save('receipts_report.pdf');
    if (addToast) addToast('PDF Exported Successfully', 'success');
  };

  return (
    <div className="space-y-4">
      {/* ── Filter + action bar ── */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selS}>
            <option value="All">All Status</option>
            <option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option><option>Canceled</option>
          </select>
          <select value={filterWarehouse} onChange={e=>setFilterWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selS}>
            <option value="All">All Warehouses</option>
            {warehousesList.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <span className="text-xs text-slate-600 ml-auto mr-2">{filtered.length} records</span>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer hover:bg-white/10 transition-colors"
            style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
          <button onClick={() => setShowForm(v=>!v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background:'linear-gradient(135deg,#22c55e,#15803d)', boxShadow:'0 0 12px rgba(34,197,94,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/></svg>
            New Receipt
          </button>
        </div>
      </div>

      {/* ── Create form (inline toggle) ── */}
      {showForm && (
        <div className="glass rounded-xl p-5 animate-fade-in">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Create Receipt</h4>
          <form onSubmit={createReceipt}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={lbl}>Product *</label>
                <select value={form.product_id} onChange={e=>setForm(f=>({...f,product_id:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                  <option value="">Select product…</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Quantity *</label>
                <input type="number" min="1" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0" className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Supplier / Contact</label>
                <input value={form.contact_name} onChange={e=>setForm(f=>({...f,contact_name:e.target.value}))} placeholder="Supplier name" className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Warehouse</label>
                <select value={form.warehouse} onChange={e=>setForm(f=>({...f,warehouse:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                  {warehouses.map(w=><option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Scheduled Date</label>
                <input type="date" value={form.scheduledDate} onChange={e=>setForm(f=>({...f,scheduledDate:e.target.value}))} className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Note</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Optional note" className={inp} style={inpS}/>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setShowForm(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>Cancel</button>
              <button type="submit"
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#22c55e,#15803d)' }}>Create Receipt</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <tr>{['ID','Product','Qty','Supplier','Warehouse','Scheduled','Status','Note'].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((r,i) => (
              <tr key={r.id} className="trow animate-slide-right" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', animationDelay:`${i*30}ms` }}>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{r.reference || r.id}</td>
                <td className="px-4 py-3 text-xs text-slate-200 font-medium whitespace-nowrap">
                  {products.find(p=>p.id === r.product_id)?.name || r.product_id || '—'}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-emerald-400" style={{ fontFamily:'Syne,sans-serif' }}>+{r.quantity || 0}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{r.contact_name}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {warehousesList.find(w=>w.id === r.destination_location_id)?.name || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">{r.scheduled_date || r.created_at?.slice(0,10)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                <td className="px-4 py-3 text-xs text-slate-600 max-w-28 truncate" title={r.note}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">No receipts found</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DELIVERIES TAB
// ─────────────────────────────────────────────
function DeliveriesTab({ addToast }) {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [filterStatus,    setFilterStatus]    = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [form, setForm] = useState({ product_id:'', qty:'', contact_name:'', warehouse_id:'', scheduledDate:'', note:'' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: ops } = await supabase
        .from('operations')
        .select('*')
        .eq('type', 'delivery')
        .order('created_at', { ascending: false });
      setDeliveries(ops || []);

      const { data: prods } = await supabase.from('products').select('*');
      setProducts(prods || []);

      const { data: whs } = await supabase.from('warehouses').select('*');
      setWarehousesList(whs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => deliveries.filter(d => {
    if (filterStatus    !== 'All' && d.status    !== filterStatus)    return false;
    if (filterWarehouse !== 'All' && d.warehouse !== filterWarehouse) return false;
    return true;
  }), [deliveries, filterStatus, filterWarehouse]);

  const createDelivery = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.qty) { addToast('Product and quantity required','error'); return; }
    
    try {
      const { error } = await supabase
        .from('operations')
        .insert([{
          type: 'delivery',
          status: 'draft',
          reference: `DO-${Date.now()}`,
          origin_location_id: form.warehouse_id,
          contact_name: form.contact_name,
          scheduled_date: form.scheduledDate,
          note: form.note,
        }]);

      if (error) throw error;
      
      addToast(`Delivery order created`,'success');
      fetchData();
      setShowForm(false);
      setForm({ product_id:'', qty:'', contact_name:'', warehouse_id:'', scheduledDate:'', note:'' });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter + action bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selS}>
            <option value="All">All Status</option>
            <option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option><option>Canceled</option>
          </select>
          <select value={filterWarehouse} onChange={e=>setFilterWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer" style={selS}>
            <option value="All">All Warehouses</option>
            {warehousesList.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <span className="text-xs text-slate-600 ml-auto">{filtered.length} records</span>
          <button onClick={() => setShowForm(v=>!v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background:'linear-gradient(135deg,#a855f7,#7c3aed)', boxShadow:'0 0 12px rgba(168,85,247,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/></svg>
            New Delivery
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass rounded-xl p-5 animate-fade-in">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Create Delivery Order</h4>
          <form onSubmit={createDelivery}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={lbl}>Product *</label>
                <select value={form.product_id} onChange={e=>setForm(f=>({...f,product_id:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                  <option value="">Select product…</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Quantity *</label>
                <input type="number" min="1" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0" className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Customer / Dept</label>
                <input value={form.contact_name} onChange={e=>setForm(f=>({...f,contact_name:e.target.value}))} placeholder="e.g. HR Dept" className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>From Warehouse</label>
                <select value={form.warehouse_id} onChange={e=>setForm(f=>({...f,warehouse_id:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                   <option value="">Select warehouse…</option>
                  {warehousesList.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Scheduled Date</label>
                <input type="date" value={form.scheduledDate} onChange={e=>setForm(f=>({...f,scheduledDate:e.target.value}))} className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Note</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Optional note" className={inp} style={inpS}/>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setShowForm(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>Cancel</button>
              <button type="submit"
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#a855f7,#7c3aed)' }}>Create Delivery</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <tr>{['ID','Product','Qty','Customer','Warehouse','Scheduled','Status','Note'].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((d,i) => (
              <tr key={d.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', animationDelay:`${i*30}ms` }}>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{d.reference || d.id}</td>
                <td className="px-4 py-3 text-xs text-slate-200 font-medium whitespace-nowrap">
                   {products.find(p=>p.id === d.product_id)?.name || d.product_id || '—'}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-red-400" style={{ fontFamily:'Syne,sans-serif' }}>-{d.quantity || 0}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{d.contact_name}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                   {warehousesList.find(w=>w.id === d.origin_location_id)?.name || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">{d.scheduled_date || d.created_at?.slice(0,10)}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status}/></td>
                <td className="px-4 py-3 text-xs text-slate-600 max-w-28 truncate" title={d.note}>{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">No deliveries found</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INVENTORY ADJUSTMENT TAB
// ─────────────────────────────────────────────
function AdjustmentTab({ addToast }) {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id:'', qty:'', type:'add', reason:'', warehouse_id:'', date: new Date().toISOString().slice(0,16) });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: logs } = await supabase
        .from('stock_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      setAdjustments(logs || []);

      const { data: prods } = await supabase.from('products').select('*');
      setProducts(prods || []);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.qty) { addToast('Product and quantity required','error'); return; }
    const qtyChange = form.type === 'remove' ? -Math.abs(parseInt(form.qty)) : Math.abs(parseInt(form.qty));
    
    try {
      const { error } = await supabase
        .from('stock_ledger')
        .insert([{
          product_id: form.product_id,
          quantity_change: qtyChange,
          note: form.reason || 'Inventory adjustment',
        }]);

      if (error) throw error;
      
      addToast(`Adjustment recorded`,'success');
      fetchData();
      setShowForm(false);
      setForm({ product_id:'', qty:'', type:'add', reason:'', warehouse_id:'', date:new Date().toISOString().slice(0,16) });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Manual stock corrections and write-offs</p>
          <button onClick={()=>setShowForm(v=>!v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background:'linear-gradient(135deg,#f59e0b,#b45309)', boxShadow:'0 0 12px rgba(245,158,11,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/></svg>
            New Adjustment
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass rounded-xl p-5 animate-fade-in">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Record Adjustment</h4>
          <form onSubmit={submitAdjustment}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Type toggle */}
              <div className="col-span-2">
                <label className={lbl}>Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['add','Add Stock (+)'],['remove','Remove Stock (-)']].map(([v,l])=>(
                    <button key={v} type="button" onClick={()=>setForm(f=>({...f,type:v}))}
                      className="py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={form.type===v
                        ? { background: v==='add'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', border:`1px solid ${v==='add'?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`, color: v==='add'?'#4ade80':'#f87171' }
                        : { border:'1px solid rgba(255,255,255,0.06)', color:'#64748b' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>Product *</label>
                <select value={form.product_id} onChange={e=>setForm(f=>({...f,product_id:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                  <option value="">Select product…</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Quantity *</label>
                <input type="number" min="1" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0" className={inp} style={inpS}/>
              </div>
              <div>
                <label className={lbl}>Warehouse</label>
                <select value={form.warehouse} onChange={e=>setForm(f=>({...f,warehouse:e.target.value}))}
                  className={`${inp} cursor-pointer`} style={{ ...inpS, background:'rgba(255,255,255,0.04)' }}>
                  {warehouses.map(w=><option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Date & Time</label>
                <input type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className={inp} style={inpS}/>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Reason / Notes</label>
                <input value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
                  placeholder="e.g. Damaged goods, count correction, write-off…" className={inp} style={inpS}/>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setShowForm(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>Cancel</button>
              <button type="submit"
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#f59e0b,#b45309)' }}>Record Adjustment</button>
            </div>
          </form>
        </div>
      )}

      {/* Adjustment log table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <tr>{['Type','Product','Qty','User','Note','Date'].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {adjustments.map((a,i) => (
              <tr key={a.id} className="trow" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3">
                  <span className="badge" style={{
                    background: a.quantity_change>=0?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)',
                    color: a.quantity_change>=0?'#4ade80':'#f87171',
                    border: `1px solid ${a.quantity_change>=0?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`,
                  }}>{a.quantity_change>=0?'↑ ADD':'↓ REMOVE'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-200 font-medium whitespace-nowrap">
                   {products.find(p=>p.id === a.product_id)?.name || a.product_id || '—'}
                </td>
                <td className="px-4 py-3 text-xs font-bold" style={{ fontFamily:'Syne,sans-serif', color: a.quantity_change>=0?'#4ade80':'#f87171' }}>
                  {a.quantity_change>=0?'+':''}{a.quantity_change}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">System</td>
                <td className="px-4 py-3 text-xs text-slate-600 max-w-32 truncate" title={a.note}>{a.note}</td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono whitespace-nowrap">{a.created_at?.slice(0,16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPORT – tabs switcher
// ─────────────────────────────────────────────
export default function OperationsPage({ addToast }) {
  // Active tab: 'receipts' | 'deliveries' | 'adjustments'
  const [tab, setTab] = useState('receipts');

  const tabs = [
    { id:'receipts',    label:'Receipts',     desc:'Incoming stock',   color:'text-emerald-400', activeBg:'rgba(34,197,94,0.1)',  activeBorder:'rgba(34,197,94,0.2)'   },
    { id:'deliveries',  label:'Deliveries',   desc:'Outgoing stock',   color:'text-purple-400',  activeBg:'rgba(168,85,247,0.1)', activeBorder:'rgba(168,85,247,0.2)'  },
    { id:'adjustments', label:'Adjustments',  desc:'Stock corrections',color:'text-amber-400',   activeBg:'rgba(245,158,11,0.1)', activeBorder:'rgba(245,158,11,0.2)'  },
  ];

  return (
    <div className="p-6 space-y-5">

      {/* ── Heading ── */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Operations</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage receipts, deliveries and inventory adjustments</p>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 animate-fade-up delay-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${tab===t.id ? t.color : 'text-slate-500 hover:text-slate-300'}`}
            style={tab === t.id
              ? { background: t.activeBg, border: `1px solid ${t.activeBorder}` }
              : { border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }
            }
          >
            <span className="text-sm font-semibold">{t.label}</span>
            <span className="text-[10px] opacity-70 mt-0.5">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div key={tab} className="animate-fade-up">
        {tab === 'receipts'    && <ReceiptsTab    addToast={addToast}/>}
        {tab === 'deliveries'  && <DeliveriesTab  addToast={addToast}/>}
        {tab === 'adjustments' && <AdjustmentTab  addToast={addToast}/>}
      </div>
    </div>
  );
}
