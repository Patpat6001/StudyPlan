import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import Courses from './components/Courses';
import Kanban from './components/Kanban';
import Planning from './components/Planning';
import Focus from './components/Focus';

function App() {
  const [activeView, setActiveView] = useState('courses');

  const renderView = () => {
    switch (activeView) {
      case 'courses':
        return <Courses />;
      case 'kanban':
        return <Kanban />;
      case 'planning':
        return <Planning />;
      case 'focus':
        return <Focus />;
      default:
        return <Courses />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-apple-bg">
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        <main>{renderView()}</main>
      </div>
    </AppProvider>
  );
}

export default App;
