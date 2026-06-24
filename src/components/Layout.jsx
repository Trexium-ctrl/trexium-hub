import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, Users, Building2, FolderKanban, FileQuestion,
  Calendar, DollarSign, FolderOpen, CheckSquare, Settings, Menu, X, LogOut
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/customers', label: 'Customers', icon: Building2 },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/questionnaires', label: 'Questionnaires', icon: FileQuestion },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/payments', label: 'Payments', icon: DollarSign },
  { path: '/files', label: 'Files', icon: FolderOpen },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0D0D12] border-b border-[#1E1E26] flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="!p-2 rounded-lg hover:bg-[#161620]">
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          <span className="font-bold text-sm tracking-wide">TREXIUM</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#050508] border-r border-[#1E1E26] overflow-y-auto">
            <div className="flex items-center justify-between !p-4 border-b border-[#1E1E26]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                <span className="font-bold text-white tracking-wide">TREXIUM</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="!p-1.5 rounded-lg hover:bg-[#161620]">
                <X className="w-4 h-4 text-[#A0A0A0]" />
              </button>
            </div>
            <nav className="!p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 !px-3 !py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#00F0FF]/10 text-[#00F0FF]'
                        : 'text-[#A0A0A0] hover:text-white hover:bg-[#161620]'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-[#050508] border-r border-[#1E1E26] flex-col">
        <div className="flex items-center gap-2.5 !px-5 !py-5 border-b border-[#1E1E26]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]" />
          <div>
            <span className="font-bold text-white text-sm block leading-tight tracking-wide">TREXIUM</span>
            <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider">Hub</span>
          </div>
        </div>
        <nav className="flex-1 !p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 !px-3 !py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF]'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#161620]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="!p-4 border-t border-[#1E1E26]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#00C8D6] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{(user?.full_name || user?.email || 'T')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.full_name || user?.email || 'User'}</p>
              <p className="text-[10px] text-[#A0A0A0] capitalize">{user?.role || 'user'}</p>
            </div>
            <button onClick={() => logout()} className="w-8 h-8 rounded-lg bg-[#161620] hover:bg-[#1E1E26] flex items-center justify-center" title="Sign out">
              <LogOut className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 !pt-14 lg:!pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}