import React, { useState, useRef, useEffect } from 'react';
import { Home, Info, HelpCircle, Settings, User, LogOut, Menu, X, Search, Crown } from 'lucide-react';

const Navbar = ({ activePage, navigate, user, onLoginClick, onLogout, onSearchChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef(null);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (searchOpen) {
          setSearchOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    onSearchChange(val);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-350 mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <div
            onClick={() => { navigate('home'); setSearchInput(''); onSearchChange(''); }}
            className="text-2xl font-black text-[#E50914] tracking-tighter cursor-pointer select-none"
          >
            Suno Audiobook
          </div>

          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { navigate(link.id); setSearchInput(''); onSearchChange(''); }}
                className={`flex items-center gap-2 text-sm font-bold transition-all ${activePage === link.id ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('admin')}
                className={`flex items-center gap-2 text-sm font-bold transition-all ${activePage === 'admin' ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Settings size={16} /> Admin
              </button>
            )}
            {user && (
              <button
                onClick={() => navigate('profile')}
                className={`flex items-center gap-2 text-sm font-bold transition-all ${activePage === 'profile' ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <User size={16} /> Profile
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            ref={searchRef}
            className={`flex items-center bg-[#181825] border ${searchOpen ? 'border-[#E50914] w-48 md:w-64' : 'border-transparent w-10'} rounded-full transition-all duration-300 overflow-hidden`}
          >
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) { setSearchInput(''); onSearchChange(''); }
              }}
              className="p-2 text-gray-400 hover:text-white flex-shrink-0"
            >
              <Search size={20} />
            </button>
            <input type="text" placeholder="Titles, genres..." className={`bg-transparent text-white text-sm outline-none px-2 w-full ${searchOpen ? 'opacity-100' : 'opacity-0'}`} value={searchInput} onChange={handleSearch} />
            {searchOpen && searchInput && (
              <button onClick={() => { setSearchInput(''); onSearchChange(''); }} className="pr-3 text-gray-500 hover:text-white"><X size={14} /></button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-[#181825] py-1.5 px-4 rounded-full border border-white/10">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white font-bold select-none relative">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gradient-to-br from-[#E50914] to-purple-900 rounded-full flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-300 truncate max-w-[100px]">
                  {user.name}
                </span>
                {user.isPremium && <Crown size={14} className="text-yellow-400" fill="currentColor" />}
                <button onClick={onLogout} className="text-[#E50914] hover:text-red-400" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={onLoginClick} className="bg-[#E50914] hover:bg-[#ff1c32] text-white px-6 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-[0_0_15px_rgba(229,9,20,0.4)]">
                Login
              </button>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a14] border-t border-white/10 animate-fade-in-down">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { navigate(link.id); setMobileOpen(false); }}
                className={`flex items-center gap-3 text-left font-semibold ${activePage === link.id ? 'text-[#E50914]' : 'text-gray-300'}`}
              >
                <link.icon size={18} /> {link.label}
              </button>
            ))}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => { navigate('admin'); setMobileOpen(false); }}
                className={`flex items-center gap-3 text-left font-semibold ${activePage === 'admin' ? 'text-[#E50914]' : 'text-gray-300'}`}
              >
                <Settings size={18} /> Admin
              </button>
            )}
            {user && (
              <button
                onClick={() => { navigate('profile'); setMobileOpen(false); }}
                className={`flex items-center gap-3 text-left font-semibold ${activePage === 'profile' ? 'text-[#E50914]' : 'text-gray-300'}`}
              >
                <User size={18} /> My Profile
              </button>
            )}

            <div className="h-px bg-gray-800 my-2"></div>

            {user ? (
              <button onClick={onLogout} className="text-left text-red-500 font-bold flex items-center gap-2">
                <LogOut size={18} /> Logout ({user.name})
              </button>
            ) : (
              <button onClick={() => { onLoginClick(); setMobileOpen(false); }} className="text-left text-[#E50914] font-bold">Login</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;