import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const isInitialMount = useRef(true);

  // Fusionner les données intelligemment (garder les plus récentes)
  const mergeData = (firebaseData, localData) => {
    // Comparer les timestamps pour déterminer quelle version est la plus récente
    const firebaseTime = firebaseData.lastUpdated ? new Date(firebaseData.lastUpdated) : null;
    const localTime = localData.lastSaved ? new Date(localData.lastSaved) : null;

    // Si Firebase est plus récent ou si local est vide, utiliser Firebase
    if (firebaseTime && (!localTime || firebaseTime > localTime)) {
      // Mais préserver les données locales si Firebase est vide pour certains champs
      return {
        ...firebaseData,
        courses: firebaseData.courses?.length > 0 ? firebaseData.courses : (localData.courses || []),
        tasks: firebaseData.tasks?.length > 0 ? firebaseData.tasks : (localData.tasks || []),
      };
    }

    // Si local est plus récent ou si Firebase est vide, utiliser local
    if (localTime && (!firebaseTime || localTime > firebaseTime)) {
      return localData;
    }

    // Par défaut, priorité à Firebase si elle existe, sinon local
    if (firebaseData && (firebaseData.courses?.length > 0 || firebaseData.tasks?.length > 0)) {
      return firebaseData;
    }

    return localData;
  };

  // Charger les données depuis Firebase si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setLoading(true);
      const localData = getStoredData();
      
      getUserData(user.uid)
        .then((firebaseData) => {
          // Fusionner les données Firebase avec les données locales
          const mergedData = mergeData(firebaseData, localData);
          setData(mergedData);
          // Sauvegarder immédiatement pour avoir un backup
          saveStoredData(mergedData);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement des données:', error);
          // En cas d'erreur, utiliser les données locales
          setData(localData);
        })
        .finally(() => {
          setLoading(false);
          isInitialMount.current = false;
        });
    } else {
      // Si pas connecté, utiliser localStorage
      const localData = getStoredData();
      setData(localData);
      isInitialMount.current = false;
    }
  }, [user]);

  // Sauvegarder les données (toujours en localStorage comme backup + Firebase si connecté)
  useEffect(() => {
    // Ne pas sauvegarder lors du premier chargement (montage initial)
    if (isInitialMount.current) {
      return;
    }

    // TOUJOURS sauvegarder en localStorage comme backup
    try {
      saveStoredData(data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde localStorage:', error);
    }

    // Si connecté, sauvegarder aussi sur Firebase (sans lastSaved qui est juste pour localStorage)
    if (user && !loading) {
      const { lastSaved, ...dataForFirebase } = data;
      saveUserData(user.uid, dataForFirebase).catch((error) => {
        console.error('Erreur lors de la sauvegarde Firebase:', error);
        // En cas d'erreur Firebase, les données sont quand même en localStorage
      });
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

