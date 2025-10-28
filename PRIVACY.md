# Politique de Confidentialité - KOK Thérapie Sensorimotrice

**Dernière mise à jour**: 15 janvier 2025

## 1. Introduction

La présente Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679).

## 2. Responsable du traitement

**Nom**: Thérapie Sensorimotrice KOK  
**Email**: admin@therapie-sensorimotrice.fr  
**Adresse**: [À compléter]

## 3. Données collectées

### 3.1 Données obligatoires
- Email (identifiant de connexion)
- Mot de passe (stocké sous forme hashée)

### 3.2 Données facultatives
- Prénom et nom
- Numéro de téléphone
- Motif du rendez-vous (texte libre)

### 3.3 Données techniques
- Adresse IP (logs d'accès, conservés 14 jours)
- Logs d'actions administratives (audit trail, conservés 14 jours)
- Cookies de session

## 4. Finalités du traitement

Vos données sont collectées pour :
- Créer et gérer votre compte patient
- Permettre la prise de rendez-vous
- Envoyer des notifications (confirmation, rappels)
- Assurer la sécurité de la plateforme
- Respecter nos obligations légales

## 5. Base légale

Le traitement de vos données repose sur :
- **Consentement** (article 6.1.a RGPD) : inscription volontaire
- **Exécution du contrat** (article 6.1.b RGPD) : gestion des rendez-vous
- **Intérêt légitime** (article 6.1.f RGPD) : sécurité et prévention de la fraude

## 6. Destinataires des données

Vos données sont accessibles uniquement par :
- Vous-même (votre compte)
- L'administrateur du cabinet (thérapeute)
- Les prestataires techniques (hébergement, email)

Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.

## 7. Durée de conservation

| Type de données | Durée de conservation |
|----------------|----------------------|
| Compte actif | Tant que le compte existe |
| Compte supprimé | Anonymisation immédiate |
| Rendez-vous passés | 1 an après le rendez-vous |
| Logs d'accès | 14 jours maximum |
| Logs d'audit | 14 jours maximum |

## 8. Vos droits RGPD

Conformément au RGPD, vous disposez des droits suivants :

### 8.1 Droit d'accès (article 15)
Vous pouvez demander une copie de vos données.  
**Action** : Connectez-vous et cliquez sur "Exporter mes données" dans votre profil.

### 8.2 Droit de rectification (article 16)
Vous pouvez modifier vos informations personnelles.  
**Action** : Connectez-vous et modifiez votre profil.

### 8.3 Droit à l'effacement (article 17)
Vous pouvez demander la suppression de votre compte.  
**Action** : Connectez-vous et cliquez sur "Supprimer mon compte" dans votre profil.  
**Effet** : Anonymisation immédiate de vos données (email remplacé par `deleted_xxx@deleted.local`).

### 8.4 Droit à la portabilité (article 20)
Vous pouvez récupérer vos données dans un format lisible (JSON).  
**Action** : Utilisez la fonction "Exporter mes données".

### 8.5 Droit d'opposition (article 21)
Vous pouvez vous opposer au traitement de vos données.  
**Action** : Contactez-nous à admin@therapie-sensorimotrice.fr.

### 8.6 Droit de limitation (article 18)
Vous pouvez demander la limitation du traitement.  
**Action** : Contactez-nous à admin@therapie-sensorimotrice.fr.

### 8.7 Droit de réclamation
Vous pouvez déposer une plainte auprès de la CNIL :  
**CNIL** : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07  
**Web** : https://www.cnil.fr/

## 9. Sécurité des données

Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :

### 9.1 Mesures techniques
- Mots de passe hashés avec bcrypt (cost factor 12)
- Chiffrement des communications (HTTPS/TLS en production)
- Tokens JWT avec expiration
- Rate limiting anti brute-force
- Validation stricte des entrées
- Sauvegardes régulières chiffrées

### 9.2 Mesures organisationnelles
- Accès limité aux données (principe du moindre privilège)
- Logs d'audit pour traçabilité
- Procédures de gestion des incidents
- Formation du personnel à la sécurité

## 10. Transfert de données

### 10.1 Hébergement
Nos serveurs sont hébergés au sein de l'Union Européenne.

### 10.2 Sous-traitants
| Prestataire | Service | Localisation |
|------------|---------|--------------|
| [Hébergeur] | Hébergement | UE |
| [Email] | Envoi d'emails | UE |

Tous nos sous-traitants sont conformes au RGPD et ont signé des accords de traitement des données (DPA).

## 11. Cookies

Nous utilisons uniquement des cookies essentiels :
- **Session** : Token JWT pour authentification (stocké en localStorage)
- **Préférences** : Paramètres de l'interface

Aucun cookie de tracking ou publicitaire n'est utilisé.

## 12. Mineurs

Notre service est réservé aux personnes de 18 ans et plus. Si vous avez moins de 18 ans, veuillez demander à un représentant légal de créer un compte pour vous.

## 13. Modifications

Nous nous réservons le droit de modifier cette Politique de Confidentialité. En cas de changement majeur, nous vous en informerons par email.

## 14. Contact

Pour toute question relative à vos données personnelles :

**Email** : admin@therapie-sensorimotrice.fr  
**Délai de réponse** : 30 jours maximum (article 12.3 RGPD)

## 15. Détails techniques (pour transparence)

### 15.1 Algorithmes de chiffrement
- Mots de passe : bcrypt avec salt aléatoire (cost factor 12)
- Communications : TLS 1.3 (production)
- JWT : HS256 (HMAC with SHA-256)

### 15.2 Anonymisation lors de la suppression
Lors de la suppression de compte, les données sont anonymisées :
```
Email : remplacé par "deleted_<uuid>@deleted.local"
Prénom : "Supprimé"
Nom : "Supprimé"
Téléphone : NULL
Compte : is_active = false
```

Les rendez-vous passés sont conservés de manière anonyme pour des raisons statistiques (durée : 1 an).

### 15.3 Nettoyage automatique
Un script automatique supprime :
- Les logs d'accès de plus de 14 jours
- Les logs d'audit de plus de 14 jours
- Les rendez-vous annulés de plus de 1 an

## 16. Clause de consentement

En créant un compte, vous acceptez :
- La présente Politique de Confidentialité
- Nos Conditions Générales d'Utilisation
- Le traitement de vos données selon les finalités décrites

Vous pouvez retirer votre consentement à tout moment en supprimant votre compte.

---

**Version** : 1.0  
**Date d'entrée en vigueur** : 15 janvier 2025
