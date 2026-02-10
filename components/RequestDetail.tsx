
import React, { useState } from 'react';
import { SocialRequest, RequestStatus, User, UserRole } from '../types';
import { calculatePriorityScore } from '../services/gemini';
import { logAction, getStore } from '../services/store';

interface RequestDetailProps {
  request: SocialRequest;
  user: User;
  onUpdate: (request: SocialRequest) => void;
  onBack: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ request, user, onUpdate, onBack }) => {
  const [scoring, setScoring] = useState(false);

  const handleScore = async () => {
    setScoring(true);
    const { weights } = getStore();
    const result = await calculatePriorityScore(request, weights);
    
    const updated = {
      ...request,
      priorityScore: result.score,
      aiReasoning: result.breakdown,
      status: RequestStatus.PRIORITIZED
    };
    
    logAction(user, 'SCORE_REQUEST', request.id, `Calculated priority score: ${result.score}`);
    onUpdate(updated);
    setScoring(false);
  };

  const updateStatus = (status: RequestStatus) => {
    const updated = { ...request, status };
    logAction(user, 'UPDATE_STATUS', request.id, `Updated status to ${status}`);
    onUpdate(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-2 mb-4 transition-colors">
        <i className="fa-solid fa-arrow-left"></i>
        Back to Requests
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1 block">Tracking ID: {request.trackingId}</span>
                <h2 className="text-3xl font-bold text-slate-900">{request.title}</h2>
              </div>
              <div className="text-right">
                <span className="px-4 py-2 bg-blue-50 text-rotary-blue rounded-xl font-bold uppercase text-xs tracking-wide border border-blue-100">
                  {request.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8">{request.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Impacted</p>
                <p className="font-bold text-slate-900">{request.beneficiaries} People</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Urgency</p>
                <p className={`font-bold ${request.urgency === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>{request.urgency}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Location</p>
                <p className="font-bold text-slate-900">{request.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Budget Est.</p>
                <p className="font-bold text-slate-900">{request.requiredBudget.toLocaleString()} INR</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-robot text-rotary-blue"></i>
              AI Reasoning & Analysis
            </h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 italic whitespace-pre-wrap">{request.aiReasoning || "No AI analysis performed yet. Click 'Run Impact Analysis' to evaluate."}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Management Actions</h3>
            <div className="space-y-3">
              {request.status === RequestStatus.CLASSIFIED && (
                <button 
                  disabled={scoring}
                  onClick={handleScore}
                  className="w-full bg-rotary-gold text-rotary-blue font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-md"
                >
                  {scoring ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-calculator"></i>}
                  Run Impact Scoring
                </button>
              )}
              
              {request.status === RequestStatus.PRIORITIZED && user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => updateStatus(RequestStatus.APPROVED)}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                >
                  Approve for Funding
                </button>
              )}

              {request.status === RequestStatus.APPROVED && user.role === UserRole.ADMIN && (
                <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-xl text-center italic font-medium">
                  Approved. Waiting for resource allocation cycle.
                </div>
              )}

              <button 
                onClick={() => updateStatus(RequestStatus.REJECTED)}
                className="w-full bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all"
              >
                Reject Request
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-500 font-medium">Social Impact Score</span>
                <span className="text-4xl font-black text-rotary-blue">{request.priorityScore}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rotary-blue" style={{ width: `${request.priorityScore}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Internal Discussion</h4>
            <div className="space-y-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg text-sm">
                <p className="font-bold text-xs mb-1 text-slate-400">ADMIN • 2 days ago</p>
                <p className="text-slate-600">Great alignment with our literacy focus. Let's confirm location details.</p>
              </div>
            </div>
            <textarea 
              rows={2}
              className="w-full p-3 text-sm bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-rotary-blue transition-all"
              placeholder="Add a comment..."
            ></textarea>
            <button className="mt-2 w-full bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider">Post Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
