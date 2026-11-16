import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Compass,
  Map,
  MessageSquareCode,
  History,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    isAvailable: true,
  },
  {
    name: 'My Profile',
    href: '/profile',
    icon: User,
    isAvailable: true,
  },
  {
    name: 'My Resume',
    href: '/dashboard#resume-section',
    icon: FileText,
    isAvailable: true,
  },
  {
    name: 'AI Resume Analysis',
    href: '/analysis',
    icon: Sparkles,
    isAvailable: true,
  },
  {
    name: 'Job Matching',
    href: '/job-matching',
    icon: Briefcase,
    isAvailable: true,
  },
  {
    name: 'My Target Jobs',
    href: '/jobs',
    icon: FileText,
    isAvailable: true,
  },
  {
    name: 'Career Paths',
    href: '/career-recommendations',
    icon: Compass,
    isAvailable: true,
  },
  {
    name: 'Learning Roadmap',
    href: '/roadmaps',
    icon: Map,
    isAvailable: true,
  },
  {
    name: 'Mock Interview',
    href: '/mock-interview',
    icon: MessageSquareCode,
    isAvailable: true,
  },
  {
    name: 'Interview History',
    href: '/interview-history',
    icon: History,
    isAvailable: true,
  },
  {
    name: 'Settings',
    href: '#settings',
    icon: Settings,
    isAvailable: true,
    isPlaceholder: true,
  },
];

const Sidebar = ({ isMobileOpen, closeMobileSidebar, isCollapsed, toggleCollapse }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-brand-navy flex-shrink-0 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
                CareerLens <span className="text-brand-primary">AI</span>
              </span>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
            {!isCollapsed ? 'Platform Navigation' : 'Nav'}
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            if (item.isAvailable && !item.isPlaceholder) {
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    closeMobileSidebar();
                    if (item.href.includes('#resume-section')) {
                      setTimeout(() => {
                        const el = document.getElementById('resume-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            }

            // Future phase items with Coming Soon badge
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed select-none group ${isCollapsed ? 'justify-center' : ''
                  }`}
                title={isCollapsed ? `${item.name} (Coming Soon)` : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500" />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    Soon
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100">
          <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <>
                <div className="font-semibold text-slate-700">Phase 2 Live</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Resume Intelligence Active</div>
              </>
            ) : (
              <div className="font-bold text-slate-700">v2.0</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

