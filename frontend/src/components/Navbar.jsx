import React, { useState } from 'react';
import { 
  LayoutDashboard, ScanText, ShieldAlert, Bell, 
  BarChart3, Settings2, Search, UserCheck, LogOut, 
  Menu, X, Sparkles, AlertTriangle
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isAuthenticated, 
  setIsAuthenticated, 
  setShowAuthModal, 
  reminderCount,
  conflictCount,
  onOpenSearch
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'OCR Studio', icon: ScanText },
    { 
      id: 'conflicts', 
      label: 'Conflict Radar', 
      icon: ShieldAlert,
      badge: conflictCount > 0 ? `${conflictCount}` : null,
      badgeColor: 'bg-red-600 text-white'
    },
    { 
      id: 'reminders', 
      label: 'Alerts Hub', 
      icon: Bell,
      badge: reminderCount > 0 ? `${reminderCount}` : null,
      badgeColor: 'bg-amber-500 text-black'
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin Portal', icon: Settings2 }
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & College Affiliation */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0" 
          onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/60 flex items-center justify-center text-amber-400 font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:border-amber-400 transition">
            D<span className="text-red-500">AI</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-zinc-100 uppercase">
                Deadline<span className="text-amber-500">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-800/60 rounded-full uppercase">
                MIT-WPU
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-tight">Intelligent Academic Notice & Action Engine</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center bg-zinc-900/90 p-1.5 border border-zinc-800 rounded-2xl space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 relative ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions & Auth Widget */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Search trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center space-x-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 px-3 py-2 rounded-xl text-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-400">Search notices...</span>
            <kbd className="bg-zinc-800 text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-700">⌘K</kbd>
          </button>

          {/* User Auth Action Trigger */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center border border-red-400 shadow-sm">
                SJ
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-zinc-100 leading-tight">Samay Jain</p>
                <p className="text-[9px] text-zinc-500 font-mono">PRN: 1272251075</p>
              </div>
              <button 
                onClick={() => setIsAuthenticated(false)} 
                className="text-zinc-500 hover:text-red-400 p-1 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.25)] uppercase tracking-wider flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden pt-4 pb-2 border-t border-zinc-800 mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-amber-500 text-black font-black'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}