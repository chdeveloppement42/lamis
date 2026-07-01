# CAHIER DES CHARGES

## Plateforme Web Immobilière Sécurisée

---

|                 |                                              |
| --------------- | -------------------------------------------- |
| **Projet**      | immo_lamis                                   |
| **Date**        | 21 Avril 2026                                |
| **Statut**      | Validé — Prêt pour signature                 |
| **Prestataire** | CH Développement                             |
| **Client**      | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |

---

## Table des matières

1. [Objet du document](#1-objet-du-document)
2. [Présentation du projet](#2-présentation-du-projet)
3. [Périmètre fonctionnel](#3-périmètre-fonctionnel)
4. [Acteurs du système](#4-acteurs-du-système)
5. [Description des interfaces](#5-description-des-interfaces)
6. [Système de rôles et permissions](#6-système-de-rôles-et-permissions)
7. [Gestion des médias](#7-gestion-des-médias)
8. [Sécurité et authentification](#8-sécurité-et-authentification)
9. [Stack technique](#9-stack-technique)
10. [Fonctionnalités hors périmètre](#10-fonctionnalités-hors-périmètre)
11. [Planning prévisionnel](#11-planning-prévisionnel)
12. [Conditions générales](#12-conditions-générales)
13. [Validation et signatures](#13-validation-et-signatures)

---

## 1. Objet du document

Le présent Cahier des Charges a pour objet de définir les spécifications fonctionnelles et techniques du projet **immo_lamis**, une plateforme web de mise en relation entre fournisseurs immobiliers et chercheurs de biens.

Ce document constitue le référentiel contractuel entre le **client** et le **prestataire**. Il décrit l'ensemble des fonctionnalités à livrer, les contraintes techniques à respecter, ainsi que le périmètre exact de la prestation.

**Toute fonctionnalité non mentionnée dans ce document est considérée comme hors périmètre** et fera l'objet d'un avenant séparé si elle devait être ajoutée.

---

## 2. Présentation du projet

### 2.1 Contexte

Le client souhaite disposer d'une plateforme web permettant à des agences et agents immobiliers de publier des annonces de biens à destination du grand public. La plateforme vise à créer un environnement de **confiance** en imposant une validation administrative obligatoire avant toute publication.

### 2.2 Objectifs

- Offrir un espace de publication d'annonces immobilières contrôlé et qualitatif.
- Permettre aux visiteurs de rechercher et consulter des biens de manière intuitive.
- Fournir une interface d'administration complète pour la gestion de la plateforme.
- Garantir un haut niveau de sécurité grâce à un système de rôles et permissions configurable.

### 2.3 Principe fondamental

> **Aucun fournisseur ne peut publier d'annonce sans avoir été préalablement validé manuellement par un administrateur.**

---

## 3. Périmètre fonctionnel

### 3.1 Fonctionnalités du Visiteur (sans compte)

| #     | Fonctionnalité          | Description                                                                        |
| ----- | ----------------------- | ---------------------------------------------------------------------------------- |
| F-V01 | Navigation des annonces | Parcourir toutes les annonces publiées et validées                                 |
| F-V02 | Filtrage                | Filtrer par catégorie, tranche de prix, nombre de pièces et ville                  |
| F-V03 | Détail d'annonce        | Consulter la page complète d'une annonce (photos, description, prix, localisation) |
| F-V04 | Contact plateforme      | Contacter l'administration via un formulaire de contact                            |

### 3.2 Fonctionnalités du Fournisseur (compte requis)

| #     | Fonctionnalité             | Description                                                                                                                                   |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| F-P01 | Inscription                | Création de compte avec informations personnelles et document justificatif obligatoire                                                        |
| F-P02 | Connexion dynamique        | Affichage adapté selon le statut : en attente (bannière orange), validé (accès publication), rejeté (message de rejet)                        |
| F-P03 | Publication d'annonces     | Création d'annonces avec catégorie, titre, description, prix, ville, quartier et photos (uniquement après validation)                         |
| F-P04 | Brouillons                 | Sauvegarde d'annonces en brouillon ou publication immédiate                                                                                   |
| F-P05 | Upload photos              | Téléchargement de plusieurs images par annonce                                                                                                |
| F-P06 | Gestion du profil          | Modification des informations personnelles (nom, téléphone, adresse)                                                                          |
| F-P07 | Changement de mot de passe | Modification autonome et sécurisée du mot de passe                                                                                            |
| F-P08 | Re-validation automatique  | La modification de l'email ou du document justificatif entraîne automatiquement le retour au statut **PENDING** (en attente de re-validation) |

### 3.3 Fonctionnalités du Super Administrateur

| #      | Fonctionnalité            | Description                                                         |
| ------ | ------------------------- | ------------------------------------------------------------------- |
| F-SA01 | Accès total               | Accès sans restriction à l'ensemble des fonctionnalités             |
| F-SA02 | Gestion des permissions   | Accès exclusif à la page de gestion des rôles et permissions        |
| F-SA03 | Gestion des comptes admin | Création et gestion de tous les comptes administrateurs et managers |
| F-SA04 | Attribution des rôles     | Attribution de permissions jusqu'à son propre niveau uniquement     |

### 3.4 Fonctionnalités des Managers / Modérateurs

| #     | Fonctionnalité            | Description                                                                                              |
| ----- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| F-M01 | Accès configurable        | Accès limité aux fonctionnalités selon le rôle attribué                                                  |
| F-M02 | Actions selon permissions | Validation/rejet de fournisseurs, modération d'annonces, gestion de catégories selon les droits accordés |
| F-M03 | Règle d'escalade          | Impossibilité de dépasser le niveau de permission du créateur du compte                                  |

---

## 4. Acteurs du système

| Acteur          | Type de compte    | Accès                        | Validation requise                             |
| --------------- | ----------------- | ---------------------------- | ---------------------------------------------- |
| **Visiteur**    | Aucun             | Pages publiques uniquement   | Non                                            |
| **Fournisseur** | Compte personnel  | Pages fournisseur + profil   | Oui — validation admin obligatoire             |
| **Super Admin** | Compte unique     | Accès total, non supprimable | Non — compte initial                           |
| **Manager**     | Comptes multiples | Selon rôle attribué          | Non — créé par Super Admin ou Manager autorisé |
| **Modérateur**  | Comptes multiples | Selon rôle attribué          | Non — créé par Super Admin ou Manager autorisé |

---

## 5. Description des interfaces

### 5.1 Pages publiques

| Page                    | Contenu                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Accueil (Landing)**   | Section Hero avec recherche rapide, catégories visuelles, 6 dernières annonces, bouton "Devenir fournisseur" |
| **Annonces (Services)** | Grille d'annonces avec filtres latéraux (catégorie, prix, pièces, ville), cartes d'annonces, pagination      |
| **Détail d'annonce**    | Galerie photo (avec filigrane), description complète, prix, localisation, informations fournisseur           |
| **À propos**            | Mission de la plateforme, valeurs, statistiques clés                                                         |
| **Contact**             | Formulaire de contact, coordonnées, carte Google Maps                                                        |

### 5.2 Pages fournisseur

| Page                     | Contenu                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Inscription**          | Formulaire complet + upload document obligatoire                                                                                |
| **Connexion**            | États dynamiques selon statut du compte                                                                                         |
| **Publier une annonce**  | Formulaire de création, upload photos, choix brouillon/publication                                                              |
| **Paramètres du profil** | Modification des infos personnelles, changement de mot de passe, mise à jour email/document avec avertissement de re-validation |

### 5.3 Panel d'administration

| Page                         | Accès                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------ |
| **Tableau de bord**          | Tous les rôles administratifs                                                  |
| **Notifications**            | Configurable par rôle                                                          |
| **Gestion des fournisseurs** | Configurable par rôle — Actions : Valider / Rejeter / Suspendre                |
| **Gestion des utilisateurs** | Configurable par rôle — Réinitialisation de mots de passe, création de comptes |
| **Gestion des catégories**   | Configurable par rôle — Ajouter / Modifier / Supprimer                         |
| **Modération des annonces**  | Configurable par rôle — Publier / Dépublier / Supprimer                        |
| **Gestion des permissions**  | **Super Admin uniquement** — Gestion des rôles et de leurs permissions         |

---

## 6. Système de rôles et permissions

### 6.1 Modèle

Le système utilise un modèle **RBAC** (Role-Based Access Control) complet. Les rôles et permissions sont stockés en base de données et entièrement configurables depuis l'interface d'administration.

### 6.2 Rôles par défaut

| Rôle        | Niveau d'accès | Modifiable |
| ----------- | -------------- | ---------- |
| Super Admin | Total          | ❌ Non     |
| Manager     | Étendu         | ✅ Oui     |
| Modérateur  | Limité         | ✅ Oui     |

Le Super Admin peut également créer des **rôles personnalisés** avec des noms et permissions sur mesure.

### 6.3 Permissions configurables

| Permission           | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `view:dashboard`     | Accès au tableau de bord                                     |
| `manage:providers`   | Valider / Rejeter / Suspendre des fournisseurs               |
| `manage:listings`    | Publier / Dépublier / Supprimer des annonces                 |
| `manage:categories`  | Ajouter / Modifier / Supprimer des catégories                |
| `manage:users`       | Consulter les utilisateurs / Réinitialiser les mots de passe |
| `manage:admins`      | Créer / Modifier / Désactiver des comptes administrateurs    |
| `view:notifications` | Consulter les notifications de la plateforme                 |
| `manage:permissions` | Gérer les rôles et permissions (**Super Admin uniquement**)  |

### 6.4 Règles de gestion

- **Suppression de rôle** : Tous les utilisateurs possédant ce rôle sont automatiquement **suspendus**.
- **Règle d'escalade** : Un manager ne peut attribuer des permissions que jusqu'à son propre niveau d'accès.
- **Modifications en temps réel** : Tout changement de permission est appliqué immédiatement à tous les utilisateurs du rôle concerné.
- **Intégrité Super Admin** : Compte unique, non supprimable, non restreignable.

---

## 7. Gestion des médias

### 7.1 Flux de traitement des images

```
Fournisseur sélectionne des photos
        ↓
[CÔTÉ NAVIGATEUR] Compression automatique
  → Format WebP / Max 800 Ko / Max 1920px de largeur
        ↓
Upload vers le serveur
        ↓
[CÔTÉ SERVEUR] Application du filigrane "immo_lamis"
        ↓
Sauvegarde de l'image traitée
        ↓
Affichage aux visiteurs
```

### 7.2 Règles strictes

| Règle                | Valeur                                                             |
| -------------------- | ------------------------------------------------------------------ |
| Format de sortie     | WebP uniquement                                                    |
| Taille maximale      | 800 Ko par image                                                   |
| Dimensions maximales | 1920px de largeur                                                  |
| Image originale      | **Jamais stockée** — seule la version avec filigrane est conservée |
| Couche de stockage   | Abstraite via un module dédié (évolutif vers le cloud)             |

---

## 8. Sécurité et authentification

| Composant                        | Technologie / Méthode                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| Hachage des mots de passe        | BCrypt                                                              |
| Mécanisme d'authentification     | JWT (JSON Web Token)                                                |
| Protection des routes            | Guards côté serveur + vérification des permissions                  |
| Réinitialisation de mot de passe | Manuelle par l'administrateur (pas d'envoi d'email)                 |
| Règle de privilège               | Impossibilité d'attribuer plus de permissions que son propre niveau |
| Super Admin                      | Compte unique, accès total, non supprimable                         |

---

## 9. Stack technique

| Couche                  | Technologie                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| Frontend                | React.js + React Router                                           |
| Backend                 | NestJS                                                            |
| Base de données         | PostgreSQL                                                        |
| ORM                     | Prisma                                                            |
| Authentification        | JWT + BCrypt                                                      |
| Gestion des permissions | CASL (intégration NestJS)                                         |
| Upload de fichiers      | Multer                                                            |
| Traitement d'images     | Sharp (filigrane côté serveur)                                    |
| Compression d'images    | browser-image-compression (côté navigateur)                       |
| Format d'image          | WebP                                                              |
| Cartographie            | Google Maps API                                                   |
| Notifications           | Polling (intervalle de 10 secondes)                               |
| Stockage                | Local → module StorageService (évolutif vers Cloudinary / AWS S3) |

---

## 10. Fonctionnalités hors périmètre

Les fonctionnalités suivantes sont **explicitement exclues** de cette version du projet. Leur ajout futur nécessitera un avenant au présent cahier des charges.

| #     | Fonctionnalité exclue                                   |
| ----- | ------------------------------------------------------- |
| HP-01 | Application mobile (iOS / Android)                      |
| HP-02 | Notifications par email (inscription, validation, etc.) |
| HP-03 | Système de paiement ou de réservation en ligne          |
| HP-04 | Messagerie / chat entre visiteur et fournisseur         |
| HP-05 | Réinitialisation de mot de passe par email              |
| HP-06 | Notifications en temps réel (WebSocket)                 |

---

## 11. Planning prévisionnel

| Semaine       | Phase                   | Objectif                                                                      |
| ------------- | ----------------------- | ----------------------------------------------------------------------------- |
| **Semaine 1** | Fondation & Sécurité    | Infrastructure, base de données, système d'authentification et RBAC           |
| **Semaine 2** | Fournisseur & Médias    | Inscription fournisseur, upload de documents, pipeline de traitement d'images |
| **Semaine 3** | Panel d'administration  | Tableau de bord, modération, gestion des fournisseurs et utilisateurs         |
| **Semaine 4** | Interface visiteur      | Pages publiques, moteur de recherche, filtres, détail d'annonce               |
| **Semaine 5** | Corrections & Finitions | Tests, corrections de bugs, raffinement de l'interface                        |
| **Semaine 6** | Déploiement             | Mise en production, tests finaux, livraison                                   |

**Durée totale estimée : 6 semaines**

> ⚠️ Ce planning est indicatif. Des ajustements pourront être apportés en cours de réalisation en accord avec les deux parties.

---

## 12. Conditions générales

### 12.1 Livrables

Le prestataire s'engage à livrer :

- Le code source complet du projet (frontend + backend)
- La base de données configurée et opérationnelle
- Le compte Super Admin initial
- La documentation technique de déploiement

### 12.2 Obligations du client

Le client s'engage à :

- Fournir les contenus textuels nécessaires (pages À propos, Contact, etc.)
- Fournir le logo et les éléments graphiques pour le filigrane
- Assurer la disponibilité pour les phases de validation et recette
- Fournir un retour dans un délai raisonnable lors des phases de validation

### 12.3 Propriété intellectuelle

Le code source sera la propriété du client à la livraison finale et au paiement intégral de la prestation.

### 12.4 Garantie

Le prestataire assure une période de garantie de \***\*\_\_** jours/mois\*\* après la livraison pour la correction de bugs liés aux fonctionnalités décrites dans ce document.

### 12.5 Modifications et avenants

Toute demande de modification, ajout de fonctionnalité, ou changement de périmètre non prévu dans ce document fera l'objet d'un **avenant signé par les deux parties**, accompagné d'une estimation de coût et de délai supplémentaires.

---

## 13. Validation et signatures

Le présent Cahier des Charges est approuvé par les deux parties ci-dessous. La signature de ce document vaut acceptation de l'ensemble des spécifications fonctionnelles, techniques et des conditions décrites.

---

### Pour le Prestataire

|                   |                                              |
| ----------------- | -------------------------------------------- |
| **Nom et prénom** | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Fonction**      | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Date**          | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Signature**     |                                              |
|                   |                                              |
|                   |                                              |
|                   | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |

---

### Pour le Client

|                   |                                              |
| ----------------- | -------------------------------------------- |
| **Nom et prénom** | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Fonction**      | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Date**          | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |
| **Signature**     |                                              |
|                   |                                              |
|                   |                                              |
|                   | **\*\***\*\***\*\***\_\_**\*\***\*\***\*\*** |

---

> **Mention obligatoire :** _"Lu et approuvé"_

---

_Document généré le 21 Avril 2026 — Version 5.1_
_Projet immo_lamis — Tous droits réservés_
