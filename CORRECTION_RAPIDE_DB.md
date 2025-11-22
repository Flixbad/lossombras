# Correction rapide : Erreur "Access denied to database 'lossombras'"

## Problème
```
SQLSTATE[HY000] [1044] Access denied for user 'los_sombras_user'@'localhost' to database 'lossombras'
```

## Cause
Le `.env.local` utilise probablement le nom de base `lossombras` (sans underscore), alors que la base s'appelle `los_sombras` (avec underscore), ou l'utilisateur n'a pas les droits.

## Solution rapide

### Option 1 : Script automatique (RECOMMANDÉ)
```bash
cd /var/www/lossombras
git pull
chmod +x VERIFIER_ET_CORRIGER_DB.sh
cd backend
../VERIFIER_ET_CORRIGER_DB.sh
```

Le script va :
1. Détecter la configuration actuelle
2. Lister les bases de données disponibles
3. Vérifier si la base existe
4. Créer la base si nécessaire
5. Vérifier et accorder les droits
6. Corriger `.env.local` si nécessaire
7. Tester la connexion

---

### Option 2 : Correction manuelle

#### 1. Vérifier quelle base existe
```bash
sudo mysql -u root -p
```

Dans MariaDB :
```sql
SHOW DATABASES;
-- Cherchez : los_sombras ou lossombras
```

#### 2. Si la base n'existe pas, la créer
```sql
CREATE DATABASE los_sombras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Vérifier l'utilisateur et ses droits
```sql
SHOW GRANTS FOR 'los_sombras_user'@'localhost';
```

#### 4. Si l'utilisateur n'a pas les droits, les accorder
```sql
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Corriger `.env.local`
```bash
cd /var/www/lossombras/backend
nano .env.local
```

**Remplacez la ligne `DATABASE_URL` :**

**AVANT (INCORRECT) :**
```env
DATABASE_URL="mysql://los_sombras_user:PASSWORD@127.0.0.1:3306/lossombras?serverVersion=8.0.32&charset=utf8mb4"
```

**APRÈS (CORRECT) :**
```env
DATABASE_URL="mysql://los_sombras_user:PASSWORD@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

**Important :** Utilisez `los_sombras` (avec underscore), pas `lossombras` (sans underscore).

#### 6. Tester la connexion
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:query:sql "SELECT 1"
```

---

## Si vous ne connaissez pas le mot de passe

### Option A : Créer un nouvel utilisateur
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE los_sombras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'los_sombras_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Puis mettez à jour `.env.local` avec le nouveau mot de passe.

### Option B : Utiliser root temporairement
```env
DATABASE_URL="mysql://root:ROOT_PASSWORD@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

⚠️ **Attention :** Utiliser root en production n'est pas recommandé. Créez un utilisateur dédié.

---

## Points à vérifier

1. ✅ Nom de la base : `los_sombras` (avec underscore)
2. ✅ Utilisateur : `los_sombras_user`
3. ✅ Host : `127.0.0.1`
4. ✅ Port : `3306`
5. ✅ Droits : `ALL PRIVILEGES` sur la base

---

## Tester la connexion directement
```bash
mysql -u los_sombras_user -p los_sombras
```

Si cette commande fonctionne, la base et l'utilisateur sont corrects. Le problème vient alors de `.env.local`.

