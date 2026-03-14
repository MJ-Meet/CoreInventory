// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────
export const mockProducts = [
  { id:1,  name:'Wireless Keyboard',    sku:'EL-WK-001', category:'Electronics', qty:142, minQty:20,  price:1299,  supplier:'TechCorp',  status:'in-stock',  location:'Warehouse A', reorderQty:50  },
  { id:2,  name:'USB-C Hub 7-Port',     sku:'EL-UC-002', category:'Electronics', qty:8,   minQty:15,  price:2499,  supplier:'TechCorp',  status:'low-stock', location:'Warehouse A', reorderQty:30  },
  { id:3,  name:'Office Chair Pro',     sku:'FU-OC-003', category:'Furniture',   qty:0,   minQty:5,   price:8999,  supplier:'FurnMax',   status:'out-stock', location:'Warehouse B', reorderQty:10  },
  { id:4,  name:'A4 Paper Ream 500s',   sku:'ST-PA-004', category:'Stationery',  qty:450, minQty:100, price:299,   supplier:'OfficeHub', status:'in-stock',  location:'Warehouse A', reorderQty:200 },
  { id:5,  name:'HDMI Cable 2m',        sku:'EL-HC-005', category:'Electronics', qty:67,  minQty:10,  price:499,   supplier:'TechCorp',  status:'in-stock',  location:'Warehouse C', reorderQty:20  },
  { id:6,  name:'Mechanical Pencil',    sku:'ST-MP-006', category:'Stationery',  qty:12,  minQty:30,  price:149,   supplier:'OfficeHub', status:'low-stock', location:'Warehouse A', reorderQty:50  },
  { id:7,  name:'Standing Desk',        sku:'FU-SD-007', category:'Furniture',   qty:22,  minQty:3,   price:24999, supplier:'FurnMax',   status:'in-stock',  location:'Warehouse B', reorderQty:5   },
  { id:8,  name:'Monitor 27" 4K',       sku:'EL-MN-008', category:'Electronics', qty:5,   minQty:8,   price:32999, supplier:'TechCorp',  status:'low-stock', location:'Warehouse C', reorderQty:10  },
  { id:9,  name:'Blue Ballpen Box',     sku:'ST-BB-009', category:'Stationery',  qty:380, minQty:50,  price:89,    supplier:'OfficeHub', status:'in-stock',  location:'Warehouse A', reorderQty:100 },
  { id:10, name:'Laptop Stand Alumin.', sku:'EL-LS-010', category:'Electronics', qty:0,   minQty:5,   price:1799,  supplier:'TechCorp',  status:'out-stock', location:'Warehouse C', reorderQty:15  },
  { id:11, name:'Whiteboard 120x90',    sku:'FU-WB-011', category:'Furniture',   qty:14,  minQty:2,   price:3499,  supplier:'FurnMax',   status:'in-stock',  location:'Warehouse B', reorderQty:5   },
  { id:12, name:'Stapler Heavy Duty',   sku:'ST-SH-012', category:'Stationery',  qty:9,   minQty:10,  price:599,   supplier:'OfficeHub', status:'low-stock', location:'Warehouse A', reorderQty:20  },
];

// ─────────────────────────────────────────────
// OLD TRANSACTIONS
// ─────────────────────────────────────────────
export const mockTransactions = [
  { id:'t1', type:'IN',  product:'Wireless Keyboard',  qty:50,  date:'2025-03-14 09:12', user:'Arjun S.',  supplier:'TechCorp',  note:'Monthly restock'   },
  { id:'t2', type:'OUT', product:'A4 Paper Ream 500s', qty:20,  date:'2025-03-14 10:45', user:'Priya M.',  supplier:'—',         note:'Dept requisition'  },
  { id:'t3', type:'OUT', product:'HDMI Cable 2m',      qty:3,   date:'2025-03-13 14:30', user:'Rohan K.',  supplier:'—',         note:'Conference room'   },
  { id:'t4', type:'IN',  product:'Standing Desk',      qty:5,   date:'2025-03-13 11:00', user:'Arjun S.',  supplier:'FurnMax',   note:'New office setup'  },
  { id:'t5', type:'OUT', product:'USB-C Hub 7-Port',   qty:7,   date:'2025-03-12 16:22', user:'Priya M.',  supplier:'—',         note:'Remote team kits'  },
  { id:'t6', type:'IN',  product:'Blue Ballpen Box',   qty:100, date:'2025-03-12 09:05', user:'Rohan K.',  supplier:'OfficeHub', note:'Quarterly order'   },
  { id:'t7', type:'OUT', product:'Mechanical Pencil',  qty:15,  date:'2025-03-11 13:10', user:'Arjun S.',  supplier:'—',         note:'Design team'       },
  { id:'t8', type:'IN',  product:'Monitor 27" 4K',     qty:3,   date:'2025-03-10 10:00', user:'Priya M.',  supplier:'TechCorp',  note:'Urgent order'      },
];

// ─────────────────────────────────────────────
// RECEIPTS (Incoming Stock)
// ─────────────────────────────────────────────
export const mockReceipts = [
  { id:'RC-001', product:'Wireless Keyboard',  qty:50,  supplier:'TechCorp',  warehouse:'Warehouse A', status:'Done',    date:'2025-03-14', scheduledDate:'2025-03-14', note:'Monthly restock'   },
  { id:'RC-002', product:'Standing Desk',      qty:5,   supplier:'FurnMax',   warehouse:'Warehouse B', status:'Ready',   date:'2025-03-15', scheduledDate:'2025-03-15', note:'New office setup'  },
  { id:'RC-003', product:'Monitor 27" 4K',     qty:10,  supplier:'TechCorp',  warehouse:'Warehouse C', status:'Waiting', date:'2025-03-16', scheduledDate:'2025-03-18', note:'Urgent restock'    },
  { id:'RC-004', product:'Blue Ballpen Box',   qty:200, supplier:'OfficeHub', warehouse:'Warehouse A', status:'Draft',   date:'2025-03-17', scheduledDate:'2025-03-20', note:'Quarterly order'   },
  { id:'RC-005', product:'Office Chair Pro',   qty:8,   supplier:'FurnMax',   warehouse:'Warehouse B', status:'Done',    date:'2025-03-10', scheduledDate:'2025-03-10', note:'Replacement batch' },
  { id:'RC-006', product:'USB-C Hub 7-Port',   qty:30,  supplier:'TechCorp',  warehouse:'Warehouse A', status:'Waiting', date:'2025-03-18', scheduledDate:'2025-03-19', note:'Low stock top-up'  },
];

// ─────────────────────────────────────────────
// DELIVERIES (Outgoing Stock)
// ─────────────────────────────────────────────
export const mockDeliveries = [
  { id:'DO-001', product:'A4 Paper Ream 500s', qty:20,  customer:'Accounts Dept',   warehouse:'Warehouse A', status:'Done',     date:'2025-03-14', scheduledDate:'2025-03-14', note:'Dept requisition'   },
  { id:'DO-002', product:'HDMI Cable 2m',      qty:3,   customer:'IT Team',          warehouse:'Warehouse C', status:'Done',     date:'2025-03-13', scheduledDate:'2025-03-13', note:'Conference room'    },
  { id:'DO-003', product:'Mechanical Pencil',  qty:30,  customer:'Design Team',      warehouse:'Warehouse A', status:'Ready',    date:'2025-03-15', scheduledDate:'2025-03-15', note:'Design team supply' },
  { id:'DO-004', product:'Wireless Keyboard',  qty:5,   customer:'HR Dept',          warehouse:'Warehouse A', status:'Waiting',  date:'2025-03-16', scheduledDate:'2025-03-17', note:'New joinee kits'    },
  { id:'DO-005', product:'Standing Desk',      qty:2,   customer:'Executive Floor',  warehouse:'Warehouse B', status:'Draft',    date:'2025-03-17', scheduledDate:'2025-03-20', note:'Office renovation'  },
  { id:'DO-006', product:'Monitor 27" 4K',     qty:2,   customer:'Engineering',      warehouse:'Warehouse C', status:'Canceled', date:'2025-03-12', scheduledDate:'2025-03-12', note:'Order canceled'     },
];

// ─────────────────────────────────────────────
// INTERNAL TRANSFERS
// ─────────────────────────────────────────────
export const mockTransfers = [
  { id:'IT-001', product:'Wireless Keyboard',  qty:10, fromWarehouse:'Warehouse A', toWarehouse:'Warehouse C', status:'Done',     date:'2025-03-13', note:'Balance stock'      },
  { id:'IT-002', product:'A4 Paper Ream 500s', qty:50, fromWarehouse:'Warehouse A', toWarehouse:'Warehouse B', status:'Ready',    date:'2025-03-15', note:'Low supply at B'    },
  { id:'IT-003', product:'HDMI Cable 2m',      qty:20, fromWarehouse:'Warehouse C', toWarehouse:'Warehouse A', status:'Waiting',  date:'2025-03-16', note:'Rebalancing stock'  },
  { id:'IT-004', product:'Stapler Heavy Duty', qty:5,  fromWarehouse:'Warehouse A', toWarehouse:'Warehouse B', status:'Draft',    date:'2025-03-17', note:'Request from B mgr' },
  { id:'IT-005', product:'Standing Desk',      qty:3,  fromWarehouse:'Warehouse B', toWarehouse:'Warehouse C', status:'Canceled', date:'2025-03-11', note:'Transfer canceled'  },
];

// ─────────────────────────────────────────────
// MOVE HISTORY (combined log)
// ─────────────────────────────────────────────
export const mockMoveHistory = [
  { id:'MH-001', docType:'Receipt',    docId:'RC-001', product:'Wireless Keyboard',  qty:50,  from:'Supplier/TechCorp', to:'Warehouse A',   status:'Done',    date:'2025-03-14 09:12', user:'Arjun S.' },
  { id:'MH-002', docType:'Delivery',   docId:'DO-001', product:'A4 Paper Ream 500s', qty:20,  from:'Warehouse A',       to:'Accounts Dept', status:'Done',    date:'2025-03-14 10:45', user:'Priya M.' },
  { id:'MH-003', docType:'Delivery',   docId:'DO-002', product:'HDMI Cable 2m',      qty:3,   from:'Warehouse C',       to:'IT Team',       status:'Done',    date:'2025-03-13 14:30', user:'Rohan K.' },
  { id:'MH-004', docType:'Receipt',    docId:'RC-005', product:'Office Chair Pro',   qty:8,   from:'Supplier/FurnMax',  to:'Warehouse B',   status:'Done',    date:'2025-03-10 10:00', user:'Arjun S.' },
  { id:'MH-005', docType:'Transfer',   docId:'IT-001', product:'Wireless Keyboard',  qty:10,  from:'Warehouse A',       to:'Warehouse C',   status:'Done',    date:'2025-03-13 15:00', user:'Priya M.' },
  { id:'MH-006', docType:'Adjustment', docId:'ADJ-001',product:'Mechanical Pencil',  qty:-5,  from:'Warehouse A',       to:'—',             status:'Done',    date:'2025-03-12 11:30', user:'Rohan K.' },
  { id:'MH-007', docType:'Receipt',    docId:'RC-002', product:'Standing Desk',      qty:5,   from:'Supplier/FurnMax',  to:'Warehouse B',   status:'Ready',   date:'2025-03-15 09:00', user:'Arjun S.' },
  { id:'MH-008', docType:'Delivery',   docId:'DO-003', product:'Mechanical Pencil',  qty:30,  from:'Warehouse A',       to:'Design Team',   status:'Ready',   date:'2025-03-15 11:00', user:'Priya M.' },
  { id:'MH-009', docType:'Transfer',   docId:'IT-002', product:'A4 Paper Ream 500s', qty:50,  from:'Warehouse A',       to:'Warehouse B',   status:'Waiting', date:'2025-03-16 08:00', user:'Rohan K.' },
  { id:'MH-010', docType:'Delivery',   docId:'DO-004', product:'Wireless Keyboard',  qty:5,   from:'Warehouse A',       to:'HR Dept',       status:'Waiting', date:'2025-03-16 13:00', user:'Arjun S.' },
];

// ─────────────────────────────────────────────
// WAREHOUSES / LOCATIONS
// ─────────────────────────────────────────────
export const mockWarehouses = [
  { id:'wh1', name:'Warehouse A', address:'Plot 12, GIDC Industrial Estate, Vatva, Ahmedabad - 382445', manager:'Arjun Shah',   phone:'+91 79001 23456', capacity:500, used:380, type:'Main'      },
  { id:'wh2', name:'Warehouse B', address:'Unit 5, Kathwada GIDC, Kathwada, Ahmedabad - 382430',        manager:'Priya Mehta',  phone:'+91 79002 34567', capacity:300, used:145, type:'Secondary' },
  { id:'wh3', name:'Warehouse C', address:'Shop 8, Naroda Industrial Area, Naroda, Ahmedabad - 382330', manager:'Rohan Kapoor', phone:'+91 79003 45678', capacity:200, used:72,  type:'Overflow'  },
];

// ─────────────────────────────────────────────
// MOCK USERS (login validation)
// ─────────────────────────────────────────────
export const mockUsers = [
  { id:1, email:'admin@stockiq.in',  password:'admin123',  role:'admin',  name:'Arjun Shah',   position:'Inventory Manager' },
  { id:2, email:'staff@stockiq.in',  password:'staff123',  role:'staff',  name:'Priya Mehta',  position:'Warehouse Staff'   },
  { id:3, email:'viewer@stockiq.in', password:'viewer123', role:'viewer', name:'Rohan Kapoor', position:'Read-Only Analyst' },
];

// ─────────────────────────────────────────────
// CHART DATA
// ─────────────────────────────────────────────
export const chartData = {
  weekly:  { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], in:[12,19,7,25,14,8,22], out:[8,14,11,18,9,3,17] },
  monthly: { labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], in:[120,98,145,87,160,134,109,177,142,158,133,190], out:[88,72,110,65,130,98,80,145,115,122,99,160] },
};

// ─────────────────────────────────────────────
// STATIC DROPDOWN LISTS
// ─────────────────────────────────────────────
export const categories = ['All', 'Electronics', 'Furniture', 'Stationery'];
export const suppliers  = ['TechCorp', 'FurnMax', 'OfficeHub'];
export const warehouses = ['Warehouse A', 'Warehouse B', 'Warehouse C'];
export const statusList = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
export const docTypes   = ['Receipt', 'Delivery', 'Transfer', 'Adjustment'];
