# StudyPlan 📚

Une application web moderne pour étudiants, conçue avec un design system inspiré d'Apple.

## 🚀 Technologies

- **React** (Vite) - Framework frontend
- **Tailwind CSS** - Styling avec design Apple
- **Lucide React** - Icônes minimalistes
- **LocalStorage** - Persistance des données

## 🎨 Design

- **Background**: Blanc cassé (#F5F5F7)
- **Cards**: Blanches avec ombres douces, coins arrondis
- **Typography**: Inter (style San Francisco)
- **UX**: Fluide, sans rechargement de page
- **Animations**: Transitions douces

## 📱 Modules

### 1. Cours & Examens ✅
- Liste des cours avec dates d'examen
- Importance et difficulté (1-5)
- Badges de proximité d'examen
- Tri automatique par date

### 2. Kanban (À venir)
- Colonnes: À faire, En cours, Terminé
- Tâches liées aux cours

### 3. Planning Blocus (À venir)
- Calcul automatique des heures d'étude
- Répartition par matière selon difficulté/importance

### 4. Focus Timer (À venir)
- Chronomètre d'étude
- Déduction automatique du temps étudié

## 🛠️ Installation

```bash
npm install
npm run dev
```

## 📦 Structure

```
src/
├── components/      # Composants réutilisables
│   ├── Navigation.jsx
│   └── Courses/
│       ├── CourseCard.jsx
│       └── CourseForm.jsx
├── views/          # Vues principales
│   ├── CoursesView.jsx
│   ├── KanbanView.jsx
│   ├── PlanningView.jsx
│   └── FocusView.jsx
├── context/        # Gestion d'état global
│   └── AppContext.jsx
└── utils/          # Utilitaires
    └── storage.js
```

## 💾 Données

Les données sont sauvegardées automatiquement dans LocalStorage avec la structure suivante:

```json
{
  "settings": {
    "startBlockDate": "",
    "endBlockDate": "",
    "studyDaysPerWeek": 5,
    "hoursPerDay": 6
  },
  "courses": [
    {
      "id": "...",
      "name": "...",
      "examDate": "...",
      "difficulty": 3,
      "importance": 3,
      "timeStudiedSoFar": 0
    }
  ],
  "tasks": []
}
```
