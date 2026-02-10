
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-4">
        <div className="md:hidden w-10 h-10 bg-rotary-blue rounded-lg flex items-center justify-center">
           <i className="fa-solid fa-gear text-rotary-gold"></i>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 hidden md:block">Centralized Resource Allocation ERP</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
            <p className="text-xs text-slate-500 mt-1">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
