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

