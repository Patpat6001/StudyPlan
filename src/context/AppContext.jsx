import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const STORAGE_KEY = 'studyplan-data';

const defaultState = {
  settings: {
    startBlockDate: '',
    endBlockDate: '',
    studyDaysPerWeek: 5,
    hoursPerDay: 6,
  },
  courses: [],
  tasks: [],
};

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null; // SSR - localStorage not available
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.error('localStorage is not available:', error);
    return null;
  }
};

// Helper function to load data from localStorage
const loadFromStorage = () => {
  const storage = getLocalStorage();
  if (!storage) {
    return defaultState;
  }
  
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default state to ensure all fields exist
      return {
        ...defaultState,
        ...parsed,
        settings: { ...defaultState.settings, ...parsed.settings },
      };
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  return defaultState;
};

// Helper function to save data to localStorage
const saveToStorage = (data) => {
  const storage = getLocalStorage();
  if (!storage) {
    return; // SSR - skip saving
  }
  
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old data...');
      try {
        storage.removeItem(STORAGE_KEY);
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (clearError) {
        console.error('Failed to clear and save data:', clearError);
      }
    }
  }
};

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Charger depuis LocalStorage au démarrage (client-side only)
  useEffect(() => {
    const loadedState = loadFromStorage();
    setState(loadedState);
    setIsHydrated(true);
  }, []);

  // Sauvegarder dans LocalStorage à chaque changement (client-side only)
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(state);
    }
  }, [state, isHydrated]);

  const updateSettings = (newSettings) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const addCourse = (course) => {
    const newCourse = {
      id: Date.now().toString(),
      name: course.name,
      examDate: course.examDate,
      difficulty: course.difficulty || 3,
      importance: course.importance || 3,
      timeStudiedSoFar: 0,
      ...course,
    };
    setState((prev) => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));
    return newCourse.id;
  };

  const updateCourse = (id, updates) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((course) =>
        course.id === id ? { ...course, ...updates } : course
      ),
    }));
  };

  const deleteCourse = (id) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.id !== id),
      tasks: prev.tasks.filter((task) => task.courseId !== id),
    }));
  };

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      status: task.status || 'todo',
      courseId: task.courseId || null,
      ...task,
    };
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    return newTask.id;
  };

  const updateTask = (id, updates) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  };

  const deleteTask = (id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateCourseTime = (courseId, hours) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((course) =>
        course.id === courseId
          ? { ...course, timeStudiedSoFar: (course.timeStudiedSoFar || 0) + hours }
          : course
      ),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateSettings,
        addCourse,
        updateCourse,
        deleteCourse,
        addTask,
        updateTask,
        deleteTask,
        updateCourseTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

