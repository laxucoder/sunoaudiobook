import React from 'react';
import { X, LogOut } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#181825] w-full max-w-sm p-6 rounded-2xl border border-white/10 animate-scale-in text-center shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut size={32} className="text-[#E50914]" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
        <p className="text-gray-400 mb-6 text-sm">Are you sure you want to log out of your account?</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-gray-300 hover:bg-white/5 transition-colors border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#E50914] hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;