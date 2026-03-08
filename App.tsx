
import React, { useState, useEffect, useCallback } from 'react';
import { User, SocialRequest, ResourceItem } from './types';
import { authApi, requestsApi, resourcesApi, logsApi } from './services/api';

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
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [reqRes, resRes] = await Promise.all([
        requestsApi.getAll(),
        resourcesApi.getAll(),
      ]);
      setRequests(reqRes.requests);
      setResources(resRes.resources);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const allowedViews: Record<string, string[]> = {
    ADMIN: ['dashboard', 'requests', 'intake', 'request-detail', 'resources', 'allocation', 'audit'],
    PROJECT_MANAGER: ['dashboard', 'requests', 'intake', 'request-detail', 'resources', 'allocation'],
    VOLUNTEER: ['dashboard', 'requests', 'request-detail'],
    COMMUNITY_REQUESTER: ['intake'],
  };

  useEffect(() => {
    const token = localStorage.getItem('givegoa_token');
    const savedUser = localStorage.getItem('givegoa_session');
    if (token && savedUser) {
      authApi
        .me()
        .then(({ user }) => {
          setUser(user as User);
          setActiveView((v) => (allowedViews[user.role]?.includes(v) ? v : getDefaultView(user.role)));
          loadData();
        })
        .catch(() => {
          localStorage.removeItem('givegoa_token');
          localStorage.removeItem('givegoa_session');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [loadData]);

  function getDefaultView(role: string) {
    if (role === 'COMMUNITY_REQUESTER') return 'intake';
    if (role === 'VOLUNTEER') return 'dashboard';
    return 'dashboard';
  }

  const handleLogin = (loggedInUser: { id: string; name: string; email: string; role: string }) => {
    setUser(loggedInUser as User);
    setActiveView(getDefaultView(loggedInUser.role));
    loadData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('givegoa_token');
    localStorage.removeItem('givegoa_session');
    setRequests([]);
    setResources([]);
  };

  const updateRequests = async (newRequests: SocialRequest[]) => {
    setRequests(newRequests);
    await requestsApi.batchUpdate(newRequests);
  };

  const updateSingleRequest = async (updated: SocialRequest) => {
    await requestsApi.update(updated.id, updated);
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const updateResources = async (newResources: ResourceItem[]) => {
    setResources(newResources);
    await resourcesApi.update(newResources);
  };

  const logAction = async (user: User, action: string, targetId: string, details: string) => {
    try {
      await logsApi.create(action, targetId, details);
    } catch (e) {
      console.error('Log failed:', e);
    }
  };

  useEffect(() => {
    if (user && !allowedViews[user.role]?.includes(activeView)) {
      setActiveView(getDefaultView(user.role));
    }
  }, [user, activeView]);

  const renderView = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-rotary-blue"></i>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard requests={requests} resources={resources} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} onViewAll={() => setActiveView('requests')} />;
      case 'requests':
        return <RequestList requests={requests} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} />;
      case 'intake':
        return (
          <RequestIntake
            user={user}
            onAdd={async (req) => {
              setRequests((prev) => [req, ...prev]);
              if (user.role !== 'COMMUNITY_REQUESTER') setActiveView('requests');
            }}
            logAction={logAction}
          />
        );
      case 'request-detail':
        const req = requests.find((r) => r.id === selectedRequestId);
        return req ? (
          <RequestDetail
            request={req}
            user={user}
            onUpdate={(updated) => updateSingleRequest(updated)}
            onBack={() => setActiveView('requests')}
            logAction={logAction}
          />
        ) : null;
      case 'resources':
        return <ResourceManager resources={resources} onUpdate={updateResources} onRefresh={loadData} user={user} />;
      case 'allocation':
        return (
          <AllocationEngine
            requests={requests}
            resources={resources}
            onAllocated={async (updatedRequests, updatedResources) => {
              await updateRequests(updatedRequests);
              await updateResources(updatedResources);
              if (user) await logAction(user, 'APPLY_ALLOCATION', 'batch', `Allocated resources to ${updatedRequests.filter((r) => r.allocatedBudget).length} requests`);
            }}
          />
        );
      case 'audit':
        return <AuditLog />;
      default:
        return <Dashboard requests={requests} resources={resources} onSelectRequest={(id) => { setSelectedRequestId(id); setActiveView('request-detail'); }} onViewAll={() => setActiveView('requests')} />;
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
