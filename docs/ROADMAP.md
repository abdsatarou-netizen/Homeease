# Feuille de route — HomeEase

État d'avancement de ce socle de code par rapport aux phases définies dans le cahier des charges.

## PHASE 1 — Structure ✅
- Arborescence `/frontend`, `/backend`, `/database`, `/docs`
- README, `.gitignore`, `.env.example`

## PHASE 2 — Authentification / Utilisateurs / Rôles ✅
- Auth téléphone + OTP (mock SMS en dev)
- Rôles `USER/OWNER/AGENT/ADMIN/SUPER_ADMIN` + guards
- Profil utilisateur

## PHASE 3 — Catégories / Annonces / Photos / Recherche / Filtres ✅ (base)
- Catégories seedées (maison, appartement, chambre, parcelle, bureau, local commercial, voiture, meuble, tourisme)
- CRUD annonces + statuts complets
- Recherche avec filtres (ville, commune, quartier, prix, chambres, équipements, vérifié...) + tri
- Photos : URLs acceptées à la création — **stockage réel (S3) à brancher**

## PHASE 4 — Page détail / Favoris / Profils / Messagerie ✅ (base)
- Page détail annonce fidèle à la maquette
- Favoris (ajout/retrait)
- Messagerie interne (conversations, messages, blocage) — **pièces jointes non incluses**

## PHASE 5 — Espace propriétaire / Publication / Gestion annonces ✅ (base)
- Formulaire de publication en étapes (frontend)
- Liste "Mes annonces" (`GET /properties/mine`)
- **Non inclus** : upload réel de photos/vidéos, étape "documents"

## PHASE 6 — Administration / Validation / Vérifications / Signalements ✅ (API)
- Dashboard chiffres clés, approbation/refus d'annonces, gestion utilisateurs
- Vérifications (téléphone/identité/pro) avec mise à jour automatique des badges
- Signalements (création côté `reports`, traitement côté admin)
- **Non inclus** : interface d'administration frontend dédiée (à construire — l'API est prête)

## PHASE 7 — Demandes de visite / Réservations / Notifications ✅ (base)
- Demandes de visite (créer, accepter/refuser, notifier)
- Réservations avec calcul automatique prix + frais + commission configurable
- Notifications en base (liste, marquer lu) — **push notifications non incluses**

## PHASE 8 — Paiements / Commissions / Historique ⚠️ Architecture prête, non branchée
- Module `payments` complet (initiation, webhook, historique)
- Commissions configurables via table `Setting` (jamais codées en dur)
- **À faire avant lancement réel** : intégration effective Kkiapay / MTN MoMo (clés API, appels réels, vérification de signature webhook)

## PHASE 9 — Tests / Optimisation / Déploiement Railway ⚠️ À faire
- Health check `/health` prêt pour Railway
- Configuration de build/déploiement documentée dans le README
- **Non inclus dans ce socle** : suite de tests automatisés, optimisation d'images/cache, tests de charge

## Prochaines étapes recommandées

1. Brancher un vrai fournisseur SMS pour l'OTP.
2. Ajouter l'upload d'images (stockage S3-compatible + composant frontend).
3. Construire l'interface d'administration frontend (l'API `/admin/*` est déjà prête).
4. Intégrer Kkiapay et/ou MTN MoMo pour les paiements réels.
5. Ajouter la carte interactive (Mapbox) sur la page de recherche et la page détail.
6. Écrire les tests des parcours critiques (inscription, publication, réservation, paiement, administration).
7. Déployer sur Railway (backend + PostgreSQL) et sur un hébergeur Next.js pour le frontend.
