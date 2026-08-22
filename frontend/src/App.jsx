import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import NoticeDetailModal from './components/NoticeDetailModal';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import UploadStudio from './pages/UploadStudio';
import ConflictRadar from './components/ConflictRadar';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
import AdminPortal from './pages/AdminPortal';
import { noticeService } from './services/noticeService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth state (Samay Jain, MIT-WPU)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core data states loaded from noticeService with persistence
  const [notices, setNotices] = useState(() => noticeService.getNotices());
  const [reminders, setReminders] = useState(() => noticeService.getReminders());
  const [categoryList, setCategoryList] = useState(() => noticeService.getCategories());

  // Modal inspection state
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Auto-save changes to storage
  useEffect(() => {
    noticeService.saveNotices(notices);
  }, [notices]);

  useEffect(() => {
    noticeService.saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    noticeService.saveCategories(categoryList);
  }, [categoryList]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('dashboard');
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleDone = (id) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextStatus = n.status === "Completed" ? "Upcoming" : "Completed";
          addToast(
            nextStatus === "Completed" ? "Task Completed! 🎉" : "Task Reopened",
            `"${n.title.substring(0, 30)}..." updated to ${nextStatus}.`,
            nextStatus === "Completed" ? "success" : "info"
          );
          return { ...n, status: nextStatus };
        }
        return n;
      })
    );
  };

  const handleToggleReminder = (notice) => {
    const exists = reminders.find((r) => r.noticeId === notice.id || r.title === notice.title);
    if (exists) {
      setReminders((prev) => prev.filter((r) => r.id !== exists.id));
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, reminderSet: false } : n))
      );
      addToast("Alert Cancelled", `Reminder for "${notice.title.substring(0, 25)}..." turned off.`, "info");
    } else {
      const newRem = {
        id: `rem-${Date.now()}`,
        noticeId: notice.id,
        title: notice.title,
        channel: "Email & WhatsApp",
        triggerDate: `${notice.dueDate} • 09:00 AM`,
        dueDate: notice.dueDate,
        priority: notice.priority,
        status: "Active",
        offset: "2 days before"
      };
      setReminders((prev) => [...prev, newRem]);
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, reminderSet: true } : n))
      );
      addToast("Reminder Scheduled 🔔", `Alert active via Email & WhatsApp 48 hrs prior.`, "success");
    }
  };

  const handleAddNotice = (newNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
    if (newNotice.reminderSet) {
      const newRem = {
        id: `rem-${Date.now()}`,
        noticeId: newNotice.id,
        title: newNotice.title,
        channel: "Email & Push",
        triggerDate: `${newNotice.dueDate} • 09:00 AM`,
        dueDate: newNotice.dueDate,
        priority: newNotice.priority,
        status: "Active",
        offset: "2 days before"
      };
      setReminders((prev) => [...prev, newRem]);
    }
  };

  const handleAddCategory = (newCat) => {
    if (!categoryList.includes(newCat)) {
      setCategoryList((prev) => [...prev, newCat]);
    }
  };

  const handleAddCustomReminder = (newRem) => {
    setReminders((prev) => [...prev, newRem]);
    setNotices((prev) =>
      prev.map((n) => (n.id === newRem.noticeId ? { ...n, reminderSet: true } : n))
    );
  };

  // Compute active conflict clusters count
  const activeNotices = notices.filter(n => n.status !== 'Completed');
  const dateCounts = {};
  activeNotices.forEach(n => {
    dateCounts[n.dueDate] = (dateCounts[n.dueDate] || 0) + 1;
  });
  const conflictCount = Object.values(dateCounts).filter(c => c > 1).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Sleek top glowing border line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-cyan-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>

      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        setShowAuthModal={setShowAuthModal}
        reminderCount={reminders.length}
        conflictCount={conflictCount}
        onOpenSearch={() => {
          setActiveTab('dashboard');
          setTimeout(() => {
            const el = document.querySelector('input[placeholder*="Search"]');
            if (el) el.focus();
          }, 50);
        }}
      />

      {/* Dynamic Tab Views */}
      {activeTab === 'dashboard' && (
        <Dashboard 
          notices={notices}
          reminders={reminders}
          categoryList={categoryList}
          onToggleDone={handleToggleDone}
          onToggleReminder={handleToggleReminder}
          onNavigateUpload={() => setActiveTab('upload')}
          onNavigateConflicts={() => setActiveTab('conflicts')}
          isAuthenticated={isAuthenticated}
          onPromptAuth={() => setShowAuthModal(true)}
          onSelectNotice={(notice) => setSelectedNotice(notice)}
          onNotify={addToast}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === 'upload' && (
        <UploadStudio 
          categoryList={categoryList}
          onAddNotice={handleAddNotice}
          onNavigateDashboard={() => setActiveTab('dashboard')}
          onNotify={addToast}
        />
      )}

      {activeTab === 'conflicts' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fadeIn">
          <ConflictRadar 
            notices={notices}
            onToggleReminder={handleToggleReminder}
            onSelectNotice={(notice) => setSelectedNotice(notice)}
          />
        </div>
      )}

      {activeTab === 'reminders' && (
        <Reminders 
          reminders={reminders}
          onCancelReminder={(id) => setReminders(reminders.filter(r => r.id !== id))}
          onAddCustomReminder={handleAddCustomReminder}
          notices={notices}
          onNotify={addToast}
        />
      )}

      {activeTab === 'analytics' && (
        <Analytics 
          notices={notices}
          reminders={reminders}
        />
      )}

      {activeTab === 'admin' && (
        <AdminPortal 
          categoryList={categoryList}
          onAddCategory={handleAddCategory}
          onNotify={addToast}
        />
      )}

      {/* Inspect Notice Drawer / Modal */}
      <NoticeDetailModal 
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        onToggleReminder={handleToggleReminder}
        onToggleDone={handleToggleDone}
        onNotify={addToast}
      />

      {/* Authentication Modal */}
      <AuthModal 
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setIsAuthenticated(true)}
        onNotify={addToast}
      />

      {/* Floating Toast Notification Container */}
      <Toast toasts={toasts} onCloseToast={removeToast} />
    </div>
  );
}