import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/Courses/CourseCard';
import CourseForm from '../components/Courses/CourseForm';

const CoursesView = () => {
  const { data, addCourse, updateCourse } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSaveCourse = (courseData) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, courseData);
    } else {
      addCourse(courseData);
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const sortedCourses = [...data.courses].sort((a, b) => {
    if (!a.examDate && !b.examDate) return 0;
    if (!a.examDate) return 1;
    if (!b.examDate) return -1;
    return new Date(a.examDate) - new Date(b.examDate);
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-apple-text mb-2">
              Mes Cours
            </h1>
            <p className="text-apple-text-secondary">
              {data.courses.length} cours enregistré{data.courses.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleAddCourse}
            className="btn-apple flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {sortedCourses.length === 0 ? (
          <div className="card-apple p-12 text-center">
            <p className="text-apple-text-secondary mb-4">
              Aucun cours pour le moment
            </p>
            <button onClick={handleAddCourse} className="btn-apple">
              Ajouter votre premier cours
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {sortedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
              />
            ))}
          </div>
        )}

        {showForm && (
          <CourseForm
            course={editingCourse}
            onClose={() => {
              setShowForm(false);
              setEditingCourse(null);
            }}
            onSave={handleSaveCourse}
          />
        )}
      </div>
    </div>
  );
};

export default CoursesView;

