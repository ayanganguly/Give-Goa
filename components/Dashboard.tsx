
import React, { useMemo } from 'react';
// Fixed: CATEGORY_COLORS is defined in constants.ts, not types.ts
import { SocialRequest, ResourceItem, RequestStatus } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CellProps } from 'recharts';

interface DashboardProps {
  requests: SocialRequest[];
  resources: ResourceItem[];
  onSelectRequest: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, resources, onSelectRequest }) => {
  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === RequestStatus.SUBMITTED || r.status === RequestStatus.CLASSIFIED).length;
    const completedProjects = requests.filter(r => r.status === RequestStatus.COMPLETED).length;
    const totalImpact = requests.reduce((acc, r) => acc + (r.status === RequestStatus.COMPLETED ? r.beneficiaries : 0), 0);
    const budget = resources.find(r => r.type === 'BUDGET');
    const budgetUsed = requests.reduce((acc, r) => acc + (r.allocatedBudget || 0), 0);

    return { totalRequests, pendingRequests, completedProjects, totalImpact, totalBudget: budget?.quantity || 0, budgetUsed };
  }, [requests, resources]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Requests" value={stats.totalRequests} icon="fa-folder-open" color="bg-blue-500" />
        <KpiCard title="Impact (Lives Touched)" value={stats.totalImpact} icon="fa-heart" color="bg-rose-500" />
        <KpiCard title="Active Projects" value={requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length} icon="fa-spinner" color="bg-amber-500" />
        <KpiCard title="Budget Utilization" value={`${Math.round((stats.budgetUsed / stats.totalBudget) * 100)}%`} icon="fa-wallet" color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Request Distribution by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Project Status Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.values(RequestStatus).map(status => ({
                status,
                count: requests.filter(r => r.status === status).length
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" fontSize={10} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#013a7c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent High Priority Requests</h3>
          <button className="text-sm font-semibold text-rotary-blue hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Impact Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {requests.sort((a,b) => b.priorityScore - a.priorityScore).slice(0, 5).map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{req.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[req.category]}`}>
                      {req.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[80px]">
                        <div className={`h-full rounded-full ${req.priorityScore > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${req.priorityScore}%` }}></div>
                      </div>
                      <span className="font-bold">{req.priorityScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium capitalize">{req.status.toLowerCase().replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onSelectRequest(req.id)} className="text-blue-600 hover:text-blue-800 font-semibold">Details</button>
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

const KpiCard: React.FC<{ title: string, value: string | number, icon: string, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl shadow-lg`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
