import React from 'react';
import { X, Music, RefreshCw, Calendar, Check, Music2 } from 'lucide-react';

const PurchaseOptionsModal = ({ isOpen, onClose, item, onBuySingle, onSubscribe, subscriptionPrice }) => {
  if (!isOpen) return null;
  const displayPrice = subscriptionPrice || 499;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#181825] w-full max-w-3xl p-6 rounded-2xl border border-white/10 animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>

        <h3 className="text-xl font-black text-white mb-1 text-center">Unlock Content</h3>
        <p className="text-gray-400 text-sm text-center mb-6">Choose the plan that suits you best</p>
        <div className="grid md:grid-cols-2 gap-4">
          {item && (
            <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 flex flex-col hover:border-[#E50914] transition-colors group relative overflow-hidden">

              <div className="flex justify-between items-start mb-2">
                <div className="bg-gray-800 p-2 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-[#E50914] transition-colors">
                  <Music2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Monthly</span>
              </div>

              <h4 className="text-base font-bold text-white">Rent for 30 Days</h4> {/* UPDATED TEXT */}

              <p className="text-gray-400 text-[11px] leading-tight mb-4 flex-1 mt-1">
                Single content access. Valid for 30 days from purchase.
              </p>

              <div className="text-lg font-black text-white mb-3">₹{item.price}</div>

              <button
                onClick={() => onBuySingle(item)}
                className="w-full py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Rent Now
              </button>
            </div>
          )}
          <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 flex flex-col hover:border-green-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-green-500/10 p-2 rounded-lg text-green-400"><Calendar size={20} /></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Prepaid</span>
            </div>
            <h4 className="text-base font-bold text-white">1 Month Pass</h4>
            <p className="text-gray-500 text-[11px] leading-tight mb-4 flex-1 mt-1">
              Unlock the full library for 30 days. No auto-renewal.
            </p>
            <div className="text-lg font-black text-white mb-3">₹{displayPrice}</div>
            <button
              onClick={() => onSubscribe('ONE_TIME')}
              className="w-full py-2 bg-gray-800 hover:bg-green-600 text-gray-200 text-xs font-bold rounded-lg transition-colors border border-gray-600"
            >
              Get 1 Month
            </button>
          </div>
          {/* <div className="bg-[#181825] border border-gray-700/50 rounded-xl p-4 flex flex-col relative overflow-hidden opacity-60 cursor-not-allowed">
            <div className="absolute top-0 right-0 bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">COMING SOON</div>

            <div className="flex justify-between items-start mb-2">
              <div className="bg-gray-700/50 p-2 rounded-lg text-gray-400"><RefreshCw size={20} /></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Recurring</span>
            </div>
            <h4 className="text-base font-bold text-gray-300">Auto Subscription</h4>
            <p className="text-gray-500 text-[11px] leading-tight mb-4 flex-1 mt-1">
              Uninterrupted access. Auto-debits monthly. Cancel anytime.
            </p>
            <div className="text-lg font-black text-gray-400 mb-3">₹{displayPrice}<span className="text-[10px] font-normal text-gray-600">/mo</span></div>

            <button
              disabled={true}
              className="w-full py-2 bg-gray-700 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-1"
            >
              Unavailable
            </button>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default PurchaseOptionsModal;