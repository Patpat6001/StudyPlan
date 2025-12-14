import { BookOpen, CheckSquare, Calendar, Timer, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const navItems = [
    { id: 'courses', label: 'Cours', icon: BookOpen },
    { id: 'kanban', label: 'Tâches', icon: CheckSquare },
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Timer },
  ];

  return (
    <>
      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  isActive
                    ? 'text-apple-text'
                    : 'text-apple-text-secondary'
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-apple-text-secondary"
            title="Déconnexion"
          >
            <LogOut size={22} />
            <span className="text-xs mt-1 font-medium">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Desktop Navigation - Top */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-apple-text">StudyPlan</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-apple transition-all duration-200 ${
                        isActive
                          ? 'bg-apple-text text-white'
                          : 'text-apple-text-secondary hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                {user?.displayName && (
                  <span className="text-sm text-apple-text-secondary">
                    {user.displayName}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-apple-text-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-all"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

