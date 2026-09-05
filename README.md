# 🏠 HomeEase

**HomeEase — Trouvez. Comparez. Réservez.**

La plateforme qui simplifie la recherche, la location et la découverte de biens au Bénin, puis en Afrique francophone.

## Présentation

HomeEase est une marketplace immobilière (chambres, appartements, maisons, parcelles, bureaux, locaux commerciaux) conçue dès le départ pour s'étendre à d'autres catégories : automobile, meubles/équipements, tourisme. Le MVP cible le marché béninois, avec un lancement progressif : Cotonou + Abomey-Calavi, puis Porto-Novo, puis les autres zones.

## Fonctionnalités du MVP

- **Client** : inscription (téléphone + OTP), recherche avec filtres avancés, favoris, page détail, demande de visite, réservation, avis.
- **Propriétaire** : publication d'annonce en plusieurs étapes, gestion des annonces, réception des demandes, messagerie.
- **Administrateur** : validation des annonces, gestion des utilisateurs, vérifications, signalements, paramètres (commissions/frais configurables).

## Architecture

```
/frontend   → Next.js + TypeScript (mobile-first, App Router)
/backend    → NestJS + TypeScript + Prisma (PostgreSQL)
/database   → schéma Prisma, migrations, notes
/docs       → architecture détaillée, feuille de route
```

Voir [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) et [`docs/ROADMAP.md`](./docs/ROADMAP.md) pour le détail technique et l'état d'avancement par phase.

## Installation (depuis Termux ou tout terminal Linux/Mac)

### Prérequis

- Node.js 18+ (`pkg install nodejs` sous Termux)
- Une base PostgreSQL accessible (locale, ou un service géré type Railway/Supabase/Neon)
- Git

### 1. Cloner le dépôt

```bash
git clone <URL_DE_VOTRE_DEPOT_GITHUB>
cd homeease
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# → renseigner DATABASE_URL avec les identifiants PostgreSQL réels
npm install
npm run generate      # génère le client Prisma
npm run migrate:dev   # crée les tables (dev) — utiliser `npm run migrate` en production
npm run seed          # crée catégories + annonces de démonstration
npm run start:dev     # démarre l'API sur http://localhost:3001/api
```

### 3. Frontend

```bash
cd ../frontend
cp .env.example .env
# → NEXT_PUBLIC_API_URL doit pointer vers l'API (http://localhost:3001/api en local)
npm install
npm run dev            # démarre le site sur http://localhost:3000
```

## Variables d'environnement

Voir `backend/.env.example` et `frontend/.env.example`. Points clés :

- `DATABASE_URL` : connexion PostgreSQL (fournie par Railway en production).
- `JWT_SECRET` : à changer impérativement en production.
- `SMS_PROVIDER` : `mock` en développement (le code OTP est affiché dans les logs serveur) ; à remplacer par un vrai fournisseur SMS avant le lancement réel.
- `KKIAPAY_*` / `MTN_MOMO_*` : à renseigner lors du branchement réel des paiements. Ne jamais committer de vraies clés — utiliser les variables d'environnement de Railway/GitHub Actions.
- `MAPBOX_TOKEN` / `GOOGLE_MAPS_API_KEY` : nécessaires pour l'affichage de la carte (à intégrer dans une itération suivante du frontend).

## Base de données

Le schéma complet (utilisateurs, annonces, réservations, paiements, messagerie, avis, signalements, vérifications, paramètres...) est défini dans `backend/prisma/schema.prisma`. Les migrations sont gérées par Prisma :

```bash
npm run migrate:dev   # développement — crée une nouvelle migration à partir du schéma
npm run migrate       # production — applique les migrations existantes (utilisé par Railway)
npm run seed          # recharge les données de démonstration
```

## Déploiement sur Railway

1. Créer un projet Railway, ajouter un service **PostgreSQL** et un service **Node** pointant sur `/backend`.
2. Renseigner les variables d'environnement du backend (voir ci-dessus) dans l'onglet *Variables* de Railway — `DATABASE_URL` est fourni automatiquement par le plugin PostgreSQL de Railway.
3. Build command : `npm install && npm run generate && npm run build`
4. Start command : `npm run migrate && npm run start:prod`
5. Le endpoint `/health` est exposé pour la vérification de santé Railway.
6. Déployer le frontend séparément (Railway, Vercel, ou tout hébergeur Next.js), avec `NEXT_PUBLIC_API_URL` pointant vers l'URL publique du backend Railway.

## Git — bonnes pratiques

Utiliser des commits conventionnels : `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`.
Ne jamais committer `.env`, des clés API, des secrets JWT ou des données privées (voir `.gitignore`).

```bash
git add .
git commit -m "feat: recherche avec filtres avancés"
git push
```

## État d'avancement

Voir [`docs/ROADMAP.md`](./docs/ROADMAP.md) — phases 1 à 4 largement couvertes par ce socle (structure, auth, utilisateurs, catégories, annonces, recherche, favoris, page détail, messagerie de base). Paiements et cartes sont préparés architecturalement mais nécessitent le branchement des vraies clés (Kkiapay/MTN MoMo, Mapbox) avant mise en production réelle.
