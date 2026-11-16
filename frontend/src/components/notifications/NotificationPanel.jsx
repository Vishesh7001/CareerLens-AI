import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  FileCheck2,
  Briefcase,
  Map,
  MessageSquareCode,
  Award,
  X,
  Clock,
} from 'lucide-react';
import notificationService from '../../services/notificationService';

const NotificationPanel = ({ isOpen, onClose, onCountChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      if (data?.success) {
        setNotifications(data.notifications || []);
        if (typeof onCountChange === 'function') {
          onCountChange(data.unreadCount || 0);
        }
      }
    } catch {
      // Soft fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Click outside handler
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const data = await notificationService.markAsRead(id);
      if (data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        if (typeof onCountChange === 'function') {
          onCountChange(data.unreadCount || 0);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const data = await notificationService.markAllAsRead();
      if (data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        if (typeof onCountChange === 'function') {
          onCountChange(0);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const data = await notificationService.deleteNotification(id);
      if (data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (typeof onCountChange === 'function') {
          onCountChange(data.unreadCount || 0);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleClickItem = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'resume_upload':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'resume_analysis':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'roadmap_milestone':
        return <Map className="w-4 h-4 text-teal-600" />;
      case 'interview_completed':
        return <MessageSquareCode className="w-4 h-4 text-purple-600" />;
      case 'readiness_updated':
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Notifications
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickItem(n)}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                !n.isRead ? 'bg-sky-50/30' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-xs font-bold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(n.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n._id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-0.5 rounded transition-opacity"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
              You will receive updates when resumes are parsed, matches are generated, or interviews are completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
