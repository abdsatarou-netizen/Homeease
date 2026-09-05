# Architecture technique — HomeEase

## Vue d'ensemble

```
Frontend (Next.js)  ──HTTP/JSON──▶  Backend (NestJS)  ──Prisma──▶  PostgreSQL
                                          │
                                          ├─▶ Fournisseur SMS (OTP) — mock en dev
                                          ├─▶ Kkiapay / MTN MoMo (paiements) — à brancher
                                          └─▶ Mapbox / Google Maps (cartes) — à brancher
```

## Backend — modules NestJS

| Module | Responsabilité |
|---|---|
| `auth` | Inscription/connexion par téléphone + OTP, émission JWT |
| `users` | Profil utilisateur, administration des comptes |
| `categories` | Catégories extensibles (immobilier, auto, meubles, tourisme...) |
| `properties` | CRUD annonces, recherche/filtres/tri, modération admin |
| `favorites` | Ajout/retrait des favoris |
| `viewing-requests` | Demandes de visite (client ↔ propriétaire) |
| `bookings` | Réservations, calcul prix + frais + commission |
| `payments` | Initiation de paiement, webhook prestataire, historique |
| `reviews` | Avis et notes (utilisateurs, annonces) |
| `messaging` | Conversations et messages internes |
| `notifications` | Notifications utilisateur |
| `admin` | Dashboard, signalements, vérifications, paramètres globaux |

Chaque module suit le triptyque `*.module.ts` / `*.controller.ts` / `*.service.ts`, avec Prisma comme unique couche d'accès aux données (`src/prisma`).

## Permissions

Rôles : `USER`, `OWNER`, `AGENT`, `ADMIN`, `SUPER_ADMIN`.
Contrôle d'accès via `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` — un `USER` ne peut jamais atteindre une route marquée `ADMIN`/`SUPER_ADMIN`.

## Extensibilité multi-catégories

Le modèle `Property` reste générique (titre, prix, transaction, localisation) avec :
- des champs communs immobiliers (chambres, douche, parking...) ;
- des champs spécifiques terrain (accès, lotissement, viabilisation, statut des documents) ;
- une table `PropertyFeature` (clé/valeur libre) pour ajouter des caractéristiques propres à une nouvelle catégorie (ex. kilométrage pour une voiture) **sans migration de schéma**.

Ainsi, ajouter "voitures" ou "tourisme" ne nécessite pas de refonte de la base — seulement de nouvelles catégories + éventuellement de nouveaux champs `PropertyFeature`.

## Sécurité

- Validation stricte des DTOs (`class-validator`, `whitelist: true`).
- `helmet` + CORS restreint via `CORS_ORIGIN`.
- Rate limiting global (`@nestjs/throttler`).
- Aucune donnée de carte bancaire stockée — uniquement les références transaction fournies par Kkiapay/MoMo.
- Secrets exclusivement via variables d'environnement (`.env`, jamais committé).

## Ce qui reste à brancher pour la production réelle

1. **SMS OTP réel** (actuellement mock/log serveur) — un agrégateur SMS béninois ou Twilio/Vonage.
2. **Paiements réels** Kkiapay / MTN MoMo — l'architecture (`payments` module, table `Payment`, webhook) est prête.
3. **Stockage d'images/vidéos** — actuellement les URLs sont acceptées telles quelles ; brancher un stockage S3-compatible économique.
4. **Cartes** (Mapbox/Google Maps) côté frontend pour la vue carte et la localisation des biens.
5. **Recherche en langage naturel** (section 34 du cahier des charges) — non nécessaire au MVP.
