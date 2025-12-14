import { BookOpen, CheckSquare, Calendar, Timer } from 'lucide-react';

const navItems = [
  { id: 'courses', label: 'Cours', icon: BookOpen },
  { id: 'kanban', label: 'Tâches', icon: CheckSquare },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'focus', label: 'Focus', icon: Timer },
];

export default function Navigation({ activeView, setActiveView }) {
  return (
    <>
      {/* Navigation Mobile (Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 md:hidden z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-apple ${
                  isActive
                    ? 'text-apple-text'
                    : 'text-apple-text-secondary'
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-apple ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Navigation Desktop (Top) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 lg:h-20">
            <h1 className="text-xl lg:text-2xl font-semibold text-apple-text">StudyPlan</h1>
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-apple transition-apple text-sm lg:text-base ${
                      isActive
                        ? 'bg-apple-text text-white font-semibold shadow-sm'
                        : 'text-apple-text-secondary hover:bg-gray-100/70 font-medium'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

