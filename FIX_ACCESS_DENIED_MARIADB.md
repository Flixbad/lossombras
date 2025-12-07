# 🔐 Solution pour ERROR 1045 - Access denied

## Solution rapide : Se connecter en root et corriger les permissions

### Étape 1 : Se connecter en root (sans mot de passe)

```bash
sudo mysql
```

Cela devrait vous connecter directement sans demander de mot de passe.

### Étape 2 : Une fois connecté, vérifier l'utilisateur

```sql
SELECT User, Host FROM mysql.user WHERE User = 'los_sombras_user';
```

### Étape 3 : Réinitialiser le mot de passe de l'utilisateur

```sql
-- Méthode 1 : Changer le mot de passe
ALTER USER 'los_sombras_user'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';

-- Ou créer l'utilisateur s'il n'existe pas
CREATE USER IF NOT EXISTS 'los_sombras_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
```

**Important :** Remplacez `'nouveau_mot_de_passe'` et `los_sombras` par vos valeurs réelles !

### Étape 4 : Donner tous les privilèges

```sql
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
```

### Étape 5 : Vérifier que ça fonctionne

```sql
SELECT User, Host, authentication_string FROM mysql.user WHERE User = 'los_sombras_user';
```

Puis quittez :
```sql
exit;
```

### Étape 6 : Tester la connexion avec le nouveau mot de passe

```bash
mysql -u los_sombras_user -p
# Entrez le nouveau mot de passe
```

### Étape 7 : Mettre à jour le fichier .env si nécessaire

Si vous avez changé le mot de passe, mettez à jour votre `.env` :

```bash
cd /var/www/lossombras/backend
nano .env
```

Modifiez la ligne `DATABASE_URL` avec le nouveau mot de passe.

---

## Solution alternative : Utiliser root directement

Si vous ne voulez pas modifier l'utilisateur, vous pouvez modifier temporairement le `.env` pour utiliser root :

```bash
cd /var/www/html/los-sombras/backend
nano .env
```

Changez :
```
DATABASE_URL="mysql://los_sombras_user:ancien_mot_de_passe@127.0.0.1:3306/los_sombras?serverVersion=8.0.31&charset=utf8mb4"
```

En :
```
DATABASE_URL="mysql://root:@127.0.0.1:3306/los_sombras?serverVersion=8.0.31&charset=utf8mb4"
```

Puis exécutez les migrations avec `sudo` :

```bash
cd /var/www/lossombras/backend
sudo php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Script automatique pour tout corriger

```bash
sudo mysql <<EOF
-- Créer l'utilisateur s'il n'existe pas ou réinitialiser le mot de passe
CREATE USER IF NOT EXISTS 'los_sombras_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;

-- Marquer la migration comme exécutée
USE los_sombras;
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);
SELECT 'Migration marquée comme exécutée' AS Status;
EOF
```

**N'oubliez pas de remplacer `'votre_mot_de_passe'` et `los_sombras` par vos vraies valeurs !**

---

## Trouver le nom de la base de données

```bash
cd /var/www/html/los-sombras/backend
grep DATABASE_URL .env | sed 's/.*@[^/]*\/\([^?]*\).*/\1/'
```

