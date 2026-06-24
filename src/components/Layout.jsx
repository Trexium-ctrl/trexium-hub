import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, FolderKanban, FileQuestion,
  Calendar, DollarSign, FolderOpen, CheckSquare, Settings, Menu, X, Rocket
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-[#30363D]">
          <Menu className="w-5 h-5 text-[#E6EDF3]" />
        </button>
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[#7C3AED]" />
          <span className="font-semibold text-sm">Trexium</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0D1117] border-r border-[#30363D] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6E56CF] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#E6EDF3]">Trexium</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[#30363D]">
                <X className="w-4 h-4 text-[#8B949E]" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#7C3AED]/15 text-[#7C3AED]'
                        : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
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
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-[#0D1117] border-r border-[#30363D] flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#30363D]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6E56CF] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#E6EDF3] text-sm block leading-tight">Trexium</span>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-wider">Command Center</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#7C3AED]/15 text-[#7C3AED]'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#30363D] flex items-center justify-center">
              <span className="text-xs font-bold text-[#8B949E]">TX</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#E6EDF3] truncate">Trexium Team</p>
              <p className="text-[10px] text-[#8B949E]">2 partners</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}