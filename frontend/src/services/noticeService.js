import { INITIAL_CATEGORIES, SAMPLE_NOTICES, INITIAL_REMINDERS } from './mockData';

const API_BASE_URL = 'http://localhost:8000/api';

const STORAGE_KEYS = {
  NOTICES: 'deadlineai_notices_v2',
  REMINDERS: 'deadlineai_reminders_v2',
  CATEGORIES: 'deadlineai_categories_v2',
  USER: 'deadlineai_user_v2'
};

export const noticeService = {
  // Sync local retrieval with fallback
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

  // Backend Django API Connector Methods (with auto-fallback)
  fetchBackendDeadlines: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/deadlines/`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize django model fields to frontend structure
          return data.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            actionRequired: d.action_required,
            dueDate: d.due_date,
            dueTime: d.due_time || '17:00',
            priority: d.priority,
            eligibility: d.eligibility,
            status: d.status,
            reminderSet: d.reminder_set,
            fileType: d.file_type || 'PDF Document',
            fileName: d.file_name,
            rawText: d.raw_text,
            notes: d.notes,
            sourceInstitution: d.source_institution,
            extractedConfidence: d.extracted_confidence
          }));
        }
      }
    } catch (err) {
      console.info("Backend API not reachable; operating in local mode.");
    }
    return noticeService.getNotices();
  },

  parseDocumentOnBackend: async (fileOrTextPayload) => {
    try {
      let options = {};
      if (fileOrTextPayload instanceof FormData) {
        options = {
          method: 'POST',
          body: fileOrTextPayload
        };
      } else {
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fileOrTextPayload)
        };
      }
      const res = await fetch(`${API_BASE_URL}/notices/parse-document/`, options);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend parse endpoint offline:", err);
    }
    return null;
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
