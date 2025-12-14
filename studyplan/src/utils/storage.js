// Utility functions for LocalStorage management

const STORAGE_KEY = 'studyplan_data';

export const getStoredData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Default state
  return {
    settings: {
      startBlockDate: '',
      endBlockDate: '',
      studyDaysPerWeek: 5,
      hoursPerDay: 6,
    },
    courses: [],
    tasks: [],
    customPlanning: null, // Planning personnalisé édité par l'utilisateur
  };
};

export const saveStoredData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

