
import React, { useState } from 'react';
// Fixed: CATEGORY_COLORS is defined in constants.ts, not types.ts
import { SocialRequest, RequestStatus } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface RequestListProps {
  requests: SocialRequest[];
  onSelectRequest: (id: string) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onSelectRequest }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredRequests = requests.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Community Requests</h2>
        <div className="flex gap-2 bg-white p-1 rounded-xl border">
          {['ALL', ...Object.values(RequestStatus).slice(0, 4)].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === status ? 'bg-rotary-blue text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All' : status.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(req => (
          <div 
            key={req.id} 
            onClick={() => onSelectRequest(req.id)}
            className="group bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:border-rotary-blue/20 transition-all cursor-pointer overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[req.category]}`}>
                  {req.category.replace('_', ' ')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                  req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {req.urgency}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rotary-blue transition-colors line-clamp-2">{req.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{req.description}</p>
              
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <i className="fa-solid fa-users text-blue-400"></i>
                  <span className="font-semibold">{req.beneficiaries} Beneficiaries</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <i className="fa-solid fa-location-dot text-rose-400"></i>
                  <span className="font-semibold">{req.location}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{req.status.replace('_', ' ')}</span>
              </div>
              <div className="text-sm font-bold text-rotary-blue flex items-center gap-1">
                Score {req.priorityScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestList;
