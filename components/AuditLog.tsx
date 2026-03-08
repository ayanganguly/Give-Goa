
import React, { useState, useEffect } from 'react';
import { logsApi } from '../services/api';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    logsApi.getAll().then((res) => setLogs(res.logs)).catch(() => setLogs([]));
  }, []);

  const exportToCsv = () => {
    if (logs.length === 0) {
      alert('No logs to export.');
      return;
    }
    const headers = ['Timestamp', 'User', 'Action', 'Target ID', 'Details'];
    const rows = logs.map((l) => [
      l.timestamp,
      l.userName,
      l.action,
      l.targetId,
      (l.details || '').replace(/"/g, '""'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `givegoa-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit & Transparency</h2>
          <p className="text-slate-500">Chronological history of all major actions and resource allocations.</p>
        </div>
        <button onClick={exportToCsv} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
          <i className="fa-solid fa-file-export"></i>
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No logs found yet.</td>
                </tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {log.userName.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.action.includes('ALLOCATE') ? 'bg-emerald-100 text-emerald-800' : 
                      log.action.includes('SUBMIT') ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
