# Frontend - Moteur de Planification Intelligente

Interface Next.js pour la planification des interventions techniques.

## Technologies

- Next.js 16
- React 19
- TypeScript
- TailwindCSS
- React Query + Zustand
- dnd-kit (Drag & Drop)

## Prérequis

- Node.js 18+
- Backend lancé sur http://localhost:3000

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créez un fichier `.env.local` :

```bash
copy .env.example .env.local
```

Contenu :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Lancement

### Développement

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3001

### Production

```bash
npm run build
npm run start
```

## Fonctionnalités

### Page de connexion (`/login`)
- Authentification JWT
- Identifiants de démo affichés

### Page de planification (`/planning`)

| Fonctionnalité | Description |
|----------------|-------------|
| Calendrier hebdomadaire | Vue 7 jours × techniciens |
| Drag & Drop | Glisser une tâche sur un créneau |
| Modal de temps | Choisir l'heure de début/fin |
| Auto-assigner | Bouton pour assignation automatique |
| Filtres | Par priorité des tâches |
| Recherche | Par nom ou compétence technicien |
| Export PDF | Télécharger le planning |
| Email | Envoyer le planning par email |
| Conflits | Badges visuels + détails |

## Structure

```
src/
├── app/
│   ├── login/          # Page connexion
│   └── planning/       # Page principale
├── components/
│   ├── Calendar/       # WeekView, TaskCard, TechnicianSlot
│   ├── Tasks/          # TaskList, TaskDetails, AssignModal
│   ├── Technicians/    # TechnicianCard, TechnicianList
│   └── ui/             # Button, Badge, Modal, SearchInput
├── hooks/              # React Query hooks
├── lib/                # API client, utils, export
├── store/              # Zustand store
└── types/              # TypeScript types
```

## Utilisation

1. **Connexion** : `admin@example.com` / `admin123`
2. **Glissez** une tâche depuis la sidebar gauche
3. **Déposez** sur le créneau calendrier souhaité
4. **Choisissez** l'heure dans le modal
5. **Confirmez** l'assignation

## Scripts

```bash
npm run dev       # Développement
npm run build     # Build production
npm run start     # Lancer production
npm run lint      # Linting
```
