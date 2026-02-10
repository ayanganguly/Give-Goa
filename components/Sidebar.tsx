
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.VOLUNTEER] },
    { id: 'requests', label: 'Requests', icon: 'fa-list-check', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.VOLUNTEER] },
    { id: 'intake', label: 'Submit Request', icon: 'fa-plus-circle', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.COMMUNITY_REQUESTER] },
    { id: 'resources', label: 'Inventory', icon: 'fa-boxes-stacked', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER] },
    { id: 'allocation', label: 'Optimizer', icon: 'fa-robot', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER] },
    { id: 'audit', label: 'Audit Logs', icon: 'fa-history', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="w-20 md:w-64 bg-rotary-blue flex flex-col h-full text-white transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-rotary-gold rounded-full flex items-center justify-center shrink-0">
          <i className="fa-solid fa-gear text-rotary-blue text-xl"></i>
        </div>
        <div className="hidden md:block">
          <h1 className="font-bold text-lg leading-tight">GiveGoa</h1>
          <p className="text-xs text-blue-200">Rotary Club Panjim</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.filter(item => item.roles.includes(role)).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeView === item.id ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center text-lg`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="hidden md:block bg-blue-900/50 p-4 rounded-xl border border-blue-700/50">
          <p className="text-xs text-blue-300 mb-1 font-semibold uppercase tracking-wider">Help & Support</p>
          <p className="text-sm text-white">Need assistance with allocation?</p>
          <button className="mt-2 text-xs font-bold text-rotary-gold hover:underline">Contact Admin</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
