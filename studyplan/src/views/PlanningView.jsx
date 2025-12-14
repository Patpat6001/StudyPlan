import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, List, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateStudyPlan, formatHours, generateDetailedPlanning } from '../utils/planning';

const PlanningView = () => {
  const { data, updateSettings, updateCustomPlanning } = useApp();
  const [localSettings, setLocalSettings] = useState(data.settings);
  const [editingSession, setEditingSession] = useState(null);
  const [isAddingSession, setIsAddingSession] = useState(null);
  const [editForm, setEditForm] = useState({ courseId: '', duration: 2, date: '' });

  useEffect(() => {
    setLocalSettings(data.settings);
  }, [data.settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const plan = calculateStudyPlan(localSettings, data.courses);
  const autoDetailedPlan = plan.coursesBreakdown.length > 0 && 
    plan.coursesBreakdown.some(course => course.remainingHours > 0)
    ? generateDetailedPlanning(localSettings, plan.coursesBreakdown)
    : null;

  // Utiliser le planning personnalisé s'il existe, sinon utiliser le planning auto
  const detailedPlan = data.customPlanning || autoDetailedPlan;

  const handleEditSession = (dayDate, sessionIndex) => {
    const day = detailedPlan.dailyPlanning.find(d => d.date === dayDate);
    if (day && day.sessions[sessionIndex]) {
      const session = day.sessions[sessionIndex];
      setEditingSession({ dayDate, sessionIndex });
      setEditForm({
        courseId: session.courseId,
        duration: session.duration,
        date: dayDate,
      });
    }
  };

  const handleDeleteSession = (dayDate, sessionIndex) => {
    if (!window.confirm('Supprimer cette session ?')) return;
    
    const updatedPlanning = { ...detailedPlan };
    const dayIndex = updatedPlanning.dailyPlanning.findIndex(d => d.date === dayDate);
    if (dayIndex !== -1) {
      updatedPlanning.dailyPlanning[dayIndex].sessions.splice(sessionIndex, 1);
      // Recalculer le total
      updatedPlanning.dailyPlanning[dayIndex].totalHours = 
        updatedPlanning.dailyPlanning[dayIndex].sessions.reduce((sum, s) => sum + s.duration, 0);
      
      // Supprimer le jour s'il n'y a plus de sessions
      if (updatedPlanning.dailyPlanning[dayIndex].sessions.length === 0) {
        updatedPlanning.dailyPlanning.splice(dayIndex, 1);
      }
      
      updateCustomPlanning(updatedPlanning);
    }
  };

  const handleSaveEdit = () => {
    if (!editingSession) return;
    
    const course = data.courses.find(c => c.id === editForm.courseId);
    if (!course) return;

    const updatedPlanning = { ...detailedPlan };
    const dayIndex = updatedPlanning.dailyPlanning.findIndex(d => d.date === editForm.date);
    
    if (dayIndex !== -1) {
      updatedPlanning.dailyPlanning[dayIndex].sessions[editingSession.sessionIndex] = {
        courseId: editForm.courseId,
        courseName: course.name,
        duration: editForm.duration,
        type: 'revision',
      };
      // Recalculer le total
      updatedPlanning.dailyPlanning[dayIndex].totalHours = 
        updatedPlanning.dailyPlanning[dayIndex].sessions.reduce((sum, s) => sum + s.duration, 0);
      
      updateCustomPlanning(updatedPlanning);
      setEditingSession(null);
      setEditForm({ courseId: '', duration: 2, date: '' });
    }
  };

  const handleAddSession = (dayDate) => {
    setIsAddingSession(dayDate);
    setEditForm({
      courseId: data.courses[0]?.id || '',
      duration: localSettings.sessionDuration || 2,
      date: dayDate,
    });
  };

  const handleSaveNewSession = () => {
    if (!isAddingSession) return;
    
    const course = data.courses.find(c => c.id === editForm.courseId);
    if (!course) return;

    const updatedPlanning = { ...detailedPlan };
    let dayIndex = updatedPlanning.dailyPlanning.findIndex(d => d.date === isAddingSession);
    
    if (dayIndex === -1) {
      // Créer un nouveau jour
      const newDay = {
        date: isAddingSession,
        sessions: [],
        totalHours: 0,
      };
      updatedPlanning.dailyPlanning.push(newDay);
      updatedPlanning.dailyPlanning.sort((a, b) => a.date.localeCompare(b.date));
      dayIndex = updatedPlanning.dailyPlanning.findIndex(d => d.date === isAddingSession);
    }
    
    updatedPlanning.dailyPlanning[dayIndex].sessions.push({
      courseId: editForm.courseId,
      courseName: course.name,
      duration: editForm.duration,
      type: 'revision',
    });
    
    // Recalculer le total
    updatedPlanning.dailyPlanning[dayIndex].totalHours = 
      updatedPlanning.dailyPlanning[dayIndex].sessions.reduce((sum, s) => sum + s.duration, 0);
    
    updateCustomPlanning(updatedPlanning);
    setIsAddingSession(null);
    setEditForm({ courseId: '', duration: 2, date: '' });
  };

  const handleResetPlanning = () => {
    if (window.confirm('Réinitialiser le planning aux valeurs automatiques ?')) {
      updateCustomPlanning(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-apple-text mb-2">
            Planning Blocus
          </h1>
          <p className="text-apple-text-secondary">
            Configurez votre planning et visualisez la répartition des heures d'étude
          </p>
        </div>

        {/* Settings Card */}
        <div className="card-apple p-6 mb-6">
          <h2 className="text-lg font-semibold text-apple-text mb-4">
            Paramètres
          </h2>
          
          <div className="space-y-6">
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

            {/* Nouveaux champs de configuration pour le planning détaillé */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-md font-semibold text-apple-text mb-4">
                Configuration du planning détaillé
              </h3>
              
              {/* Sélection des jours de travail */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-apple-text mb-3">
                  Jours de travail
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => {
                    const dayKey = `day${index}`;
                    const isSelected = localSettings.selectedDays?.[dayKey] !== false;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newSelectedDays = { ...localSettings.selectedDays, [dayKey]: !isSelected };
                          handleSettingChange('selectedDays', newSelectedDays);
                        }}
                        className={`px-4 py-2 rounded-apple transition-all duration-200 font-medium text-sm ${
                          isSelected
                            ? 'bg-apple-text text-white'
                            : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Durée des sessions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-apple-text mb-3">
                  Durée des sessions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 0.5, label: '30min' },
                    { value: 1, label: '1h' },
                    { value: 2, label: '2h' },
                    { value: 4, label: '4h' },
                  ].map((option) => {
                    const isSelected = (localSettings.sessionDuration || 2) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSettingChange('sessionDuration', option.value)}
                        className={`px-4 py-2 rounded-apple transition-all duration-200 font-medium text-sm ${
                          isSelected
                            ? 'bg-apple-text text-white'
                            : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Heure de l'examen */}
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Heure de l'examen (par défaut)
                </label>
                <input
                  type="time"
                  value={localSettings.examHour ? `${String(Math.floor(localSettings.examHour)).padStart(2, '0')}:${String(Math.round((localSettings.examHour % 1) * 60)).padStart(2, '0')}` : '09:00'}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    handleSettingChange('examHour', hours + minutes / 60);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        {data.courses.length > 0 && plan.totalPotentialHours > 0 && plan.totalDays > 0 ? (
          <>
            {/* Summary Card */}
            <div className="card-apple p-6 mb-6 bg-gradient-to-br from-apple-text to-gray-800 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} />
                <h2 className="text-xl font-semibold">Résumé</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
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
            <div className="card-apple p-6">
              <h2 className="text-lg font-semibold text-apple-text mb-4">
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

            {/* Planning détaillé par jour */}
            {detailedPlan && detailedPlan.dailyPlanning.length > 0 && (
              <div className="card-apple p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <List size={24} className="text-apple-text" />
                    <h2 className="text-lg font-semibold text-apple-text">
                      Planning par jour
                    </h2>
                    {data.customPlanning && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Modifié manuellement
                      </span>
                    )}
                  </div>
                  {data.customPlanning && (
                    <button
                      onClick={handleResetPlanning}
                      className="text-sm text-apple-text-secondary hover:text-apple-text transition-all"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {detailedPlan.dailyPlanning.map((day) => {
                    const date = new Date(day.date);
                    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                    const dayName = dayNames[date.getDay()];
                    
                    return (
                      <div
                        key={day.date}
                        className="border border-gray-100 rounded-apple p-4 hover:shadow-apple transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-apple-text">
                              {dayName} {date.toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                              })}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-apple-text">
                              {formatHours(day.totalHours)}
                            </p>
                            <p className="text-xs text-apple-text-secondary">
                              {day.sessions.length} session{day.sessions.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {day.sessions.map((session, index) => {
                            const isEditing = editingSession?.dayDate === day.date && editingSession?.sessionIndex === index;
                            
                            if (isEditing) {
                              return (
                                <div key={`edit-${index}`} className="bg-blue-50 border border-blue-200 rounded-apple p-3">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-apple-text mb-1">
                                        Cours
                                      </label>
                                      <select
                                        value={editForm.courseId}
                                        onChange={(e) => setEditForm({ ...editForm, courseId: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-apple text-sm"
                                      >
                                        {data.courses.map(course => (
                                          <option key={course.id} value={course.id}>
                                            {course.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-apple-text mb-1">
                                        Durée (heures)
                                      </label>
                                      <input
                                        type="number"
                                        min="0.5"
                                        max="8"
                                        step="0.5"
                                        value={editForm.duration}
                                        onChange={(e) => setEditForm({ ...editForm, duration: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-apple text-sm"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-apple-text text-white rounded-apple text-sm font-medium hover:opacity-90"
                                      >
                                        <Save size={14} />
                                        Enregistrer
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingSession(null);
                                          setEditForm({ courseId: '', duration: 2, date: '' });
                                        }}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-apple-text rounded-apple text-sm font-medium hover:bg-gray-200"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div
                                key={`${session.courseId}-${index}`}
                                className={`flex items-center justify-between p-3 rounded-apple group ${
                                  session.type === 'revision-finale'
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-gray-50 border border-gray-100'
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-apple-text">
                                    {session.courseName}
                                  </p>
                                  {session.type === 'revision-finale' && (
                                    <p className="text-xs text-red-600 font-medium mt-1">
                                      Révision finale
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-apple-text">
                                    {formatHours(session.duration)}
                                  </p>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditSession(day.date, index)}
                                      className="p-1.5 hover:bg-white rounded-apple transition-all"
                                      title="Modifier"
                                    >
                                      <Edit2 size={14} className="text-apple-text-secondary" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSession(day.date, index)}
                                      className="p-1.5 hover:bg-white rounded-apple transition-all"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={14} className="text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {isAddingSession === day.date ? (
                            <div className="bg-green-50 border border-green-200 rounded-apple p-3">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-apple-text mb-1">
                                    Cours
                                  </label>
                                  <select
                                    value={editForm.courseId}
                                    onChange={(e) => setEditForm({ ...editForm, courseId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-apple text-sm"
                                  >
                                    {data.courses.map(course => (
                                      <option key={course.id} value={course.id}>
                                        {course.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-apple-text mb-1">
                                    Durée (heures)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.5"
                                    max="8"
                                    step="0.5"
                                    value={editForm.duration}
                                    onChange={(e) => setEditForm({ ...editForm, duration: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-apple text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveNewSession}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-apple-text text-white rounded-apple text-sm font-medium hover:opacity-90"
                                  >
                                    <Save size={14} />
                                    Ajouter
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsAddingSession(null);
                                      setEditForm({ courseId: '', duration: 2, date: '' });
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-apple-text rounded-apple text-sm font-medium hover:bg-gray-200"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddSession(day.date)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-apple text-apple-text-secondary hover:border-apple-text hover:text-apple-text transition-all text-sm font-medium"
                            >
                              <Plus size={16} />
                              Ajouter une session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card-apple p-12 text-center">
            <p className="text-apple-text-secondary mb-4">
              {data.courses.length === 0
                ? "Ajoutez d'abord des cours dans l'onglet Cours"
                : "Configurez les dates de blocus et assurez-vous que vos cours ont des dates d'examen"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningView;
