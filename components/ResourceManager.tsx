
import React from 'react';
import { ResourceItem, User, UserRole } from '../types';

interface ResourceManagerProps {
  resources: ResourceItem[];
  user: User;
  onUpdate: (res: ResourceItem[]) => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, user, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Inventory</h2>
          <p className="text-slate-500">Track and manage funds, materials, and skilled volunteer availability.</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <button className="bg-rotary-blue text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            Add Resource
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                res.type === 'BUDGET' ? 'bg-emerald-100 text-emerald-600' :
                res.type === 'MATERIAL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <i className={`fa-solid ${
                  res.type === 'BUDGET' ? 'fa-wallet' :
                  res.type === 'MATERIAL' ? 'fa-box-open' : 'fa-user-group'
                }`}></i>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                (res.available / res.quantity) < 0.2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {res.type.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">{res.name}</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-black text-slate-900">{res.available.toLocaleString()}</span>
              <span className="text-sm font-medium text-slate-400 mb-1">{res.unit} available</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Utilization</span>
                <span>{Math.round((1 - (res.available / res.quantity)) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    (res.available / res.quantity) < 0.2 ? 'bg-red-500' : 'bg-rotary-blue'
                  }`}
                  style={{ width: `${(res.available / res.quantity) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex justify-between">
              <button className="text-xs font-bold text-rotary-blue hover:underline uppercase tracking-wide">Usage History</button>
              <button className="text-xs font-bold text-rotary-blue hover:underline uppercase tracking-wide">Restock</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceManager;
