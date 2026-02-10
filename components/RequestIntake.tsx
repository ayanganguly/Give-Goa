
import React, { useState } from 'react';
import { User, RequestCategory, SocialRequest, RequestStatus } from '../types';
import { classifyRequest } from '../services/gemini';
import { logAction } from '../services/store';

interface RequestIntakeProps {
  user: User;
  onAdd: (request: SocialRequest) => void;
}

const RequestIntake: React.FC<RequestIntakeProps> = ({ user, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: RequestCategory.UNCATEGORIZED,
    urgency: 'MEDIUM' as any,
    beneficiaries: 0,
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get AI classification and insights
      const aiResult = await classifyRequest(formData.title, formData.description);
      
      const newRequest: SocialRequest = {
        id: Date.now().toString(),
        trackingId: `RG-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        title: formData.title,
        description: formData.description,
        category: aiResult.category as RequestCategory,
        urgency: aiResult.suggestedUrgency || formData.urgency,
        beneficiaries: formData.beneficiaries,
        location: formData.location,
        status: RequestStatus.CLASSIFIED,
        createdAt: new Date().toISOString(),
        submittedBy: user.name,
        priorityScore: 0, // Calculated later
        aiClassificationConfidence: aiResult.confidence,
        aiReasoning: aiResult.reasoning,
        requiredBudget: aiResult.estimatedBudget || 0,
        assignedVolunteers: []
      };

      logAction(user, 'SUBMIT_REQUEST', newRequest.id, `Submitted request: ${newRequest.title}`);
      onAdd(newRequest);
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rotary-blue focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Social Impact Request</h2>
        <p className="text-slate-500">Submit a new request for community support. Our AI will automatically classify and triage the request.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Request Title</label>
            <input 
              required
              type="text" 
              className={inputClasses}
              placeholder="e.g., Rural Medical Camp in Ponda"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className={inputClasses}
              placeholder="Detailed description of the social problem and the proposed solution..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Approx. Beneficiaries</label>
            <input 
              required
              type="number" 
              className={inputClasses}
              value={formData.beneficiaries}
              onChange={e => setFormData({...formData, beneficiaries: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Village</label>
            <input 
              required
              type="text" 
              className={inputClasses}
              placeholder="Village, Taluka"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
            <i className="fa-solid fa-robot text-rotary-blue"></i>
          </div>
          <div>
            <h4 className="font-bold text-rotary-blue mb-1">AI Classification Engine</h4>
            <p className="text-sm text-blue-800 leading-relaxed">Our Gemini-powered model will automatically analyze your request, predict its category, urgency level, and estimated budget required. You can override these later.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button type="button" className="px-6 py-3 font-semibold text-slate-600 hover:text-slate-800 transition-colors">Save Draft</button>
          <button 
            disabled={loading}
            type="submit" 
            className="bg-rotary-blue hover:bg-blue-800 disabled:bg-slate-400 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-3"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Analyzing Request...
              </>
            ) : (
              'Submit for Triage'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestIntake;
