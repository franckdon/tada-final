# API de Gestion des Utilisateurs

Cette API permet aux administrateurs système de gérer les comptes utilisateurs (contributeurs, clients, admin systèmes) sur la plateforme.

## Endpoints

### 1. Lister les utilisateurs

**GET** `/api/users`

Récupère la liste de tous les utilisateurs avec pagination et filtres.

#### Paramètres de requête (Query Parameters)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | number | Non | Numéro de la page (défaut: 1) |
| `limit` | number | Non | Nombre d'éléments par page (défaut: 10) |
| `role` | string | Non | Filtrer par rôle (`contributor`, `client`, `admin`) |
| `search` | string | Non | Rechercher dans email et nom |
| `banned` | boolean | Non | Filtrer par statut banni |
| `kyc_status` | string | Non | Filtrer par statut KYC (`in_progress`, `completed`, `canceled`) |

#### Exemple de requête

```bash
GET /api/users?page=1&limit=20&role=contributor&search=john
```

#### Réponse (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "contributor",
      "position": "Developer",
      "country": "France",
      "sector": "Technology",
      "image": "https://...",
      "kyc_status": "completed",
      "job": "Software Engineer",
      "location": "Paris",
      "banned": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "members": 2,
        "missionAssignments": 5,
        "surveyResponses": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 2. Créer un utilisateur

**POST** `/api/users`

Crée un nouveau compte utilisateur.

#### Corps de la requête (Body)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | string | Oui | Email de l'utilisateur (unique) |
| `name` | string | Oui | Nom complet de l'utilisateur |
| `role` | string | Non | Rôle (`contributor`, `client`, `admin`) - défaut: `contributor` |
| `position` | string | Non | Poste/fonction |
| `country` | string | Non | Pays |
| `sector` | string | Non | Secteur d'activité |
| `image` | string | Non | URL de l'image de profil |
| `kyc_status` | string | Non | Statut KYC |
| `job` | string | Non | Métier |
| `location` | string | Non | Localisation |
| `banned` | boolean | Non | Statut banni - défaut: `false` |

#### Exemple de requête

```bash
POST /api/users
Content-Type: application/json

{
  "email": "jane.smith@example.com",
  "name": "Jane Smith",
  "role": "contributor",
  "country": "France",
  "sector": "Marketing"
}
```

#### Réponse (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "role": "contributor",
    "position": null,
    "country": "France",
    "sector": "Marketing",
    "image": null,
    "kyc_status": null,
    "job": null,
    "location": null,
    "banned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

#### Erreurs possibles

- **400 Bad Request** : Données invalides
- **409 Conflict** : Email déjà utilisé

---

### 3. Récupérer un utilisateur

**GET** `/api/users/[id]`

Récupère les détails d'un utilisateur spécifique avec ses relations.

#### Paramètres d'URL

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | Oui | ID de l'utilisateur (UUID) |

#### Exemple de requête

```bash
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

#### Réponse (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "contributor",
    "position": "Developer",
    "country": "France",
    "sector": "Technology",
    "image": "https://...",
    "kyc_status": "completed",
    "job": "Software Engineer",
    "location": "Paris",
    "banned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "members": [
      {
        "id": "uuid",
        "role": "admin",
        "organization": {
          "id": "uuid",
          "name": "Organization Name",
          "slug": "org-slug"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "missionAssignments": [
      {
        "id": "uuid",
        "status": "in_progress",
        "progress": 50,
        "mission": {
          "id": "uuid",
          "name": "Mission Name",
          "status": "active"
        },
        "assignedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "_count": {
      "members": 2,
      "missionAssignments": 5,
      "surveyResponses": 10,
      "subDashboard": 3,
      "contributorData": 15
    }
  }
}
```

#### Erreurs possibles

- **400 Bad Request** : ID manquant
- **404 Not Found** : Utilisateur non trouvé

---

### 4. Modifier un utilisateur

**PATCH** `/api/users/[id]`

Met à jour les informations d'un utilisateur, y compris son rôle.

#### Paramètres d'URL

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | Oui | ID de l'utilisateur (UUID) |

#### Corps de la requête (Body)

Tous les champs sont optionnels. Seuls les champs fournis seront mis à jour.

| Champ | Type | Description |
|-------|------|-------------|
| `email` | string | Email de l'utilisateur |
| `name` | string | Nom complet |
| `role` | string | Rôle (`contributor`, `client`, `admin`) |
| `position` | string | Poste/fonction |
| `country` | string | Pays |
| `sector` | string | Secteur d'activité |
| `image` | string | URL de l'image de profil |
| `kyc_status` | string | Statut KYC |
| `job` | string | Métier |
| `location` | string | Localisation |
| `banned` | boolean | Statut banni |

#### Exemple de requête

```bash
PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "role": "admin",
  "position": "Senior Developer",
  "banned": false
}
```

#### Réponse (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "admin",
    "position": "Senior Developer",
    "country": "France",
    "sector": "Technology",
    "image": "https://...",
    "kyc_status": "completed",
    "job": "Software Engineer",
    "location": "Paris",
    "banned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### Erreurs possibles

- **400 Bad Request** : Données invalides
- **404 Not Found** : Utilisateur non trouvé
- **409 Conflict** : Email déjà utilisé par un autre utilisateur

---

### 5. Supprimer un utilisateur

**DELETE** `/api/users/[id]`

Supprime un compte utilisateur. Si l'utilisateur a des données associées (missions, réponses, etc.), il sera banni au lieu d'être supprimé.

#### Paramètres d'URL

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | Oui | ID de l'utilisateur (UUID) |

#### Exemple de requête

```bash
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
```

#### Réponse (200 OK) - Suppression réussie

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Réponse (200 OK) - Utilisateur banni au lieu de supprimé

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "banned": true
  },
  "message": "User has related data and has been banned instead of deleted",
  "warning": "User has been banned instead of deleted due to existing relationships"
}
```

#### Erreurs possibles

- **400 Bad Request** : ID manquant
- **404 Not Found** : Utilisateur non trouvé

---

## Rôles disponibles

| Rôle | Description |
|------|-------------|
| `contributor` | Contributeur - Participe aux missions et enquêtes |
| `client` | Client - Accès aux résultats et dashboards |
| `admin` | Administrateur système - Gestion complète de la plateforme |

## Statuts KYC disponibles

| Statut | Description |
|--------|-------------|
| `in_progress` | Vérification en cours |
| `completed` | Vérification complétée |
| `canceled` | Vérification annulée |

## Gestion des erreurs

Toutes les erreurs suivent le même format :

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "message": "Message détaillé (optionnel)",
  "errors": ["Liste des erreurs de validation (optionnel)"]
}
```

### Codes de statut HTTP

- **200 OK** : Requête réussie
- **201 Created** : Ressource créée avec succès
- **400 Bad Request** : Données invalides ou manquantes
- **404 Not Found** : Ressource non trouvée
- **409 Conflict** : Conflit (ex: email déjà utilisé)
- **500 Internal Server Error** : Erreur serveur

## Exemples d'utilisation

### Créer un contributeur

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contributor@example.com",
    "name": "New Contributor",
    "role": "contributor",
    "country": "France"
  }'
```

### Promouvoir un utilisateur en admin

```bash
curl -X PATCH http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Bannir un utilisateur

```bash
curl -X PATCH http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "banned": true
  }'
```

### Rechercher des utilisateurs

```bash
curl "http://localhost:3000/api/users?search=john&role=contributor&page=1&limit=20"
```

## Notes importantes

1. **Sécurité** : Ces endpoints doivent être protégés par une authentification appropriée (non implémentée dans cette version).
2. **Suppression intelligente** : Les utilisateurs avec des données associées sont automatiquement bannis au lieu d'être supprimés pour préserver l'intégrité des données.
3. **Validation** : Toutes les données sont validées avant traitement pour garantir la cohérence.
4. **Pagination** : La liste des utilisateurs est paginée pour optimiser les performances.
