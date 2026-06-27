import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? 'bg-slate-700 font-bold' : '';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 text-xl font-bold border-b border-slate-700 tracking-wide text-indigo-400">
          NIA Admin Console
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link to="dashboard" className={`block p-3 rounded transition-colors hover:bg-slate-800 ${isActive('dashboard')}`}>
            📊 System Performance
          </Link>
          <Link to="forms" className={`block p-3 rounded transition-colors hover:bg-slate-800 ${isActive('forms')}`}>
            📋 Global Form Templates
          </Link>
          <Link to="logs" className={`block p-3 rounded transition-colors hover:bg-slate-800 ${isActive('logs')}`}>
            🧾 AI Audit Trails
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          Environment: Production-2026
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-600">Console Monitor / Admin Role</h2>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}