import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import LoginView from './components/Auth/LoginView';
import CoursesView from './views/CoursesView';
import KanbanView from './views/KanbanView';
import PlanningView from './views/PlanningView';
import FocusView from './views/FocusView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('courses');

  const renderView = () => {
    switch (currentView) {
      case 'courses':
        return <CoursesView />;
      case 'kanban':
        return <KanbanView />;
      case 'planning':
        return <PlanningView />;
      case 'focus':
        return <FocusView />;
      default:
        return <CoursesView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-apple-text-secondary">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-apple-bg">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <AppProvider>
        {renderView()}
      </AppProvider>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
