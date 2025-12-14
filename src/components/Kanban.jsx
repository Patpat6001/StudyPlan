import { useState } from 'react';
import { Plus, X, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Kanban() {
  const { state, addTask, updateTask, deleteTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'À faire', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'En cours', color: 'bg-blue-100' },
    { id: 'done', title: 'Terminé', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status) => {
    return state.tasks.filter((task) => task.status === status);
  };

  const getCourseName = (courseId) => {
    if (!courseId) return null;
    const course = state.courses.find((c) => c.id === courseId);
    return course ? course.name : null;
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({
        ...taskData,
        status: taskData.status || 'todo',
      });
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTask(draggedTask.id, { status });
    }
    setDraggedTask(null);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-apple-text mb-2">
              Tâches
            </h1>
            <p className="text-base md:text-lg text-apple-text-secondary">
              {state.tasks.length} tâche{state.tasks.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={handleAddTask} className="btn-apple flex items-center gap-2">
            <Plus size={20} />
            <span className="hidden sm:inline">Ajouter une tâche</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        {showForm && (
          <TaskForm
            task={editingTask}
            courses={state.courses}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {columns.map((column) => {
            const tasks = getTasksByStatus(column.id);
            return (
              <div
                key={column.id}
                className="card-apple p-5 md:p-6 min-h-[500px] lg:min-h-[600px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${column.color}`} />
                    <h2 className="text-lg md:text-xl font-semibold text-apple-text">{column.title}</h2>
                    <span className="text-sm font-medium text-apple-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-apple-text-secondary text-sm">
                      Aucune tâche
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        courseName={getCourseName(task.courseId)}
                        onEdit={handleEditTask}
                        onDelete={deleteTask}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TaskCard = ({ task, courseName, onEdit, onDelete, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="bg-white border border-gray-200 rounded-apple p-4 cursor-move hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-apple-text mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-apple-text-secondary mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          {courseName && (
            <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2">
              {courseName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-apple-text-secondary hover:text-apple-text"
            title="Modifier"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-apple-text-secondary hover:text-red-500"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <GripVertical size={14} />
      </div>
    </div>
  );
};

const TaskForm = ({ task, courses, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    courseId: task?.courseId || '',
    priority: task?.priority || 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        ...formData,
        courseId: formData.courseId || null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-apple p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-apple-text">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-apple-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
              placeholder="Ex: Réviser le chapitre 5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white resize-none"
              rows="3"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Cours associé
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
            >
              <option value="">Aucun cours</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-apple border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-apple bg-white"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-apple border border-gray-200 text-apple-text font-medium hover:bg-gray-50 transition-apple"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-apple"
            >
              {task ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
