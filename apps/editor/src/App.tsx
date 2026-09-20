import { useEffect, useState } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CmsDashboard } from './components/cms/CmsDashboard';
import { useCanvasStore } from './store/canvasStore';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SitesDashboard } from './pages/SitesDashboard';

type AppView = 'login' | 'register' | 'dashboard' | 'editor';

export function App() {
  const { activeView } = useCanvasStore();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { loadFromSiteAndPage } = useCanvasStore();

  const [appView, setAppView] = useState<AppView>('login');

  // Khôi phục session từ localStorage khi app khởi động
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Điều hướng dựa theo trạng thái auth
  useEffect(() => {
    if (isAuthenticated) {
      if (appView === 'login' || appView === 'register') {
        setAppView('dashboard');
      }
    } else {
      if (appView === 'editor' || appView === 'dashboard') {
        setAppView('login');
      }
    }
  }, [isAuthenticated]);

  const handleOpenEditor = async (site: any, page: any) => {
    await loadFromSiteAndPage({
      siteId: site.id,
      domain: site.domain,
      slug: page.slug,
    });
    setAppView('editor');
  };

  // ─── Views ───────────────────────────────────────────────────────────────

  if (appView === 'login') {
    return <LoginPage onNavigateToRegister={() => setAppView('register')} />;
  }

  if (appView === 'register') {
    return <RegisterPage onNavigateToLogin={() => setAppView('login')} />;
  }

  if (appView === 'dashboard') {
    return (
      <SitesDashboard
        onOpenEditor={handleOpenEditor}
      />
    );
  }

  // appView === 'editor'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Topbar onBackToDashboard={() => setAppView('dashboard')} />
      {activeView === 'canvas' ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <Canvas />
          <PropertiesPanel />
        </div>
      ) : (
        <CmsDashboard />
      )}
    </div>
  );
}

export default App;
