import { INITIAL_CATEGORIES, SAMPLE_NOTICES, INITIAL_REMINDERS } from './mockData';
import { apiFetch } from './apiClient';

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
      const data = await apiFetch('/deadlines/');
        if (Array.isArray(data) && data.length > 0) {
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
        return [];
    } catch (err) {
      console.info("Backend API not reachable:", err.message);
    }
    return [];
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
      return await apiFetch('/notices/parse-document/', options);
    } catch (err) {
      console.warn("Backend parse endpoint offline:", err);
    }
    return null;
  },

  createDeadline: async (notice) => apiFetch('/deadlines/', {
    method: 'POST',
    body: JSON.stringify({
      title: notice.title,
      category: notice.category || 'General',
      action_required: notice.actionRequired,
      due_date: notice.dueDate,
      due_time: notice.dueTime || '17:00',
      priority: notice.priority || 'Medium',
      eligibility: notice.eligibility || '',
      status: notice.status || 'Upcoming',
      reminder_set: Boolean(notice.reminderSet),
      file_type: notice.fileType || 'Notice',
      file_name: notice.fileName || '',
      raw_text: notice.rawText || '',
      source_institution: notice.sourceInstitution || 'MIT World Peace University',
      extracted_confidence: notice.extractedConfidence || 0,
    }),
  }),

  toggleDeadlineStatus: async (id) => apiFetch(`/deadlines/${id}/toggle-status/`, { method: 'PATCH' }),
  toggleDeadlineReminder: async (id) => apiFetch(`/deadlines/${id}/toggle-reminder/`, { method: 'POST', body: '{}' }),
  deleteDeadline: async (id) => apiFetch(`/deadlines/${id}/`, { method: 'DELETE' }),

  // Direct Google Calendar 1-Click Link Generator
  getGoogleCalendarUrl: (notice) => {
    const dueDateStr = (notice.dueDate || '2026-08-28').replace(/-/g, '');
    const startTime = `${dueDateStr}T090000Z`;
    const endTime = `${dueDateStr}T100000Z`;
    const title = encodeURIComponent(`[DeadlineAI] ${notice.title}`);
    const details = encodeURIComponent(
      `⚡ Action Required: ${notice.actionRequired}\n🎯 Urgency: ${notice.priority}\n📋 Eligibility: ${notice.eligibility || 'N/A'}\n🏢 Institution: ${notice.sourceInstitution || 'MIT-WPU'}\n\nManaged via DeadlineAI`
    );
    const location = encodeURIComponent(notice.sourceInstitution || 'MIT World Peace University');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  },

  // Formatted WhatsApp Share Text & URL
  getFormattedShareText: (notice) => {
    return `🚨 *DEADLINE ALERT: ${notice.title}*\n━━━━━━━━━━━━━━━━━━━━\n⚡ *Action Required:* ${notice.actionRequired}\n📅 *Due Date:* ${notice.dueDate} (${notice.dueTime || '17:00 HRS'})\n🎯 *Urgency Level:* ${notice.priority} Urgency\n📋 *Eligibility:* ${notice.eligibility || 'All Students'}\n🏢 *Authority:* ${notice.sourceInstitution || 'MIT-WPU'}\n━━━━━━━━━━━━━━━━━━━━\n_Generated automatically via DeadlineAI_`;
  },

  getWhatsAppShareUrl: (notice) => {
    const text = encodeURIComponent(noticeService.getFormattedShareText(notice));
    return `https://api.whatsapp.com/send?text=${text}`;
  },

  // AI Notice Q&A Question Answering Engine
  askNoticeQuestion: async (notice, question) => {
    // 1. Attempt Backend Server LLM
    try {
      const data = await apiFetch('/notices/ask-question/', {
        method: 'POST',
        body: JSON.stringify({
          notice_id: notice.id,
          notice_text: notice.rawText || notice.actionRequired,
          question: question
        })
      });
      if (data.answer) return data.answer;
    } catch {
      // Fallback to client-side heuristic engine
    }

    // 2. Intelligent Contextual NLP Answer Engine
    const qLower = question.toLowerCase();
    const raw = (notice.rawText || "").toLowerCase();

    if (qLower.includes("eligible") || qLower.includes("eligibility") || qLower.includes("apply to me") || qLower.includes("who can")) {
      if (notice.eligibility) {
        return `Based on this notice, the eligibility requirement is: "${notice.eligibility}". Please verify you meet these criteria before submitting.`;
      }
      return `According to the circular, this notice applies to all enrolled students in the ${notice.category} department with no specific exclusionary criteria mentioned.`;
    }

    if (qLower.includes("document") || qLower.includes("submit") || qLower.includes("what to bring") || qLower.includes("papers")) {
      if (raw.includes("receipt") || raw.includes("form") || raw.includes("marksheet") || raw.includes("certificate")) {
        return `Required submissions identified in the circular:\n• Completed application form / online registration receipt.\n• Relevant verification certificates / marksheets as specified: ${notice.actionRequired}`;
      }
      return `You are required to perform the following action: "${notice.actionRequired}". Please carry your student identity card and receipt copy.`;
    }

    if (qLower.includes("deadline") || qLower.includes("due") || qLower.includes("date") || qLower.includes("when") || qLower.includes("time")) {
      return `The final deadline is strictly ${notice.dueDate} by ${notice.dueTime || '17:00 HRS'}. The priority is set to ${notice.priority} urgency.`;
    }

    if (qLower.includes("late") || qLower.includes("penalty") || qLower.includes("fine")) {
      if (raw.includes("late") || raw.includes("deduction") || raw.includes("penalty")) {
        return `Late Submission Warning: The notice specifies penalties or deductions for submissions past ${notice.dueDate}. Make sure to finish 24-48 hours before cutoff.`;
      }
      return `No specific late fee penalty is noted, but portal access may lock automatically after ${notice.dueDate} ${notice.dueTime || '17:00 HRS'}.`;
    }

    if (qLower.includes("where") || qLower.includes("location") || qLower.includes("counter") || qLower.includes("link") || qLower.includes("portal")) {
      if (raw.includes("counter") || raw.includes("desk") || raw.includes("portal") || raw.includes("erp")) {
        return `Submission details: "${notice.actionRequired}". Refer to the official university portal or designated department desk.`;
      }
      return `Submissions should be completed online via the university ERP portal or submitted to the ${notice.sourceInstitution || 'Department Office'}.`;
    }

    return `Summary of notice regarding "${question}":\n• Action: ${notice.actionRequired}\n• Due Date: ${notice.dueDate}\n• Eligibility: ${notice.eligibility || 'Standard academic enrollment'}\nFor further queries, contact ${notice.sourceInstitution || 'Department Office'}.`;
  },

  // Export to standard .ICS
  exportToICS: (notice) => {
    const dueDateStr = (notice.dueDate || '2026-08-28').replace(/-/g, '');
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
