import { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

function CourseCard({ course, onEdit, onDelete }) {
  const examDate = new Date(course.examDate);
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  
  const getUrgencyColor = () => {
    if (daysUntilExam < 0) return 'bg-gray-400';
    if (daysUntilExam <= 7) return 'bg-red-500';
    if (daysUntilExam <= 14) return 'bg-orange-500';
    if (daysUntilExam <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUrgencyText = () => {
    if (daysUntilExam < 0) return 'Passé';
    if (daysUntilExam === 0) return "Aujourd'hui";
    if (daysUntilExam === 1) return 'Demain';
    return `${daysUntilExam} jours`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="card-apple p-6 transition-apple hover:shadow-apple-hover h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-apple-text mb-2 truncate">
            {course.name}
          </h3>
          <p className="text-sm text-apple-text-secondary mb-4">
            {formatDate(course.examDate)}
          </p>
        </div>
        <div className="flex gap-2 ml-2 flex-shrink-0">
          <button
            onClick={() => onEdit(course)}
            className="p-2 rounded-apple hover:bg-gray-100 transition-apple text-apple-text-secondary hover:text-apple-text"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Supprimer ce cours ?')) {
                onDelete(course.id);
              }
            }}
            className="p-2 rounded-apple hover:bg-red-50 transition-apple text-apple-text-secondary hover:text-red-500"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-apple-text-secondary">Importance</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-full transition-all ${
                  level <= course.importance
                    ? 'bg-blue-500 scale-110'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-apple-text-secondary">Difficulté</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-full transition-all ${
                  level <= course.difficulty
                    ? 'bg-purple-500 scale-110'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
        <span className="text-sm font-medium text-apple-text-secondary">Proximité</span>
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white ${getUrgencyColor()} shadow-sm`}
        >
          {getUrgencyText()}
        </span>
      </div>
    </div>
  );
}

function CourseForm({ course, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    examDate: course?.examDate || '',
    importance: course?.importance || 3,
    difficulty: course?.difficulty || 3,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.examDate) {
      onSave(formData);
      setFormData({ name: '', examDate: '', importance: 3, difficulty: 3 });
    }
  };

  return (
    <div className="card-apple p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-apple-text">
          {course ? 'Modifier le cours' : 'Nouveau cours'}
        </h2>
        {course && (
          <button
            onClick={onCancel}
            className="p-2 rounded-apple hover:bg-gray-100 transition-apple"
          >
            <X size={20} className="text-apple-text-secondary" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div>
          <label className="block text-sm font-medium text-apple-text mb-2">
            Nom du cours
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
            placeholder="Ex: Mathématiques"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-apple-text mb-2">
            Date de l'examen
          </label>
          <input
            type="date"
            value={formData.examDate}
            onChange={(e) =>
              setFormData({ ...formData, examDate: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Importance (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.importance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  importance: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-center mt-1">
              <span className="text-sm font-medium text-apple-text">
                {formData.importance}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Difficulté (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-center mt-1">
              <span className="text-sm font-medium text-apple-text">
                {formData.difficulty}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-apple py-3.5 text-base"
        >
          {course ? 'Enregistrer' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}

export default function Courses() {
  const { state, addCourse, updateCourse, deleteCourse } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleSave = (formData) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
      setEditingCourse(null);
    } else {
      addCourse(formData);
      setShowForm(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const sortedCourses = [...state.courses].sort((a, b) => {
    return new Date(a.examDate) - new Date(b.examDate);
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-apple-text mb-3">
            Cours & Examens
          </h1>
          <p className="text-base md:text-lg text-apple-text-secondary">
            Gérez vos cours et suivez vos examens
          </p>
        </div>

        {showForm && (
          <CourseForm
            course={editingCourse}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto mb-6 lg:mb-8 btn-apple flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Ajouter un cours</span>
          </button>
        )}

        {sortedCourses.length === 0 ? (
          <div className="card-apple p-12 md:p-16 lg:p-20 text-center">
            <p className="text-lg md:text-xl text-apple-text-secondary mb-6">
              Aucun cours pour le moment
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-apple"
              >
                Ajouter votre premier cours
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sortedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEdit}
                onDelete={deleteCourse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

