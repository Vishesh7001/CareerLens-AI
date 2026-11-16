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

const navigationSections = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Career Development',
    items: [
      {
        name: 'Resume Analysis',
        href: '/analysis',
        icon: Sparkles,
      },
      {
        name: 'My Target Jobs',
        href: '/jobs',
        icon: FileText,
      },
      {
        name: 'Job Matching',
        href: '/job-matching',
        icon: Briefcase,
      },
      {
        name: 'Career Paths',
        href: '/career-recommendations',
        icon: Compass,
      },
      {
        name: 'Learning Roadmaps',
        href: '/roadmaps',
        icon: Map,
      },
    ],
  },
  {
    title: 'Interview Preparation',
    items: [
      {
        name: 'Mock Interview',
        href: '/mock-interview',
        icon: MessageSquareCode,
      },
      {
        name: 'Interview History',
        href: '/interview-history',
        icon: History,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        name: 'My Profile',
        href: '/profile',
        icon: User,
      },
    ],
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-navy to-slate-900 flex-shrink-0 flex items-center justify-center text-white shadow-sm">
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

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1.5">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center py-2.5' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100">
          <div
            className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 ${
              isCollapsed ? 'text-center' : ''
            }`}
          >
            {!isCollapsed ? (
              <>
                <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                  <span>Career Platform</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Phase 6 Complete Platform Live
                </div>
              </>
            ) : (
              <div className="font-black text-brand-primary text-xs">v6.0</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

