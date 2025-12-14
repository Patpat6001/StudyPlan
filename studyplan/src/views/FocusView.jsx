import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours, calculateStudyPlan } from '../utils/planning';

const FocusView = () => {
  const { data, addStudyTime } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Time in seconds
  const [savedTime, setSavedTime] = useState(0); // Time saved in hours
  const intervalRef = useRef(null);

  // Get courses with exams
  const coursesWithExams = data.courses.filter(course => course.examDate);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedCourseId) {
      alert('Veuillez sélectionner une matière');
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (time > 0 && selectedCourseId) {
      setIsRunning(false);
      const hours = time / 3600;
      addStudyTime(selectedCourseId, hours);
      setSavedTime(hours);
      setTime(0);
      
      // Clear feedback after 8 seconds
      setTimeout(() => {
        setSavedTime(0);
      }, 8000);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setSavedTime(0);
  };

  const selectedCourse = data.courses.find(c => c.id === selectedCourseId);
  const studyPlan = calculateStudyPlan(data.settings, data.courses);
  const coursePlan = selectedCourse
    ? studyPlan.coursesBreakdown.find(c => c.courseId === selectedCourseId)
    : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-apple-text mb-2">
            Focus Timer
          </h1>
          <p className="text-apple-text-secondary">
            Sélectionnez une matière et lancez votre session d'étude
          </p>
        </div>

        {/* Course Selection */}
        <div className="card-apple p-6 mb-6">
          <label className="block text-sm font-medium text-apple-text mb-3">
            Sélectionner une matière
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              if (isRunning) {
                handlePause();
                setTime(0);
              }
            }}
            disabled={isRunning}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Choisir une matière --</option>
            {data.courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timer Display */}
        <div className="card-apple p-12 mb-6">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl font-light text-apple-text mb-4 font-mono">
                {formatTime(time)}
              </div>
              {selectedCourse && (
                <p className="text-lg text-apple-text-secondary">
                  {selectedCourse.name}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  disabled={!selectedCourseId}
                  className="btn-apple flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={20} />
                  Démarrer
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="btn-apple-secondary flex items-center gap-2"
                >
                  <Pause size={20} />
                  Pause
                </button>
              )}
              
              {time > 0 && (
                <>
                  <button
                    onClick={handleStop}
                    className="btn-apple flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Square size={18} />
                    Arrêter & Sauvegarder
                  </button>
                  {!isRunning && (
                    <button
                      onClick={handleReset}
                      className="btn-apple-secondary flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Réinitialiser
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        {savedTime > 0 && selectedCourse && (
          <div className="card-apple p-6 mb-6 bg-green-50 border-2 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  Bravo ! Session enregistrée
                </h3>
                <p className="text-green-800 mb-3">
                  Vous avez étudié <strong>{formatHours(savedTime)}</strong> en <strong>{selectedCourse.name}</strong>
                </p>
                {coursePlan && (
                  <div className="space-y-1 text-sm text-green-700">
                    <p>
                      Temps total étudié : <strong>{formatHours(coursePlan.timeStudied)}</strong>
                    </p>
                    <p className="font-semibold">
                      {coursePlan.remainingHours > 0
                        ? `Il ne te reste plus que ${formatHours(coursePlan.remainingHours)} à faire en ${selectedCourse.name} !`
                        : `Félicitations ! Tu as terminé ${selectedCourse.name} !`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Course Progress */}
        {selectedCourse && (
          <div className="card-apple p-6">
            <h3 className="font-semibold text-apple-text mb-4">
              Progression - {selectedCourse.name}
            </h3>
            <div className="space-y-4">
              {coursePlan ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-apple-text-secondary">
                        Heures recommandées
                      </span>
                      <span className="font-medium text-apple-text">
                        {formatHours(coursePlan.recommendedHours)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-apple-text-secondary">
                        Temps étudié
                      </span>
                      <span className="font-medium text-apple-text">
                        {formatHours(coursePlan.timeStudied)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-apple-text-secondary">
                        Heures restantes
                      </span>
                      <span className="font-semibold text-apple-text text-lg">
                        {formatHours(coursePlan.remainingHours)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-3">
                      <div
                        className="h-full bg-apple-text transition-all duration-500 rounded-full"
                        style={{
                          width: `${Math.min((coursePlan.timeStudied / coursePlan.recommendedHours) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-apple-text-secondary">
                      Temps étudié
                    </span>
                    <span className="font-medium text-apple-text">
                      {formatHours(selectedCourse.timeStudiedSoFar || 0)}
                    </span>
                  </div>
                </div>
              )}
              {selectedCourse.examDate && (
                <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                  <span className="text-apple-text-secondary">
                    Examen le
                  </span>
                  <span className="font-medium text-apple-text">
                    {new Date(selectedCourse.examDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {data.courses.length === 0 && (
          <div className="card-apple p-12 text-center">
            <p className="text-apple-text-secondary mb-4">
              Ajoutez d'abord des cours dans l'onglet Cours pour utiliser le timer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusView;
