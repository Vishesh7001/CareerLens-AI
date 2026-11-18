import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Compass,
  Map,
  MessageSquareCode,
  History,
  Sparkles,
  X,
  Target,
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
        name: 'Target Jobs',
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
          className="fixed inset-0 z-40 bg-brand-charcoal/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-brand-border transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-brand-border/70">
          <Link
            to="/"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-xl"
            title="CareerLens AI Home"
            aria-label="CareerLens AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex-shrink-0 flex items-center justify-center text-white shadow-soft-xs group-hover:bg-brand-primaryHover transition-colors">
              <Target className="w-5 h-5 text-brand-forestLight" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-heading font-bold text-brand-charcoal tracking-tight whitespace-nowrap group-hover:text-brand-primary transition-colors">
                CareerLens <span className="text-brand-primary font-serif italic text-lg font-normal">AI</span>
              </span>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[11px] font-heading font-bold tracking-wider text-brand-muted uppercase px-3 mb-2">
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-soft-xs font-semibold'
                          : 'text-brand-slate hover:bg-brand-bg hover:text-brand-charcoal'
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

        {/* Footer info card */}
        <div className="p-3.5 border-t border-brand-border/70">
          <div
            className={`p-3 rounded-xl bg-brand-bg border border-brand-border/70 text-xs text-brand-muted ${
              isCollapsed ? 'text-center' : ''
            }`}
          >
            {!isCollapsed ? (
              <>
                <div className="flex items-center justify-between font-heading font-semibold text-brand-charcoal text-xs">
                  <span>Career Workspace</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-brand-primary font-medium bg-brand-forestLight px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-brand-muted mt-1 leading-snug">
                  AI-Powered Guidance
                </div>
              </>
            ) : (
              <div className="font-heading font-bold text-brand-primary text-xs">AI</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
