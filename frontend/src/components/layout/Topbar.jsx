import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, PanelLeftClose, PanelLeftOpen, Sparkles, Target } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import NotificationBell from '../notifications/NotificationBell';

const Topbar = ({ openMobileSidebar, isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Generate initials from user full name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-brand-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-soft-xs">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-brand-slate hover:text-brand-charcoal hover:bg-brand-bg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Link */}
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 group cursor-pointer focus:outline-none"
          title="CareerLens AI Home"
          aria-label="CareerLens AI Home"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-soft-xs group-hover:bg-brand-primaryHover transition-colors">
            <Target className="w-4 h-4 text-brand-forestLight" />
          </div>
          <span className="text-base font-heading font-bold text-brand-charcoal tracking-tight">
            CareerLens <span className="text-brand-primary font-serif italic text-lg font-normal">AI</span>
          </span>
        </Link>

        {/* Desktop sidebar collapse toggle */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-xl text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-heading font-medium tracking-wide text-brand-muted uppercase">
            Career Intelligence Platform
          </span>
        </div>
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Card / Pill */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-brand-bg transition-colors text-left group"
          title="View profile"
        >
          <div className="w-8 h-8 rounded-full bg-brand-forestLight text-brand-primary border border-brand-sageBorder/50 flex items-center justify-center text-xs font-heading font-bold shadow-soft-xs group-hover:border-brand-primary/40 transition-colors">
            {getInitials(user?.fullName)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-heading font-semibold text-brand-charcoal leading-tight">
              {user?.fullName || 'User'}
            </div>
            <div className="text-[11px] text-brand-muted leading-tight truncate max-w-[140px]">
              {user?.email}
            </div>
          </div>
        </button>

        <div className="h-5 w-px bg-brand-border" />

        {/* Logout action */}
        <Button
          variant="ghost"
          size="sm"
          icon={LogOut}
          onClick={handleLogout}
          className="text-brand-muted hover:text-brand-danger hover:bg-red-50/50"
        >
          <span className="hidden md:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
