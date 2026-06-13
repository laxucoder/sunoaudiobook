import React, { useState } from 'react';
import { X, Crown, CheckCircle, Calendar, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const SubscriptionModal = ({ isOpen, onClose, user, onUpgrade, onUpdateUser, price }) => {
  if (!isOpen) return null;

  const displayPrice = price || 499;

  const expiryDate = user.subscriptionEndDate
    ? new Date(user.subscriptionEndDate).toLocaleDateString()
    : 'N/A';
  if (user.role === 'ADMIN') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#181825] w-full max-w-lg p-8 rounded-2xl border border-white/10 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
          <ShieldCheck size={64} className="text-[#E50914] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Admin Account</h2>
          <p className="text-gray-400 mb-6">You have unlimited access to all content.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#181825] w-full max-w-lg p-8 rounded-2xl border border-white/10 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

        <div className="text-center mb-8">
          <Crown size={48} className={`mx-auto mb-4 ${user.isPremium ? 'text-green-400' : 'text-[#E50914]'}`} fill="currentColor" />
          <h3 className="text-3xl font-black text-white">My Subscription</h3>
        </div>
        {user.isPremium ? (
          <div className="space-y-6">
            <div className="bg-[#121212] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Status</span>
                <span className="flex items-center gap-2 text-green-400 font-bold bg-green-900/20 px-3 py-1 rounded-full">
                  <CheckCircle size={14} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-bold">Premium (1 Month Pass)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Valid Until</span>
                <span className="text-white font-bold flex items-center gap-2"><Calendar size={14} /> {expiryDate}</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-3">Want to extend your validity?</p>
              <button
                onClick={onUpgrade}
                className="text-[#E50914] font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                Add Another Month <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 mb-6">
              <p className="text-gray-400 text-sm uppercase font-bold mb-2">Current Status</p>
              <h2 className="text-2xl font-bold text-white mb-1">Free Tier</h2>
              <p className="text-gray-500 text-sm mb-4">
                Unlock unlimited access to all stories and premium features.
              </p>
              <div className="text-3xl font-black text-[#E50914]">
                ₹{displayPrice} <span className="text-sm text-gray-500 font-normal">for 1 Month</span>
              </div>
            </div>

            <button
              onClick={onUpgrade}
              className="w-full py-4 bg-[#E50914] text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-900/30 text-lg flex items-center justify-center gap-2"
            >
              <CreditCard size={20} /> Get Premium (1 Month)
            </button>
            <p className="text-xs text-gray-500 mt-4">One-time payment. No auto-renewal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;