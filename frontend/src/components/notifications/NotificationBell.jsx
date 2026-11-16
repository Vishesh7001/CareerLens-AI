import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../../services/notificationService';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 1 });
      if (data?.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Soft fallback
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onCountChange={(count) => setUnreadCount(count)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
