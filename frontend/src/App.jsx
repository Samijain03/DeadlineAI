import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import UploadStudio from './pages/UploadStudio';
import Reminders from './pages/Reminders';
import AdminPortal from './pages/AdminPortal';

const INITIAL_NOTICES = [
  {
    id: 1,
    title: "Semester End Examination Registration & Form Submission",
    category: "Examination",
    actionRequired: "Fill online exam form on portal and submit receipt copy to department head.",
    dueDate: "2026-08-28",
    priority: "High",
    eligibility: "Minimum 75% overall attendance required",
    status: "Upcoming",
    reminderSet: true,
    fileType: "PDF Document"
  },
  {
    id: 2,
    title: "Mini-Project Final Synopsis & Code Repository Submission",
    category: "Assignment",
    actionRequired: "Push complete source code to GitHub and upload PDF report link.",
    dueDate: "2026-08-28",
    priority: "High",
    eligibility: "All enrolled B.Tech / MCA computer science students",
    status: "Upcoming",
    reminderSet: false,
    fileType: "PNG Image"
  },
  {
    id: 3,
    title: "MahaDBT State Merit Scholarship Renewal Application",
    category: "Scholarship",
    actionRequired: "Attach income certificate & previous sem marksheets at Counter #4.",
    dueDate: "2026-09-05",
    priority: "Medium",
    eligibility: "GPA > 8.0 & verified family income certificate",
    status: "Upcoming",
    reminderSet: true,
    fileType: "JPG Document"
  }
];

const INITIAL_REMINDERS = [
  { id: 101, title: "Semester End Exam Registration", channel: "Email & Push", triggerDate: "2026-08-26 • 09:00 AM", status: "Active" },
  { id: 102, title: "MahaDBT State Merit Scholarship Renewal", channel: "Email Only", triggerDate: "2026-09-03 • 10:00 AM", status: "Active" }
];

const CATEGORIES = ["Examination", "Assignment", "Fees", "Events", "Scholarship", "Registration", "Placement", "General"];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // DEFAULT STATE: LOGGED OUT
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [categoryList, setCategoryList] = useState(CATEGORIES);

  const handleToggleDone = (id) => {
    setNotices(notices.map(n => n.id === id ? { ...n, status: n.status === "Completed" ? "Upcoming" : "Completed" } : n));
  };

  const handleToggleReminder = (notice) => {
    const exists = reminders.find(r => r.title === notice.title);
    if (exists) {
      setReminders(reminders.filter(r => r.title !== notice.title));
      setNotices(notices.map(n => n.id === notice.id ? { ...n, reminderSet: false } : n));
    } else {
      const newRem = {
        id: Date.now(),
        title: notice.title,
        channel: "Email & Push",
        triggerDate: `${notice.dueDate} • 09:00 AM`,
        status: "Active"
      };
      setReminders([...reminders, newRem]);
      setNotices(notices.map(n => n.id === notice.id ? { ...n, reminderSet: true } : n));
    }
  };

  const handleAddNotice = (newNotice) => {
    setNotices([newNotice, ...notices]);
  };

  const handleAddCategory = (newCat) => {
    if (!categoryList.includes(newCat)) {
      setCategoryList([...categoryList, newCat]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        setShowAuthModal={setShowAuthModal}
        reminderCount={reminders.length}
      />

      {activeTab === 'dashboard' && (
        <Dashboard 
          notices={notices}
          reminders={reminders}
          categoryList={categoryList}
          onToggleDone={handleToggleDone}
          onToggleReminder={handleToggleReminder}
          onNavigateUpload={() => setActiveTab('upload')}
          isAuthenticated={isAuthenticated}
          onPromptAuth={() => setShowAuthModal(true)}
        />
      )}

      {activeTab === 'upload' && (
        <UploadStudio 
          categoryList={categoryList}
          onAddNotice={handleAddNotice}
          onNavigateDashboard={() => setActiveTab('dashboard')}
        />
      )}

      {activeTab === 'reminders' && (
        <Reminders 
          reminders={reminders}
          onCancelReminder={(id) => setReminders(reminders.filter(r => r.id !== id))}
        />
      )}

      {activeTab === 'admin' && (
        <AdminPortal 
          categoryList={categoryList}
          onAddCategory={handleAddCategory}
        />
      )}

      <AuthModal 
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setIsAuthenticated(true)}
      />
    </div>
  );
}