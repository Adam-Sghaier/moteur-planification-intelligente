# Backend - Moteur de Planification Intelligente

API NestJS pour la gestion des interventions techniques avec assignation automatique.

## Technologies

- NestJS 11
- TypeORM + PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

## Prérequis

- Node.js 18+
- PostgreSQL 14+

## Installation

```bash
cd backend
npm install
```

## Configuration

Créez un fichier `.env` à partir du template :

```bash
copy .env.example .env
```

Modifiez les valeurs selon votre configuration PostgreSQL :

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=scheduling_db
DATABASE_USER=postgres
DATABASE_PASSWORD=votre_mot_de_passe

JWT_SECRET=votre-secret-jwt
JWT_EXPIRES_IN=1h
```

## Base de données

Créez la base de données PostgreSQL :

```sql
CREATE DATABASE scheduling_db;
```

## Lancement

### Développement

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## Données de test

```bash
npm run seed
```

Cela crée 5 techniciens et 10 tâches de test.

## API Documentation

Swagger UI disponible sur : http://localhost:3000/api/docs

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/login | Connexion |
| GET | /api/techniciens | Liste des techniciens |
| GET | /api/taches | Liste des tâches |
| POST | /api/planification/auto-assigner | Assignation auto |
| POST | /api/planification/assigner | Assignation manuelle |
| GET | /api/planification/conflits | Conflits détectés |

### Identifiants de test

- Email: `admin@example.com`
- Password: `admin123`

## Structure

```
src/
├── auth/           # Authentification JWT
├── techniciens/    # Gestion des techniciens
├── taches/         # Gestion des tâches
├── affectations/   # Gestion des affectations
├── planification/  # Moteur de planification
│   ├── algorithmes/    # Scoring
│   └── conflits/       # Détection conflits
└── common/         # Interceptors, filters
```

## Tests

```bash
npm run test        # Tests unitaires
npm run test:e2e    # Tests end-to-end
```
