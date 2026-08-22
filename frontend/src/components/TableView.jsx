import React, { useState } from 'react';
import { Download, ArrowUpDown, Bell, CheckCircle, Eye, ExternalLink } from 'lucide-react';
import { noticeService } from '../services/noticeService';

export default function TableView({ notices, onToggleDone, onToggleReminder, onSelectNotice, onNotify }) {
  const [sortField, setSortField] = useState('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedNotices = [...notices].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (sortField === 'priority') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      valA = pWeights[a.priority] || 0;
      valB = pWeights[b.priority] || 0;
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Category", "Priority", "Due Date", "Status", "Action Required", "Eligibility"];
    const rows = sortedNotices.map(n => [
      `"${n.id}"`,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.category}"`,
      `"${n.priority}"`,
      `"${n.dueDate}"`,
      `"${n.status}"`,
      `"${n.actionRequired.replace(/"/g, '""')}"`,
      `"${(n.eligibility || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DeadlineAI_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onNotify) onNotify("CSV Exported", "All notice records downloaded as CSV.", "success");
  };

  return (
    <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl space-y-4">
      
      {/* Table Header Bar */}
      <div className="p-5 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">Structured Tabular Matrix</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Click column headers to sort by deadline, priority, or category</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/40 text-[10px] font-black uppercase text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="p-4 cursor-pointer hover:text-zinc-200" onClick={() => handleSort('title')}>
                <div className="flex items-center space-x-1">
                  <span>Notice Title</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-zinc-200" onClick={() => handleSort('category')}>
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-zinc-200" onClick={() => handleSort('priority')}>
                <div className="flex items-center space-x-1">
                  <span>Urgency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-zinc-200" onClick={() => handleSort('dueDate')}>
                <div className="flex items-center space-x-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                </div>
              </th>
              <th className="p-4">Action Required (AI Extracted)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60">
            {sortedNotices.map((notice) => (
              <tr key={notice.id} className="hover:bg-zinc-900/40 transition">
                
                <td className="p-4 font-bold text-zinc-100 max-w-xs">
                  <div className="line-clamp-2">{notice.title}</div>
                  <span className="text-[10px] text-zinc-500 font-mono font-normal">Source: {notice.fileType}</span>
                </td>

                <td className="p-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 uppercase">
                    {notice.category}
                  </span>
                </td>

                <td className="p-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    notice.priority === 'High'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : notice.priority === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {notice.priority}
                  </span>
                </td>

                <td className="p-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                  {notice.dueDate}
                </td>

                <td className="p-4 max-w-sm text-zinc-300 font-medium">
                  <p className="line-clamp-2">{notice.actionRequired}</p>
                </td>

                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    notice.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {notice.status}
                  </span>
                </td>

                <td className="p-4 text-right whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onSelectNotice(notice)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
                    title="Inspect details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleReminder(notice)}
                    className={`p-1.5 rounded-lg border transition ${
                      notice.reminderSet
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Toggle Alert"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleDone(notice.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                      notice.status === 'Completed'
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {notice.status === 'Completed' ? 'Pending' : 'Done ✓'}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
