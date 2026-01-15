import { DataSource } from 'typeorm';
import { Technicien } from './src/techniciens/entities/technicien.entity';
import { Tache, PrioriteTache, StatutTache } from './src/taches/entities/tache.entity';
import { Affectation } from './src/affectations/entities/affectation.entity';

// 20 Localisations en France
const LOCALISATIONS = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice',
  'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
  'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon',
  'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'
];

// 5 Techniciens
const TECHNICIENS: Partial<Technicien>[] = [
  {
    nom: 'Jean Dupont',
    email: 'jean.dupont@techservices.fr',
    competences: ['électricité', 'domotique', 'alarme'],
    localisation: 'Paris',
    estActif: true,
    limiteHeuresHebdo: 40,
  },
  {
    nom: 'Marie Lambert',
    email: 'marie.lambert@techservices.fr',
    competences: ['plomberie', 'chauffage', 'climatisation'],
    localisation: 'Lyon',
    estActif: true,
    limiteHeuresHebdo: 35,
  },
  {
    nom: 'Pierre Martin',
    email: 'pierre.martin@techservices.fr',
    competences: ['électricité', 'fibre optique', 'réseau'],
    localisation: 'Marseille',
    estActif: true,
    limiteHeuresHebdo: 40,
  },
  {
    nom: 'Sophie Bernard',
    email: 'sophie.bernard@techservices.fr',
    competences: ['climatisation', 'ventilation', 'chauffage'],
    localisation: 'Toulouse',
    estActif: true,
    limiteHeuresHebdo: 40,
  },
  {
    nom: 'Lucas Moreau',
    email: 'lucas.moreau@techservices.fr',
    competences: ['plomberie', 'électricité', 'serrurerie'],
    localisation: 'Bordeaux',
    estActif: true,
    limiteHeuresHebdo: 38,
  },
];

// 10 Tâches
const TACHES: Partial<Tache>[] = [
  {
    titre: 'Installation compteur électrique',
    description: 'Remplacement du compteur électrique par un compteur Linky',
    competencesRequises: ['électricité'],
    localisation: 'Paris',
    dureeEstimee: 120,
    priorite: PrioriteTache.HAUTE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Réparation fuite d\'eau',
    description: 'Fuite importante sous l\'évier de la cuisine',
    competencesRequises: ['plomberie'],
    localisation: 'Lyon',
    dureeEstimee: 90,
    priorite: PrioriteTache.URGENTE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Installation climatisation',
    description: 'Installation d\'un système split dans un appartement T3',
    competencesRequises: ['climatisation', 'électricité'],
    localisation: 'Marseille',
    dureeEstimee: 240,
    priorite: PrioriteTache.MOYENNE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Maintenance chaudière',
    description: 'Entretien annuel obligatoire de la chaudière gaz',
    competencesRequises: ['chauffage'],
    localisation: 'Toulouse',
    dureeEstimee: 60,
    priorite: PrioriteTache.BASSE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Dépannage prise électrique',
    description: 'Prise électrique qui ne fonctionne plus dans le salon',
    competencesRequises: ['électricité'],
    localisation: 'Nice',
    dureeEstimee: 45,
    priorite: PrioriteTache.MOYENNE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Installation fibre optique',
    description: 'Raccordement fibre optique pour un particulier',
    competencesRequises: ['fibre optique', 'réseau'],
    localisation: 'Nantes',
    dureeEstimee: 180,
    priorite: PrioriteTache.HAUTE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Débouchage canalisation',
    description: 'Canalisation bouchée dans la salle de bain',
    competencesRequises: ['plomberie'],
    localisation: 'Strasbourg',
    dureeEstimee: 75,
    priorite: PrioriteTache.URGENTE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Installation système alarme',
    description: 'Installation d\'un système d\'alarme avec 4 détecteurs',
    competencesRequises: ['alarme', 'électricité'],
    localisation: 'Bordeaux',
    dureeEstimee: 180,
    priorite: PrioriteTache.MOYENNE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Réparation ventilation',
    description: 'VMC qui fait du bruit et ne fonctionne plus correctement',
    competencesRequises: ['ventilation'],
    localisation: 'Montpellier',
    dureeEstimee: 90,
    priorite: PrioriteTache.BASSE,
    statut: StatutTache.EN_ATTENTE,
  },
  {
    titre: 'Changement serrure',
    description: 'Remplacement serrure porte d\'entrée suite à tentative d\'effraction',
    competencesRequises: ['serrurerie'],
    localisation: 'Lille',
    dureeEstimee: 60,
    priorite: PrioriteTache.URGENTE,
    statut: StatutTache.EN_ATTENTE,
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'scheduling_db',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'admin',
    entities: [Technicien, Tache, Affectation],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('📦 Connexion à la base de données établie');

  const affectationRepo = dataSource.getRepository(Affectation);
  const technicienRepo = dataSource.getRepository(Technicien);
  const tacheRepo = dataSource.getRepository(Tache);

  // Clear existing data (in order due to foreign keys)
  await affectationRepo.createQueryBuilder().delete().execute();
  await tacheRepo.createQueryBuilder().delete().execute();
  await technicienRepo.createQueryBuilder().delete().execute();
  console.log('🗑️  Données existantes supprimées');

  // Insert technicians
  for (const tech of TECHNICIENS) {
    await technicienRepo.save(technicienRepo.create(tech));
  }
  console.log(`✅ ${TECHNICIENS.length} techniciens créés`);

  // Insert tasks
  for (const tache of TACHES) {
    await tacheRepo.save(tacheRepo.create(tache));
  }
  console.log(`✅ ${TACHES.length} tâches créées`);

  console.log('\n📍 Localisations disponibles:', LOCALISATIONS.join(', '));

  await dataSource.destroy();
  console.log('\n🎉 Seed terminé avec succès!');
}

seed().catch(console.error);
