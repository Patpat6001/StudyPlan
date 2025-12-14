import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateStudyPlan, formatHours } from '../utils/planning';

export default function Planning() {
  const { state, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(state.settings);

  useEffect(() => {
    setLocalSettings(state.settings);
  }, [state.settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const plan = calculateStudyPlan(localSettings, state.courses);

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-apple-text mb-3">
            Planning Blocus
          </h1>
          <p className="text-base md:text-lg text-apple-text-secondary">
            Configurez votre planning et visualisez la répartition des heures d'étude
          </p>
        </div>

        {/* Settings Card */}
        <div className="card-apple p-6 md:p-8 lg:p-10 mb-6 lg:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-apple-text mb-6 md:mb-8">
            Paramètres
          </h2>
          
          <div className="space-y-6 md:space-y-8">
            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date début blocus
                </label>
                <input
                  type="date"
                  value={localSettings.startBlockDate || ''}
                  onChange={(e) => handleSettingChange('startBlockDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date fin blocus
                </label>
                <input
                  type="date"
                  value={localSettings.endBlockDate || ''}
                  onChange={(e) => handleSettingChange('endBlockDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-apple-text">
                    Jours d'étude par semaine
                  </label>
                  <span className="text-lg font-semibold text-apple-text">
                    {localSettings.studyDaysPerWeek || 5} jours
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={localSettings.studyDaysPerWeek || 5}
                  onChange={(e) => handleSettingChange('studyDaysPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-apple-text"
                />
                <div className="flex justify-between text-xs text-apple-text-secondary mt-1">
                  <span>1</span>
                  <span>7</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-apple-text">
                    <Clock size={16} className="inline mr-2" />
                    Heures d'étude par jour
                  </label>
                  <span className="text-lg font-semibold text-apple-text">
                    {localSettings.hoursPerDay || 6}h
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={localSettings.hoursPerDay || 6}
                  onChange={(e) => handleSettingChange('hoursPerDay', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-apple-text"
                />
                <div className="flex justify-between text-xs text-apple-text-secondary mt-1">
                  <span>1h</span>
                  <span>12h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        {state.courses.length > 0 && plan.totalPotentialHours > 0 && plan.totalDays > 0 ? (
          <>
            {/* Summary Card */}
            <div className="card-apple p-6 md:p-8 lg:p-10 mb-6 lg:mb-8 bg-gradient-to-br from-apple-text to-gray-800 text-white">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={28} />
                <h2 className="text-2xl md:text-3xl font-semibold">Résumé</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <p className="text-sm opacity-90 mb-1">Potentiel total</p>
                  <p className="text-2xl font-bold">{formatHours(plan.totalPotentialHours)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Heures restantes</p>
                  <p className="text-2xl font-bold">{formatHours(plan.totalRemainingHours)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Période</p>
                  <p className="text-lg font-semibold">{plan.totalDays} jours</p>
                </div>
              </div>
            </div>

            {/* Courses Breakdown */}
            <div className="card-apple p-6 md:p-8 lg:p-10">
              <h2 className="text-xl md:text-2xl font-semibold text-apple-text mb-6 md:mb-8">
                Répartition par matière
              </h2>
              
              {plan.coursesBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {plan.coursesBreakdown.map((item) => {
                    const progress = item.recommendedHours > 0
                      ? (item.timeStudied / item.recommendedHours) * 100
                      : 0;
                    
                    return (
                      <div key={item.courseId} className="border border-gray-100 rounded-apple p-4 hover:shadow-apple transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-apple-text mb-1">
                              {item.courseName}
                            </h3>
                            <p className="text-sm text-apple-text-secondary">
                              {item.examDate && new Date(item.examDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-apple-text">
                              {formatHours(item.remainingHours)}
                            </p>
                            <p className="text-xs text-apple-text-secondary">
                              restantes
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-apple-text-secondary">
                              {formatHours(item.timeStudied)} / {formatHours(item.recommendedHours)} étudiées
                            </span>
                            <span className="font-medium text-apple-text">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-apple-text transition-all duration-500 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-apple-text-secondary text-center py-8">
                  Aucun cours avec date d'examen configurée
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="card-apple p-12 text-center">
            <p className="text-apple-text-secondary mb-4">
              {state.courses.length === 0
                ? "Ajoutez d'abord des cours dans l'onglet Cours"
                : "Configurez les dates de blocus et assurez-vous que vos cours ont des dates d'examen"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
