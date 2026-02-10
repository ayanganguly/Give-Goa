
import React, { useState } from 'react';
import { SocialRequest, ResourceItem, RequestStatus } from '../types';
import { suggestAllocations } from '../services/gemini';

interface AllocationEngineProps {
  requests: SocialRequest[];
  resources: ResourceItem[];
  onAllocated: (reqs: SocialRequest[], res: ResourceItem[]) => void;
}

const AllocationEngine: React.FC<AllocationEngineProps> = ({ requests, resources, onAllocated }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  const runOptimizer = async () => {
    setLoading(true);
    const result = await suggestAllocations(requests, resources);
    setSuggestion(result);
    setLoading(false);
  };

  const applyOptimization = () => {
    if (!suggestion) return;

    const updatedRequests = requests.map(req => {
      const allocation = suggestion.allocations.find((a: any) => a.requestId === req.id);
      if (allocation) {
        return {
          ...req,
          allocatedBudget: allocation.allocatedAmount,
          status: allocation.allocatedAmount >= req.requiredBudget ? RequestStatus.FUNDED : req.status,
          aiReasoning: allocation.reason
        };
      }
      return req;
    });

    const budgetRes = resources.find(r => r.type === 'BUDGET');
    const updatedResources = resources.map(res => {
      if (res.type === 'BUDGET' && budgetRes) {
        return { ...res, available: res.available - (budgetRes.available - suggestion.remainingBudget) };
      }
      return res;
    });

    onAllocated(updatedRequests, updatedResources);
    setSuggestion(null);
    alert("Resource allocation applied successfully!");
  };

  const pending = requests.filter(r => r.status === RequestStatus.PRIORITIZED);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Optimization Engine</h2>
          <p className="text-slate-500">Use Gemini to solve complex allocation problems based on social impact scores and budget constraints.</p>
        </div>
        <button 
          onClick={runOptimizer}
          disabled={loading || pending.length === 0}
          className="bg-rotary-blue hover:bg-blue-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          Run Optimization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1">
          <h3 className="font-bold mb-4 text-slate-800">Current Constraints</h3>
          <div className="space-y-4">
            {resources.map(res => (
              <div key={res.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">{res.name}</span>
                  <span className="font-bold">{res.available.toLocaleString()} {res.unit}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div className={`h-full rounded-full ${res.available / res.quantity < 0.2 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(res.available / res.quantity) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm md:col-span-2">
          <h3 className="font-bold mb-4 text-slate-800">Requests Pending Allocation ({pending.length})</h3>
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-check-circle text-4xl text-emerald-100 mb-3"></i>
              <p className="text-slate-400">All prioritized requests have been allocated resources.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(req => (
                <div key={req.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h4 className="font-semibold text-slate-900">{req.title}</h4>
                    <p className="text-xs text-slate-500">Score: <span className="text-emerald-600 font-bold">{req.priorityScore}</span> • Needed: {req.requiredBudget.toLocaleString()} INR</p>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-white border rounded uppercase">{req.urgency}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {suggestion && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-rotary-blue overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="p-6 bg-blue-50 flex justify-between items-center border-b border-blue-100">
            <h3 className="text-lg font-bold flex items-center gap-3 text-rotary-blue">
              <i className="fa-solid fa-robot"></i>
              AI Recommendation Generated
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setSuggestion(null)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors">Discard</button>
              <button onClick={applyOptimization} className="bg-rotary-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md">Apply Allocation</button>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">Allocation Details</h4>
                <div className="space-y-4">
                  {suggestion.allocations.map((a: any) => {
                    const req = requests.find(r => r.id === a.requestId);
                    return (
                      <div key={a.requestId} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-check text-sm"></i>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req?.title}</p>
                          <p className="text-sm text-slate-600 font-medium">Allocated: <span className="text-emerald-600">{a.allocatedAmount.toLocaleString()} INR</span></p>
                          <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">{a.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-rotary-blue uppercase text-xs font-bold tracking-widest mb-4">Summary Impact</h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-slate-600 font-medium">Social Value Gain</span>
                    <span className="text-2xl font-black text-rotary-blue">+{suggestion.totalImpact} Impact Pts</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-slate-600 font-medium">Budget Remaining</span>
                    <span className="text-xl font-bold text-slate-900">{suggestion.remainingBudget.toLocaleString()} INR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationEngine;
