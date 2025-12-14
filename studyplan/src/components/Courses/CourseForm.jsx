import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

const CourseForm = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    examDate: '',
    importance: 3,
    difficulty: 3,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        examDate: course.examDate || '',
        importance: course.importance || 3,
        difficulty: course.difficulty || 3,
      });
    }
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const StarSelector = ({ label, value, onChange }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-apple-text">{label}</label>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`w-10 h-10 rounded-apple transition-all duration-200 flex items-center justify-center font-semibold ${
                star <= value
                  ? 'bg-apple-text text-white'
                  : 'bg-gray-100 text-apple-text-secondary hover:bg-gray-200'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-apple p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-apple-text">
            {course ? 'Modifier le cours' : 'Nouveau cours'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-apple transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Nom du cours *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
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
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-text focus:border-transparent transition-all duration-200"
            />
          </div>

          <StarSelector
            label="Importance"
            value={formData.importance}
            onChange={(value) => setFormData({ ...formData, importance: value })}
          />

          <StarSelector
            label="Difficulté"
            value={formData.difficulty}
            onChange={(value) => setFormData({ ...formData, difficulty: value })}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-apple-secondary"
            >
              Annuler
            </button>
            <button type="submit" className="flex-1 btn-apple">
              {course ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;

