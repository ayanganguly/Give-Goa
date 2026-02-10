
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, SocialRequest, ResourceItem, AuditLogEntry } from './types';
import { MOCK_USERS, APP_NAME, CLUB_NAME } from './constants';
import { getStore, saveRequests, saveResources, logAction } from './services/store';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RequestIntake from './components/RequestIntake';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import ResourceManager from './components/ResourceManager';
import AllocationEngine from './components/AllocationEngine';
import AuditLog from './components/AuditLog';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<SocialRequest[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    // Initial data load
    const data = getStore();
    setRequests(data.requests);
    setResources(data.resources);

    // Check session
    const savedUser = localStorage.getItem('givegoa_session');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (email: string) => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      const u: User = { id: found.id, name: found.name, email: found.email, role: found.role };
      setUser(u);
      localStorage.setItem('givegoa_session', JSON.stringify(u));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('givegoa_session');
  };

  const updateRequests = (newRequests: SocialRequest[]) => {
    setRequests(newRequests);
    saveRequests(newRequests);
  };

  const updateResources = (newResources: ResourceItem[]) => {
    setResources(newResources);
    saveResources(newResources);
  };

  const renderView = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (activeView) {
      case 'dashboard':
        return <Dashboard requests={requests} resources={resources} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} />;
      case 'requests':
        return <RequestList requests={requests} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} />;
      case 'intake':
        return <RequestIntake user={user} onAdd={(req) => { updateRequests([req, ...requests]); setActiveView('requests'); }} />;
      case 'request-detail':
        const req = requests.find(r => r.id === selectedRequestId);
        return req ? <RequestDetail 
          request={req} 
          user={user} 
          onUpdate={(updated) => updateRequests(requests.map(r => r.id === updated.id ? updated : r))}
          onBack={() => setActiveView('requests')}
        /> : null;
      case 'resources':
        return <ResourceManager resources={resources} onUpdate={updateResources} user={user} />;
      case 'allocation':
        return <AllocationEngine requests={requests} resources={resources} onAllocated={(updatedRequests, updatedResources) => {
          updateRequests(updatedRequests);
          updateResources(updatedResources);
        }} />;
      case 'audit':
        return <AuditLog />;
      default:
        return <Dashboard requests={requests} resources={resources} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {user && (
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          role={user.role} 
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {user && <Header user={user} onLogout={handleLogout} />}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
