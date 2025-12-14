import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredData, saveStoredData } from '../utils/storage';
import { useAuth } from './AuthContext';
import { getUserData, saveUserData } from '../utils/firebaseStorage';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(getStoredData());
  const [loading, setLoading] = useState(false);

  // Charger les données depuis Firebase si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserData(user.uid)
        .then((userData) => {
          setData(userData);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement des données:', error);
          // En cas d'erreur, utiliser les données locales
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Si pas connecté, utiliser localStorage
      setData(getStoredData());
    }
  }, [user]);

  // Sauvegarder les données
  useEffect(() => {
    if (user && !loading) {
      // Sauvegarder dans Firebase
      saveUserData(user.uid, data).catch((error) => {
        console.error('Erreur lors de la sauvegarde:', error);
      });
    } else if (!user) {
      // Sauvegarder dans localStorage si pas connecté
      saveStoredData(data);
    }
  }, [data, user, loading]);

  const updateSettings = (settings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const addCourse = (course) => {
    const newCourse = {
      id: Date.now().toString(),
      timeStudiedSoFar: 0,
      ...course,
    };
    setData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));
    return newCourse.id;
  };

  const updateCourse = (id, updates) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(course =>
        course.id === id ? { ...course, ...updates } : course
      ),
    }));
  };

  const deleteCourse = (id) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.id !== id),
      tasks: prev.tasks.filter(task => task.courseId !== id),
    }));
  };

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      ...task,
    };
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    return newTask.id;
  };

  const updateTask = (id, updates) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  };

  const addStudyTime = (courseId, hours) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(course =>
        course.id === courseId
          ? { ...course, timeStudiedSoFar: (course.timeStudiedSoFar || 0) + hours }
          : course
      ),
    }));
  };

  const updateCustomPlanning = (customPlanning) => {
    setData(prev => ({
      ...prev,
      customPlanning,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        updateSettings,
        addCourse,
        updateCourse,
        deleteCourse,
        addTask,
        updateTask,
        deleteTask,
        addStudyTime,
        updateCustomPlanning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

