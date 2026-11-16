import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
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
          className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-slate-100 transition-colors text-left"
          title="View profile"
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {getInitials(user?.fullName)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.fullName || 'User'}
            </div>
            <div className="text-[11px] text-slate-400 leading-tight truncate max-w-[140px]">
              {user?.email}
            </div>
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Logout action */}
        <Button
          variant="ghost"
          size="sm"
          icon={LogOut}
          onClick={handleLogout}
          className="text-slate-600 hover:text-red-600 hover:bg-red-50"
        >
          <span className="hidden md:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;

