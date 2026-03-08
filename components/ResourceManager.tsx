
import React, { useState } from 'react';
import { ResourceItem, User, UserRole } from '../types';
import { resourcesApi } from '../services/api';

interface ResourceManagerProps {
  resources: ResourceItem[];
  user: User;
  onUpdate: (res: ResourceItem[]) => void;
  onRefresh: () => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, user, onUpdate, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState<ResourceItem | null>(null);
  const [showUsageModal, setShowUsageModal] = useState<ResourceItem | null>(null);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: 'MATERIAL' as const, quantity: 100, unit: 'Units' });
  const [restockAmount, setRestockAmount] = useState(0);

  const canManage = user.role === UserRole.ADMIN || user.role === UserRole.PROJECT_MANAGER;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resourcesApi.add({
        name: addForm.name,
        type: addForm.type,
        quantity: addForm.quantity,
        unit: addForm.type === 'BUDGET' ? 'INR' : addForm.unit,
      });
      setAddForm({ name: '', type: 'MATERIAL', quantity: 100, unit: 'Units' });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal || restockAmount <= 0) return;
    setLoading(true);
    try {
      await resourcesApi.restock(showRestockModal.id, restockAmount);
      setShowRestockModal(null);
      setRestockAmount(0);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to restock');
    } finally {
      setLoading(false);
    }
  };

  const openUsageHistory = async (res: ResourceItem) => {
    setShowUsageModal(res);
    try {
      const { logs } = await resourcesApi.getUsage(res.id);
      setUsageLogs(logs);
    } catch {
      setUsageLogs([]);
    }
  };

  const inputCls = 'w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-rotary-blue focus:ring-2 focus:ring-blue-50 outline-none';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Inventory</h2>
          <p className="text-slate-500">Track and manage funds, materials, and skilled volunteer availability.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-rotary-blue text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors"
          >
            <i className="fa-solid fa-plus"></i>
            Add Resource
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  res.type === 'BUDGET' ? 'bg-emerald-100 text-emerald-600' : res.type === 'MATERIAL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}
              >
                <i
                  className={`fa-solid ${res.type === 'BUDGET' ? 'fa-wallet' : res.type === 'MATERIAL' ? 'fa-box-open' : 'fa-user-group'}`}
                ></i>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                  res.quantity > 0 && res.available / res.quantity < 0.2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
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
                <span>{res.quantity > 0 ? Math.round((1 - res.available / res.quantity) * 100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    res.quantity > 0 && res.available / res.quantity < 0.2 ? 'bg-red-500' : 'bg-rotary-blue'
                  }`}
                  style={{ width: res.quantity > 0 ? `${(res.available / res.quantity) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex justify-between gap-2">
              <button
                onClick={() => openUsageHistory(res)}
                className="text-xs font-bold text-rotary-blue hover:underline uppercase tracking-wide"
              >
                Usage History
              </button>
              {canManage && (
                <button
                  onClick={() => { setShowRestockModal(res); setRestockAmount(0); }}
                  className="text-xs font-bold text-rotary-blue hover:underline uppercase tracking-wide"
                >
                  Restock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Resource</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                <input
                  required
                  className={inputCls}
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g., Water Tanks"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                <select
                  className={inputCls}
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value as any })}
                >
                  <option value="BUDGET">Budget</option>
                  <option value="MATERIAL">Material</option>
                  <option value="VOLUNTEER_SKILL">Volunteer Skill</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    required
                    type="number"
                    min={1}
                    className={inputCls}
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    className={inputCls}
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    placeholder={addForm.type === 'BUDGET' ? 'INR' : 'Units'}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-rotary-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRestockModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Restock: {showRestockModal.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Current: {showRestockModal.available.toLocaleString()} {showRestockModal.unit}</p>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount to add</label>
                <input
                  required
                  type="number"
                  min={1}
                  className={inputCls}
                  value={restockAmount || ''}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowRestockModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading || restockAmount <= 0} className="bg-rotary-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
                  {loading ? 'Restocking...' : 'Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUsageModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Usage History: {showUsageModal.name}</h3>
            <div className="flex-1 overflow-y-auto mt-4">
              {usageLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No usage history yet.</p>
              ) : (
                <div className="space-y-2">
                  {usageLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-start">
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.action === 'RESTOCK' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {log.action}
                        </span>
                        <p className="text-sm text-slate-700 mt-1">{log.details || `${log.action} ${log.amount}`}</p>
                        <p className="text-xs text-slate-400">{log.userName} • {new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-slate-900">{log.action === 'RESTOCK' ? '+' : '-'}{log.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowUsageModal(null)} className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
