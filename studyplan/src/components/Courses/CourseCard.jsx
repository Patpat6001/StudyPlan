import { Calendar, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CourseCard = ({ course, onEdit }) => {
  const { deleteCourse } = useApp();

  const getDaysUntilExam = () => {
    if (!course.examDate) return null;
    const today = new Date();
    const exam = new Date(course.examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (days) => {
    if (days === null) return { color: 'bg-gray-100 text-gray-600', text: 'Non défini' };
    if (days < 0) return { color: 'bg-red-100 text-red-700', text: 'Passé' };
    if (days <= 7) return { color: 'bg-red-100 text-red-700', text: `${days}j` };
    if (days <= 14) return { color: 'bg-orange-100 text-orange-700', text: `${days}j` };
    if (days <= 30) return { color: 'bg-yellow-100 text-yellow-700', text: `${days}j` };
    return { color: 'bg-green-100 text-green-700', text: `${days}j` };
  };

  const daysUntil = getDaysUntilExam();
  const badge = getUrgencyBadge(daysUntil);

  const renderStars = (value, label) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-apple-text-secondary">{label}:</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-2 h-2 rounded-full ${
                star <= value ? 'bg-apple-text' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card-apple p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-apple-text mb-2">
            {course.name}
          </h3>
          {course.examDate && (
            <div className="flex items-center gap-2 text-sm text-apple-text-secondary mb-3">
              <Calendar size={16} />
              <span>{new Date(course.examDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</span>
            </div>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
        >
          {badge.text}
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {renderStars(course.importance || 1, 'Importance')}
        {renderStars(course.difficulty || 1, 'Difficulté')}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(course)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-apple-text rounded-apple hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
        >
          <Edit2 size={16} />
          Modifier
        </button>
        <button
          onClick={() => {
            if (window.confirm('Supprimer ce cours ?')) {
              deleteCourse(course.id);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-apple hover:bg-red-100 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;

