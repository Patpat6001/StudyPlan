// Utilitaires pour le stockage Firebase Firestore

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Récupérer les données de l'utilisateur depuis Firestore
 */
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    // Retourner les données par défaut si l'utilisateur n'existe pas encore
    return {
      settings: {
        startBlockDate: '',
        endBlockDate: '',
        studyDaysPerWeek: 5,
        hoursPerDay: 6,
      },
      courses: [],
      tasks: [],
      customPlanning: null,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
};

/**
 * Sauvegarder les données de l'utilisateur dans Firestore
 */
export const saveUserData = async (userId, data) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...data,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
    throw error;
  }
};

/**
 * Mettre à jour une partie des données utilisateur
 */
export const updateUserData = async (userId, updates) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données:', error);
    throw error;
  }
};

