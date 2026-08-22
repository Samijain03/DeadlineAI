import { INITIAL_CATEGORIES, SAMPLE_NOTICES, INITIAL_REMINDERS } from './mockData';

const STORAGE_KEYS = {
  NOTICES: 'deadlineai_notices_v2',
  REMINDERS: 'deadlineai_reminders_v2',
  CATEGORIES: 'deadlineai_categories_v2',
  USER: 'deadlineai_user_v2'
};

// Data service abstraction layer (Ready to plug into Django REST APIs)
export const noticeService = {
  getNotices: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return SAMPLE_NOTICES;
  },

  saveNotices: (notices) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  },

  getCategories: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return INITIAL_CATEGORIES;
  },

  saveCategories: (categories) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  },

  getReminders: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return INITIAL_REMINDERS;
  },

  saveReminders: (reminders) => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  },

  exportToICS: (notice) => {
    const dueDateStr = notice.dueDate.replace(/-/g, '');
    const startTime = `${dueDateStr}T090000Z`;
    const endTime = `${dueDateStr}T100000Z`;
    const title = notice.title.replace(/[,;]/g, ' ');
    const desc = `Action Required: ${notice.actionRequired}\\nEligibility: ${notice.eligibility || 'None'}\\nCategory: ${notice.category}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DeadlineAI//MIT-WPU Notice Engine//EN',
      'BEGIN:VEVENT',
      `UID:${notice.id}@deadlineai.mitwpu.edu`,
      `DTSTAMP:${startTime}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:Deadline: ${title}`,
      `DESCRIPTION:${desc}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${notice.title.substring(0, 20).replace(/\s+/g, '_')}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
