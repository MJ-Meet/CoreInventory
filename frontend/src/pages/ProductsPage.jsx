import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mockProducts, categories as initialCategories } from '../data/mockData';

const statusConfig = {
  'in-stock':  { label: 'In Stock',     bg: 'rgba(34,197,94,0.1)',   color: '#4ade80', border: 'rgba(34,197,94,0.2)'   },
  'low-stock': { label: 'Low Stock',    bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.2)'  },
  'out-stock': { label: 'Out of Stock', bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.2)'   },
};

function deriveStatus(p) {
  const qty = p.quantity || 0;
  const minQty = p.min_quantity || 0;
  if (qty === 0)        return 'out-stock';
  if (qty < minQty)  return 'low-stock';
  return 'in-stock';
}

function StatusBadge({ status }) {
  const c = statusConfig[status];
  return (
    <span className="badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block" style={{ background: c.color }}/>
      {c.label}
    </span>
  );
}

function exportCSV(products) {
  const headers = ['Name', 'SKU', 'Category', 'Qty', 'Min Qty', 'Price (₹)', 'Supplier', 'Status'];
  const rows = products.map(p => [
    p.name, p.sku, p.category, p.quantity, p.min_quantity, p.price, p.supplier_id || '—', deriveStatus(p)
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'stockiq-products.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductsPage({ addToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [status,   setStatus]   = useState('All');
  const [sortBy,   setSortBy]   = useState('name');
  const [sortDir,  setSortDir]  = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [editingId, setEditingId] = useState(null);
  const [editQty,   setEditQty]   = useState('');
  const [selected,  setSelected]  = useState(new Set());
  const [showAdd,   setShowAdd]   = useState(false);
  const [newProd,   setNewProd]   = useState({ name:'', sku:'', category:'', qty:'', minQty:'', price:'', supplier:'' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: prods, error: pErr } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (pErr) throw pErr;
      setProducts(prods || []);

      // Derive categories from products for now or fetch if table exists
      const uniqueCats = ['All', ...new Set((prods || []).map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast('Failed to load products', 'error');
    }
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search)          list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(p => p.category === category);
    if (status   !== 'All') list = list.filter(p => deriveStatus(p) === status);
    list.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [products, search, category, status, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const saveQty = async (id) => {
    const q = parseInt(editQty);
    if (isNaN(q) || q < 0) { addToast('Enter a valid quantity', 'error'); return; }
    
    try {
      // In a real IMS, we should add a stock ledger entry
      // For simplicity here, let's update the product qty directly
      const { error } = await supabase
        .from('products')
        .update({ quantity: q })
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: q } : p));
      setEditingId(null);
      addToast('Quantity updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)));
  };

  const bulkDelete = async () => {
    try {
      const ids = Array.from(selected);
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
      
      if (error) throw error;

      setProducts(prev => prev.filter(p => !selected.has(p.id)));
      addToast(`${selected.size} product(s) removed`, 'warning');
      setSelected(new Set());
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const addProduct = async () => {
    const p = newProd;
    if (!p.name || !p.sku || !p.qty) { addToast('Fill all required fields', 'error'); return; }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: p.name,
          sku: p.sku,
          category: p.category,
          quantity: parseInt(p.qty),
          min_quantity: parseInt(p.minQty) || 0,
          price: parseInt(p.price) || 0,
          // supplier_id: ... usually lookup
        }])
        .select();

      if (error) throw error;

      fetchData();
      setShowAdd(false);
      setNewProd({ name:'', sku:'', category:'', qty:'', minQty:'', price:'', supplier:'' });
      addToast(`"${p.name}" added to inventory`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const SortIcon = ({ col }) => (
    <span className={`ml-1 text-slate-600 ${sortBy === col ? 'text-blue-400' : ''}`}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const inputCls = "w-full px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 transition-all";
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-700 text-white tracking-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} of {products.length} items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 1a.75.75 0 01.75.75V8.5l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L7.25 8.5V1.75A.75.75 0 018 1zm-6 12.25a.75.75 0 011.5 0v.5h9v-.5a.75.75 0 011.5 0v.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.75v-.5z"/>
            </svg>
            Export CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #388bfd, #1e5fa8)', boxShadow: '0 0 16px rgba(56,139,253,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass rounded-xl p-4 animate-fade-up delay-100">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg viewBox="0 0 16 16" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600">
              <path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215l-3.04-3.04zM11.5 7a4.499 4.499 0 11-8.997 0A4.499 4.499 0 0111.5 7z"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              className={`${inputCls} pl-9`} style={inputStyle} />
          </div>

          {/* Category filter */}
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer"
            style={{ ...inputStyle, background: 'rgba(255,255,255,0.04)' }}>
            {['All', 'Electronics', 'Furniture', 'Stationery'].map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Status filter */}
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs text-slate-300 cursor-pointer"
            style={{ ...inputStyle, background: 'rgba(255,255,255,0.04)' }}>
            <option value="All">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-stock">Out of Stock</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {['table','grid'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-2.5 py-1.5 transition-all cursor-pointer ${viewMode === v ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
                style={viewMode === v ? { background: 'rgba(56,139,253,0.12)' } : { background: 'rgba(255,255,255,0.02)' }}>
                {v === 'table' ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75zm1.5 5.56v4.94c0 .138.112.25.25.25H14.25a.25.25 0 00.25-.25V8.31H1.5zm0-4.56v3.06h13V2.75a.25.25 0 00-.25-.25H1.75a.25.25 0 00-.25.25z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8.5 0A1.5 1.5 0 0111 1h3a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 0114 7h-3a1.5 1.5 0 01-1.5-1.5v-3zM1 11a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 017 11v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 011 14v-3zm8.5 0A1.5 1.5 0 0111 9.5h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019.5 14v-3z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500">{selected.size} selected</span>
              <button onClick={bulkDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 cursor-pointer transition-all hover:bg-red-500/10"
                style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                Delete selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass rounded-xl overflow-hidden animate-fade-up delay-150">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" onChange={selectAll} checked={selected.size === filtered.length && filtered.length > 0}
                    className="accent-blue-500 cursor-pointer w-3.5 h-3.5"/>
                </th>
                {[['name','Product'], ['sku','SKU'], ['category','Category'], ['qty','Qty'], ['price','Price']].map(([k,l]) => (
                  <th key={k} className="text-left px-3 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium cursor-pointer hover:text-slate-400 transition-colors"
                    onClick={() => toggleSort(k)}>
                    {l}<SortIcon col={k}/>
                  </th>
                ))}
                <th className="text-left px-3 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-3 py-3 text-xs text-slate-600 uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = deriveStatus(p);
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className={`trow ${selected.has(p.id) ? 'bg-blue-500/5' : ''}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                        className="accent-blue-500 cursor-pointer w-3.5 h-3.5"/>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-slate-200 font-medium text-xs">{p.name}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">{p.supplier}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500">{p.sku}</td>
                    <td className="px-3 py-3 text-xs text-slate-400">{p.category}</td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
                            className="w-16 px-2 py-1 rounded text-xs text-white"
                            style={{ background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.3)' }}
                            autoFocus onKeyDown={e => { if (e.key==='Enter') saveQty(p.id); if (e.key==='Escape') setEditingId(null); }}/>
                          <button onClick={() => saveQty(p.id)} className="text-emerald-400 hover:text-emerald-300 cursor-pointer">✓</button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300 cursor-pointer">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(p.id); setEditQty(String(p.quantity)); }}
                          className="text-xs text-slate-300 hover:text-blue-400 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-blue-500/10 group flex items-center gap-1">
                          {p.quantity}
                          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                            <path d="M8.5 1.5a1.5 1.5 0 012.12 2.12L4.5 9.75l-3 .75.75-3L8.5 1.5z"/>
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3"><StatusBadge status={st}/></td>
                    <td className="px-3 py-3">
                      <button className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-red-500/10"
                        onClick={() => { setProducts(prev => prev.filter(x => x.id !== p.id)); addToast(`"${p.name}" removed`, 'warning'); }}>
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM6.5 1.75V3h3V1.75a.25.25 0 00-.25-.25h-2.5a.25.25 0 00-.25.25zM4.997 6.5a.75.75 0 00-1.493.144l.48 5.25a1.75 1.75 0 001.743 1.606h4.546a1.75 1.75 0 001.742-1.606l.48-5.25a.75.75 0 10-1.493-.144l-.48 5.25a.25.25 0 01-.249.23H5.726a.25.25 0 01-.248-.23L4.997 6.5z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <p className="text-sm">No products match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-up delay-150">
          {filtered.map((p) => {
            const st = deriveStatus(p);
            const sc = statusConfig[st];
            return (
              <div key={p.id} className="glass rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/20 transition-all duration-200"
                style={{ cursor: 'default' }}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                    style={{ background: 'rgba(56,139,253,0.08)' }}>
                    📦
                  </div>
                  <StatusBadge status={st}/>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200 leading-tight">{p.name}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{p.sku}</p>
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-[10px] text-slate-600">Qty</p>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{p.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-600">Price</p>
                    <p className="text-xs font-medium text-slate-300">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md glass rounded-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-600 text-white">Add New Product</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['name','Product Name','text',true],
                ['sku','SKU Code','text',true],
                ['qty','Quantity','number',true],
                ['minQty','Min Qty','number',false],
                ['price','Price (₹)','number',false],
                ['supplier','Supplier','text',false],
              ].map(([k, label, type, req]) => (
                <div key={k} className={k === 'name' || k === 'supplier' ? 'col-span-2' : ''}>
                  <label className="text-xs text-slate-500 mb-1.5 block">{label} {req && <span className="text-red-500">*</span>}</label>
                  <input type={type} value={newProd[k]} onChange={e => setNewProd(p => ({ ...p, [k]: e.target.value }))}
                    placeholder={label} className={`${inputCls}`} style={inputStyle}/>
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-slate-500 mb-1.5 block">Category</label>
                <select value={newProd.category} onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs text-slate-300" style={{ ...inputStyle, background: 'rgba(255,255,255,0.04)' }}>
                  <option>Electronics</option><option>Furniture</option><option>Stationery</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-pointer transition-all hover:text-slate-200"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                Cancel
              </button>
              <button onClick={addProduct}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer transition-all"
                style={{ background: 'linear-gradient(135deg, #388bfd, #1e5fa8)', boxShadow: '0 0 12px rgba(56,139,253,0.2)' }}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
