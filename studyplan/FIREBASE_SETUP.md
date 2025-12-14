# Configuration Firebase

Pour activer l'authentification Google et le stockage des données, vous devez configurer Firebase.

## Étapes de configuration

1. **Créer un projet Firebase**
   - Allez sur https://console.firebase.google.com/
   - Cliquez sur "Ajouter un projet"
   - Suivez les instructions pour créer votre projet

2. **Activer l'authentification Google**
   - Dans la console Firebase, allez dans "Authentication"
   - Cliquez sur "Get started"
   - Allez dans l'onglet "Sign-in method"
   - Activez "Google" comme méthode de connexion
   - Configurez le nom du projet et l'email de support

3. **Créer une base de données Firestore**
   - Dans la console Firebase, allez dans "Firestore Database"
   - Cliquez sur "Create database"
   - Choisissez "Start in test mode" (pour le développement)
   - Sélectionnez une région proche de vous

4. **Récupérer les clés de configuration**
   - Dans la console Firebase, allez dans "Project settings" (icône d'engrenage)
   - Allez dans l'onglet "General"
   - Faites défiler jusqu'à "Your apps"
   - Cliquez sur l'icône Web (</>)
   - Copiez les valeurs de configuration

5. **Configurer l'application**
   - Ouvrez le fichier `src/config/firebase.js`
   - Remplacez les valeurs `YOUR_*` par vos propres clés Firebase :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

6. **Configurer les règles de sécurité Firestore**
   - Dans Firestore, allez dans "Rules"
   - Remplacez les règles par défaut par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Seul l'utilisateur authentifié peut lire/écrire ses propres données
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Structure des données

Les données sont stockées dans Firestore sous la collection `users`, avec l'ID utilisateur comme document ID :

```
users/
  {userId}/
    settings: { ... }
    courses: [ ... ]
    tasks: [ ... ]
    customPlanning: { ... }
    lastUpdated: "2024-01-01T00:00:00.000Z"
```

## Notes importantes

- Les données sont automatiquement synchronisées avec Firebase lorsque l'utilisateur est connecté
- Si l'utilisateur n'est pas connecté, les données sont stockées localement dans localStorage
- Les données sont sauvegardées automatiquement à chaque modification

