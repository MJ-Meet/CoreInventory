import React from 'react';

const icons = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd"/>
    </svg>
  ),
};

const styles = {
  success: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400', text: 'text-emerald-100' },
  error:   { bg: 'bg-red-500/10 border-red-500/20',         icon: 'text-red-400',     text: 'text-red-100'   },
  warning: { bg: 'bg-amber-500/10 border-amber-500/20',     icon: 'text-amber-400',   text: 'text-amber-100' },
  info:    { bg: 'bg-blue-500/10 border-blue-500/20',       icon: 'text-blue-400',    text: 'text-blue-100'  },
};

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const s = styles[toast.type] || styles.info;
        return (
          <div
            key={toast.id}
            className={`animate-toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${s.bg} backdrop-blur-sm min-w-64 max-w-80 cursor-pointer`}
            onClick={() => removeToast(toast.id)}
          >
            <span className={s.icon}>{icons[toast.type] || icons.info}</span>
            <p className={`text-sm font-medium ${s.text} flex-1`}>{toast.message}</p>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-white/30 hover:text-white/60 transition-colors">
              <path d="M2.22 2.22a.75.75 0 011.06 0L8 6.94l4.72-4.72a.75.75 0 111.06 1.06L9.06 8l4.72 4.72a.75.75 0 11-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 01-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 010-1.06z"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
