import React from 'react';
import { CheckCircle, AlertTriangle, Info, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let bgClass = 'bg-slate-900 text-white';
          let borderClass = 'border-slate-800';

          if (toast.type === 'success') {
            Icon = CheckCircle;
            bgClass = 'bg-white text-slate-800 shadow-xl';
            borderClass = 'border-l-4 border-l-emerald-500 border-y-slate-100 border-r-slate-100 border';
          } else if (toast.type === 'error') {
            Icon = AlertTriangle;
            bgClass = 'bg-white text-slate-800 shadow-xl';
            borderClass = 'border-l-4 border-l-rose-500 border-y-slate-100 border-r-slate-100 border';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            bgClass = 'bg-white text-slate-800 shadow-xl';
            borderClass = 'border-l-4 border-l-amber-500 border-y-slate-100 border-r-slate-100 border';
          } else if (toast.type === 'info') {
            Icon = Bell;
            bgClass = 'bg-white text-slate-800 shadow-xl';
            borderClass = 'border-l-4 border-l-[#003A78] border-y-slate-100 border-r-slate-100 border';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className={`p-4 rounded-lg flex items-start gap-3 pointer-events-auto ${bgClass} ${borderClass}`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <Icon className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <Icon className="w-5 h-5 text-rose-500" />}
                {toast.type === 'warning' && <Icon className="w-5 h-5 text-amber-500" />}
                {toast.type === 'info' && <Icon className="w-5 h-5 text-[#003A78]" />}
              </div>
              <div className="flex-1 text-sm font-medium leading-tight pr-2">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
