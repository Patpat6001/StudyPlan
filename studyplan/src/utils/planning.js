// Utility functions for planning calculations

/**
 * Calculate total potential study hours between today and exam dates
 * @param {Object} settings - Settings object with startBlockDate, endBlockDate, studyDaysPerWeek, hoursPerDay
 * @param {Array} courses - Array of courses with examDate
 * @returns {Object} - Object with totalHours and breakdown by course
 */
export const calculateStudyPlan = (settings, courses) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter courses with exam dates
  const coursesWithExams = courses.filter(course => course.examDate);

  if (coursesWithExams.length === 0) {
    return {
      totalHours: 0,
      coursesBreakdown: [],
      totalPotentialHours: 0,
    };
  }

  // Find the earliest and latest exam dates
  const examDates = coursesWithExams.map(c => new Date(c.examDate));
  const earliestExam = new Date(Math.min(...examDates));
  const latestExam = new Date(Math.max(...examDates));

  // Use block dates if provided, otherwise use exam dates
  const startDate = settings.startBlockDate
    ? new Date(settings.startBlockDate)
    : (today < earliestExam ? today : earliestExam);
  const endDate = settings.endBlockDate
    ? new Date(settings.endBlockDate)
    : latestExam;

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // Calculate total days (inclusive)
  // Ensure startDate is not in the past - use today if startDate is before today
  const effectiveStartDate = startDate < today ? today : startDate;
  effectiveStartDate.setHours(0, 0, 0, 0);
  const totalDays = Math.max(0, Math.ceil((endDate - effectiveStartDate) / (1000 * 60 * 60 * 24)) + 1);
  
  // Calculate total potential hours
  const studyDaysPerWeek = settings.studyDaysPerWeek || 5;
  const hoursPerDay = settings.hoursPerDay || 6;
  
  // Calculate number of full weeks and remaining days
  const fullWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  
  // Calculate total study days
  const totalStudyDays = (fullWeeks * studyDaysPerWeek) + Math.min(remainingDays, studyDaysPerWeek);
  const totalPotentialHours = totalStudyDays * hoursPerDay;

  // Calculate weights for each course (Difficulty * Importance)
  const coursesWithWeights = coursesWithExams.map(course => ({
    ...course,
    weight: (course.difficulty || 1) * (course.importance || 1),
  }));

  const totalWeight = coursesWithWeights.reduce((sum, course) => sum + course.weight, 0);

  // Distribute hours based on weights
  const coursesBreakdown = coursesWithWeights.map(course => {
    const recommendedHours = totalWeight > 0
      ? Math.round((course.weight / totalWeight) * totalPotentialHours)
      : 0;
    
    const timeStudied = course.timeStudiedSoFar || 0;
    const remainingHours = Math.max(0, recommendedHours - timeStudied);

    return {
      courseId: course.id,
      courseName: course.name,
      recommendedHours,
      timeStudied,
      remainingHours,
      weight: course.weight,
      examDate: course.examDate,
    };
  });

  // Calculate total remaining hours
  const totalRemainingHours = coursesBreakdown.reduce(
    (sum, course) => sum + course.remainingHours,
    0
  );

  return {
    totalPotentialHours: Math.max(0, totalPotentialHours),
    totalRemainingHours: Math.max(0, totalRemainingHours),
    coursesBreakdown,
    startDate: effectiveStartDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    totalDays: Math.max(0, totalDays),
  };
};

/**
 * Format hours to a readable string
 */
export const formatHours = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`;
  }
  return `${Math.round(hours * 10) / 10}h`;
};

/**
 * Generate detailed daily planning for courses
 * @param {Object} settings - Settings with selectedDays, sessionDuration, examHour
 * @param {Array} coursesBreakdown - Array of courses with remainingHours and examDate
 * @returns {Object} - Object with daily planning
 */
export const generateDetailedPlanning = (settings, coursesBreakdown) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Configuration
  const selectedDays = settings.selectedDays || {};
  const sessionDuration = settings.sessionDuration || 2; // heures
  const examHour = settings.examHour || 9; // heure par défaut (9h)
  
  // Mapping des jours (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
  const dayMapping = {
    day0: 1, // Lundi
    day1: 2, // Mardi
    day2: 3, // Mercredi
    day3: 4, // Jeudi
    day4: 5, // Vendredi
    day5: 6, // Samedi
    day6: 0, // Dimanche
  };

  // Récupérer les jours sélectionnés (par défaut tous sauf si explicitement désactivés)
  const activeDays = Object.keys(dayMapping).filter(dayKey => 
    selectedDays[dayKey] !== false
  ).map(dayKey => dayMapping[dayKey]);

  if (activeDays.length === 0) {
    // Si aucun jour n'est sélectionné, utiliser tous les jours
    activeDays.push(...[1, 2, 3, 4, 5, 6, 0]);
  }

  const dailyPlanning = {};

  // Traiter chaque cours
  coursesBreakdown.forEach(course => {
    if (!course.examDate || course.remainingHours <= 0) return;

    const examDate = new Date(course.examDate);
    examDate.setHours(examHour, 0, 0, 0); // Heure de l'examen
    
    // Date limite : strictement avant l'examen (jour de l'examen à 00:00)
    const limitDate = new Date(examDate);
    limitDate.setHours(0, 0, 0, 0);

    let remainingHours = course.remainingHours;

    // Étape 1 : Réserver 4H la veille ou juste avant l'examen (même si ce n'est pas un jour sélectionné)
    if (remainingHours >= 4) {
      const dayBefore = new Date(limitDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      // Vérifier que la veille est dans le futur ou aujourd'hui
      if (dayBefore >= today) {
        const dayBeforeKey = dayBefore.toISOString().split('T')[0];
        if (!dailyPlanning[dayBeforeKey]) {
          dailyPlanning[dayBeforeKey] = [];
        }
        
        dailyPlanning[dayBeforeKey].push({
          courseId: course.courseId,
          courseName: course.courseName,
          duration: 4,
          type: 'revision-finale',
        });
        
        remainingHours -= 4;
      }
    }

    // Étape 2 & 3 : Répartir le temps restant sur les jours sélectionnés
    if (remainingHours > 0) {
      const currentDate = new Date(today);
      const availableDates = [];

      // Collecter toutes les dates disponibles (jours sélectionnés strictement avant l'examen)
      while (currentDate < limitDate) {
        const dayOfWeek = currentDate.getDay();
        if (activeDays.includes(dayOfWeek)) {
          const dateKey = currentDate.toISOString().split('T')[0];
          // Ne pas ajouter la date si c'est déjà la veille de l'examen (déjà utilisée pour la révision finale)
          const dayBeforeKey = new Date(limitDate);
          dayBeforeKey.setDate(dayBeforeKey.getDate() - 1);
          if (dateKey !== dayBeforeKey.toISOString().split('T')[0]) {
            availableDates.push(dateKey);
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Répartir les heures restantes en sessions
      let hoursToDistribute = remainingHours;
      let dateIndex = 0;

      while (hoursToDistribute > 0 && dateIndex < availableDates.length) {
        const dateKey = availableDates[dateIndex];
        const hoursForThisDay = Math.min(sessionDuration, hoursToDistribute);
        
        if (!dailyPlanning[dateKey]) {
          dailyPlanning[dateKey] = [];
        }

        dailyPlanning[dateKey].push({
          courseId: course.courseId,
          courseName: course.courseName,
          duration: hoursForThisDay,
          type: 'revision',
        });

        hoursToDistribute -= hoursForThisDay;
        dateIndex++;
      }
    }
  });

  // Convertir en tableau trié par date
  const dailyPlanningArray = Object.keys(dailyPlanning)
    .sort()
    .map(date => ({
      date,
      sessions: dailyPlanning[date].sort((a, b) => {
        // Trier par type (révision finale en premier) puis par nom de cours
        if (a.type !== b.type) {
          return a.type === 'revision-finale' ? -1 : 1;
        }
        return a.courseName.localeCompare(b.courseName);
      }),
      totalHours: dailyPlanning[date].reduce((sum, s) => sum + s.duration, 0),
    }));

  return {
    dailyPlanning: dailyPlanningArray,
    totalDays: dailyPlanningArray.length,
    totalSessions: dailyPlanningArray.reduce((sum, day) => sum + day.sessions.length, 0),
  };
};

