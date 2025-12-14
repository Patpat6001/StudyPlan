import { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, ChevronLeft, ChevronRight, Check, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateStudyPlan, formatHours, generateDetailedPlanning } from '../utils/planning';

const PlanningView = () => {
  const { data, updateSettings, updateCustomPlanning } = useApp();
  const [activeTab, setActiveTab] = useState('configuration'); // 'configuration' ou 'calendrier'
  const [localSettings, setLocalSettings] = useState(data.settings);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setLocalSettings(data.settings);
  }, [data.settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  // Calculs du planning
  const plan = calculateStudyPlan(localSettings, data.courses);
  const autoDetailedPlan = plan.coursesBreakdown.length > 0 && 
    plan.coursesBreakdown.some(course => course.remainingHours > 0)
    ? generateDetailedPlanning(localSettings, plan.coursesBreakdown)
    : null;

  const detailedPlan = data.customPlanning || autoDetailedPlan;

  // Vérifier si la configuration est complète
  const isConfigComplete = localSettings.startBlockDate && 
                          localSettings.endBlockDate && 
                          data.courses.length > 0 &&
                          data.courses.some(c => c.examDate);

  // Fonction pour générer le planning
  const handleGeneratePlanning = () => {
    if (!isConfigComplete) {
      alert('Veuillez compléter la configuration avant de générer le planning (dates de blocus et cours avec dates d\'examen)');
      return;
    }

    if (plan.coursesBreakdown.length === 0 || !autoDetailedPlan) {
      alert('Aucun planning ne peut être généré. Vérifiez que vos cours ont des dates d\'examen et des heures restantes à étudier.');
      return;
    }

    // Générer et sauvegarder le planning
    updateCustomPlanning(autoDetailedPlan);
    
    // Afficher un message de succès
    alert(`Planning généré avec succès !\n\n${autoDetailedPlan.totalDays} jours d'étude\n${autoDetailedPlan.totalSessions} sessions au total\n\nVous pouvez maintenant visualiser votre planning dans l'onglet Calendrier.`);
    
    // Passer automatiquement à l'onglet calendrier
    setActiveTab('calendrier');
  };

  // === PARTIE CONFIGURATION ===
  const ConfigurationView = () => {
  return (
      <div className="space-y-6">
        <div className="card-apple p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={24} className="text-apple-text" />
            <div>
              <h2 className="text-xl font-semibold text-apple-text">
                Configuration du Planning
              </h2>
              <p className="text-sm text-apple-text-secondary">
                Configurez votre planning une seule fois - ces paramètres seront utilisés pour générer automatiquement votre calendrier
          </p>
        </div>
          </div>

          {/* Dates de blocus */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              <Calendar size={18} className="inline mr-2" />
              Période de blocus
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-apple-text-secondary mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={localSettings.startBlockDate || ''}
                  onChange={(e) => handleSettingChange('startBlockDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-apple-text-secondary mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={localSettings.endBlockDate || ''}
                  onChange={(e) => handleSettingChange('endBlockDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Jours disponibles */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              Jours disponibles pour étudier
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
                    className={`px-4 py-3 rounded-apple transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-apple-text text-white shadow-apple'
                        : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <Check size={16} />}
                    {day}
                  </button>
                );
              })}
              </div>
            </div>

          {/* Plages horaires préférées */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              Plages horaires préférées
                  </label>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { key: 'morning', label: 'Matin', icon: Sun, hours: '8h - 12h', desc: 'Plus productif le matin' },
                { key: 'afternoon', label: 'Après-midi', icon: Clock, hours: '13h - 18h', desc: 'Concentration après-midi' },
                { key: 'evening', label: 'Soir', icon: Moon, hours: '18h - 22h', desc: 'Étude en soirée' },
              ].map((period) => {
                const Icon = period.icon;
                const isSelected = localSettings.preferredTimeSlots?.[period.key] !== false;
                return (
                  <button
                    key={period.key}
                    type="button"
                    onClick={() => {
                      const newSlots = { ...localSettings.preferredTimeSlots, [period.key]: !isSelected };
                      handleSettingChange('preferredTimeSlots', newSlots);
                    }}
                    className={`p-4 rounded-apple border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-apple-text bg-apple-text bg-opacity-5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className={isSelected ? 'text-apple-text' : 'text-apple-text-secondary'} />
                      <div className="flex-1">
                        <div className={`font-semibold ${isSelected ? 'text-apple-text' : 'text-apple-text-secondary'}`}>
                          {period.label}
                        </div>
                        <div className="text-xs text-apple-text-secondary mt-1">
                          {period.hours}
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-apple-text" />}
                    </div>
                    <div className="text-xs text-apple-text-secondary mt-2">
                      {period.desc}
                </div>
                  </button>
                );
              })}
                </div>
              </div>

          {/* Heures d'étude par jour */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              <Clock size={18} className="inline mr-2" />
                    Heures d'étude par jour
                  </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-apple-text-secondary">Nombre d'heures</span>
                <span className="text-2xl font-bold text-apple-text">
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
                <span>6h (recommandé)</span>
                  <span>12h</span>
              </div>
            </div>
          </div>
              
          {/* Durée des sessions */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              Durée des sessions de travail
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 0.5, label: '30 min', desc: 'Session courte' },
                { value: 1, label: '1 heure', desc: 'Standard' },
                { value: 2, label: '2 heures', desc: 'Recommandé' },
                { value: 3, label: '3 heures', desc: 'Session longue' },
              ].map((option) => {
                const isSelected = (localSettings.sessionDuration || 2) === option.value;
                    return (
                      <button
                    key={option.value}
                        type="button"
                    onClick={() => handleSettingChange('sessionDuration', option.value)}
                    className={`px-4 py-4 rounded-apple transition-all duration-200 font-medium ${
                          isSelected
                        ? 'bg-apple-text text-white shadow-apple'
                            : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
                        }`}
                      >
                    <div className="text-lg font-bold mb-1">{option.label}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

          {/* Pauses entre sessions */}
              <div className="mb-6">
            <label className="block text-sm font-semibold text-apple-text mb-4">
              Pauses entre les sessions
                </label>
            <div className="grid grid-cols-3 gap-3">
                  {[
                { value: 15, label: '15 min', desc: 'Courte' },
                { value: 30, label: '30 min', desc: 'Standard' },
                { value: 60, label: '1 heure', desc: 'Longue' },
                  ].map((option) => {
                const isSelected = (localSettings.breakDuration || 30) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                    onClick={() => handleSettingChange('breakDuration', option.value)}
                    className={`px-4 py-3 rounded-apple transition-all duration-200 font-medium ${
                          isSelected
                        ? 'bg-apple-text text-white shadow-apple'
                            : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
                        }`}
                      >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-75 mt-1">{option.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

          {/* Bouton pour générer le planning */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {isConfigComplete ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-apple mb-4">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <Check size={18} />
                    Configuration complète
                  </div>
                  <p className="text-sm text-green-600 mb-4">
                    Votre configuration est prête ! Cliquez sur le bouton ci-dessous pour générer automatiquement votre planning d'étude.
                  </p>
                  {autoDetailedPlan && (
                    <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                      <strong>Aperçu :</strong> {autoDetailedPlan.totalDays} jours d'étude, {autoDetailedPlan.totalSessions} sessions prévues
                    </div>
                  )}
                </div>
                <button
                  onClick={handleGeneratePlanning}
                  className="w-full btn-apple text-lg py-4 flex items-center justify-center gap-3 shadow-apple-hover"
                  disabled={!autoDetailedPlan}
                >
                  <Calendar size={24} />
                  Générer le planning d'étude
                </button>
                {!autoDetailedPlan && (
                  <p className="text-sm text-red-600 text-center">
                    Impossible de générer le planning. Assurez-vous que vos cours ont des dates d'examen et des heures à étudier.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-apple">
                <div className="text-yellow-800 font-semibold mb-2">
                  Configuration incomplète
                </div>
                <p className="text-sm text-yellow-700">
                  Pour générer votre planning, vous devez :
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  {!localSettings.startBlockDate && <li>Définir la date de début du blocus</li>}
                  {!localSettings.endBlockDate && <li>Définir la date de fin du blocus</li>}
                  {data.courses.length === 0 && <li>Ajouter au moins un cours</li>}
                  {data.courses.length > 0 && !data.courses.some(c => c.examDate) && <li>Définir des dates d'examen pour vos cours</li>}
                </ul>
            </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // === PARTIE CALENDRIER ===
  const CalendarView = () => {
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Jours du mois précédent pour compléter la première semaine
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonth.getDate() - i),
          isCurrentMonth: false,
        });
      }
      
      // Jours du mois actuel
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          date: new Date(year, month, day),
          isCurrentMonth: true,
        });
      }
      
      // Jours du mois suivant pour compléter la dernière semaine
      const remainingDays = 42 - days.length; // 6 semaines * 7 jours
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          date: new Date(year, month + 1, day),
          isCurrentMonth: false,
        });
      }
      
      return days;
    };

    const getSessionsForDate = (date) => {
      if (!detailedPlan) return [];
      const dateStr = date.toISOString().split('T')[0];
      const day = detailedPlan.dailyPlanning.find(d => d.date === dateStr);
      return day ? day.sessions : [];
    };

    const getDayTotalHours = (date) => {
      const sessions = getSessionsForDate(date);
      return sessions.reduce((sum, s) => sum + s.duration, 0);
    };

    const getCourseColor = (courseId) => {
      const course = data.courses.find(c => c.id === courseId);
      if (!course) return 'bg-gray-400';
      
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
        'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
      ];
      const index = data.courses.findIndex(c => c.id === courseId) % colors.length;
      return colors[index];
    };

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const days = getDaysInMonth(currentMonth);

    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-6">
        {/* En-tête du calendrier */}
        <div className="card-apple p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-apple-text mb-1">
                Calendrier d'étude
              </h2>
              <p className="text-sm text-apple-text-secondary">
                Visualisez toutes vos heures d'études planifiées
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-apple hover:bg-gray-100 transition-all"
              >
                <ChevronLeft size={20} className="text-apple-text" />
              </button>
              <div className="text-lg font-semibold text-apple-text min-w-[200px] text-center">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 rounded-apple hover:bg-gray-100 transition-all"
              >
                <ChevronRight size={20} className="text-apple-text" />
              </button>
            </div>
          </div>

          {/* Statistiques du mois */}
          {detailedPlan && (
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-apple">
              <div className="text-center">
                <div className="text-2xl font-bold text-apple-text">
                  {detailedPlan.dailyPlanning.filter(d => {
                    const date = new Date(d.date);
                    return date.getMonth() === currentMonth.getMonth() && 
                           date.getFullYear() === currentMonth.getFullYear();
                  }).length}
                </div>
                <div className="text-xs text-apple-text-secondary mt-1">Jours d'étude</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-apple-text">
                  {formatHours(
                    detailedPlan.dailyPlanning
                      .filter(d => {
                        const date = new Date(d.date);
                        return date.getMonth() === currentMonth.getMonth() && 
                               date.getFullYear() === currentMonth.getFullYear();
                      })
                      .reduce((sum, day) => sum + day.totalHours, 0)
                  )}
                </div>
                <div className="text-xs text-apple-text-secondary mt-1">Heures totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-apple-text">
                  {formatHours(
                    detailedPlan.dailyPlanning
                      .filter(d => {
                        const date = new Date(d.date);
                        return date.getMonth() === currentMonth.getMonth() && 
                               date.getFullYear() === currentMonth.getFullYear();
                      })
                      .reduce((sum, day) => sum + day.totalHours, 0) / 
                      Math.max(1, detailedPlan.dailyPlanning.filter(d => {
                        const date = new Date(d.date);
                        return date.getMonth() === currentMonth.getMonth() && 
                               date.getFullYear() === currentMonth.getFullYear();
                      }).length)
                  )}
                </div>
                <div className="text-xs text-apple-text-secondary mt-1">Moyenne/jour</div>
              </div>
            </div>
          )}

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {/* En-têtes des jours */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-apple-text-secondary py-2"
              >
                {day}
              </div>
            ))}

            {/* Jours du calendrier */}
            {days.map((dayInfo, index) => {
              const date = dayInfo.date;
              const dateStr = date.toISOString().split('T')[0];
              const sessions = getSessionsForDate(date);
              const totalHours = getDayTotalHours(date);
              const isToday = dateStr === today.toISOString().split('T')[0];
              const isPast = date < today && !isToday;
                    
                    return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 rounded-apple border-2 transition-all ${
                    dayInfo.isCurrentMonth
                      ? isToday
                        ? 'border-apple-text bg-blue-50'
                        : isPast
                        ? 'border-gray-100 bg-gray-50 opacity-60'
                        : 'border-gray-100 bg-white hover:border-gray-300'
                      : 'border-transparent bg-gray-50 opacity-40'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isToday ? 'text-apple-text' : dayInfo.isCurrentMonth ? 'text-apple-text' : 'text-apple-text-secondary'
                  }`}>
                    {date.getDate()}
                    {isToday && (
                      <span className="ml-1 text-xs bg-apple-text text-white px-1.5 py-0.5 rounded-full">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  {dayInfo.isCurrentMonth && sessions.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-apple-text mb-1">
                        {formatHours(totalHours)}
                      </div>
                      {sessions.slice(0, 3).map((session, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded ${getCourseColor(session.courseId)} text-white truncate`}
                          title={`${session.courseName} - ${formatHours(session.duration)}`}
                        >
                          {session.courseName.substring(0, 12)}
                          {session.courseName.length > 12 ? '...' : ''} - {formatHours(session.duration)}
                        </div>
                      ))}
                      {sessions.length > 3 && (
                        <div className="text-xs text-apple-text-secondary">
                          +{sessions.length - 3} autre(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
                          </div>
                        </div>
                        
        {/* Légende des matières */}
        {data.courses.length > 0 && (
          <div className="card-apple p-6">
            <h3 className="text-lg font-semibold text-apple-text mb-4">Légende des matières</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.courses.map((course) => {
                const sessionsInMonth = detailedPlan?.dailyPlanning
                  .filter(d => {
                    const date = new Date(d.date);
                    return date.getMonth() === currentMonth.getMonth() && 
                           date.getFullYear() === currentMonth.getFullYear();
                  })
                  .flatMap(day => day.sessions.filter(s => s.courseId === course.id))
                  .length || 0;
                            
                            return (
                              <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-apple"
                  >
                    <div
                      className={`w-4 h-4 rounded ${getCourseColor(course.id)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-apple-text truncate">
                        {course.name}
                                </div>
                      <div className="text-xs text-apple-text-secondary">
                        {sessionsInMonth} session{sessionsInMonth > 1 ? 's' : ''} ce mois
                                  </div>
                                </div>
                              </div>
                            );
                          })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-apple-text mb-2">
            Planning d'Étude
          </h1>
          <p className="text-apple-text-secondary">
            Configurez votre planning une fois, puis visualisez-le dans le calendrier
          </p>
                                </div>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
                                  <button
            onClick={() => setActiveTab('configuration')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'configuration'
                ? 'border-apple-text text-apple-text'
                : 'border-transparent text-apple-text-secondary hover:text-apple-text'
            }`}
                                  >
            <Settings size={18} className="inline mr-2" />
            Configuration
                                  </button>
                                  <button
            onClick={() => setActiveTab('calendrier')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'calendrier'
                ? 'border-apple-text text-apple-text'
                : 'border-transparent text-apple-text-secondary hover:text-apple-text'
            }`}
                                  >
            <Calendar size={18} className="inline mr-2" />
            Calendrier
                                  </button>
                                </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'configuration' ? (
          <ConfigurationView />
        ) : (
          !isConfigComplete ? (
          <div className="card-apple p-12 text-center">
              <Settings size={48} className="mx-auto mb-4 text-apple-text-secondary opacity-50" />
              <h3 className="text-xl font-semibold text-apple-text mb-2">
                Configuration requise
              </h3>
              <p className="text-apple-text-secondary mb-6">
                Veuillez d'abord compléter la configuration dans l'onglet Configuration avant de visualiser le calendrier.
              </p>
              <button
                onClick={() => setActiveTab('configuration')}
                className="btn-apple"
              >
                Aller à la configuration
              </button>
          </div>
          ) : (
            <CalendarView />
          )
        )}
      </div>
    </div>
  );
};

export default PlanningView;
