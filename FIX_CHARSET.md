# Correction de l'erreur "Unknown character set"

## Problème
```
SQLSTATE[HY000] [2019] Unknown character set
```

## Cause
Le paramètre `charset=utf8mb4` dans la `DATABASE_URL` n'est pas reconnu ou mal formaté. Cela peut être dû à :
1. Une syntaxe incorrecte dans la `DATABASE_URL`
2. Un caractère spécial mal échappé
3. Un problème avec les paramètres de la chaîne de connexion

## Solution rapide

### Option 1 : Script automatique (RECOMMANDÉ)
```bash
cd /var/www/lossombras
git pull
chmod +x CORRIGER_CHARSET.sh
cd backend
../CORRIGER_CHARSET.sh
```

Le script va :
1. Détecter la configuration actuelle
2. Extraire les composants de la `DATABASE_URL`
3. Détecter la version de MariaDB
4. Construire une nouvelle `DATABASE_URL` avec la syntaxe correcte
5. Tester la connexion avec différentes variantes
6. Mettre à jour `.env.local` avec la version qui fonctionne

---

### Option 2 : Correction manuelle

#### 1. Sauvegarder `.env.local`
```bash
cd /var/www/lossombras/backend
cp .env.local .env.local.backup
```

#### 2. Éditer `.env.local`
```bash
nano .env.local
```

#### 3. Remplacer la ligne `DATABASE_URL`

**Format simplifié (SANS charset) :**
```env
DATABASE_URL="mysql://los_sombras_user:PASSWORD@127.0.0.1:3306/los_sombras?serverVersion=8.0.32"
```

**OU avec charset (si nécessaire) :**
```env
DATABASE_URL="mysql://los_sombras_user:PASSWORD@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

**Important :**
- Pas d'espace après `=`
- Utilisez des guillemets doubles `"`
- Pas de caractères spéciaux dans le mot de passe (ou échappez-les avec `%`)

#### 4. Si le mot de passe contient des caractères spéciaux
Les caractères spéciaux doivent être encodés en URL :
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`
- ` ` (espace) → `%20`

**Exemple :**
```env
# Mot de passe : mon@pass#123
DATABASE_URL="mysql://user:mon%40pass%23123@127.0.0.1:3306/los_sombras?serverVersion=8.0.32"
```

#### 5. Tester la connexion
```bash
php bin/console doctrine:query:sql "SELECT 1"
```

---

## Vérifier la version de MariaDB
```bash
mysql -u los_sombras_user -p -e "SELECT VERSION();"
```

Utilisez la version détectée dans `serverVersion` (ex: `8.0.32`, `10.11.0`, etc.).

---

## Format correct de DATABASE_URL

### Structure de base
```
mysql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

### Paramètres disponibles
- `serverVersion=X.X.X` : Version de MariaDB/MySQL (ex: `8.0.32`)
- `charset=utf8mb4` : Encodage des caractères (optionnel, utf8mb4 par défaut)
- `sslmode=require` : SSL (si nécessaire)

### Exemples

**Simple (recommandé) :**
```env
DATABASE_URL="mysql://los_sombras_user:mypassword@127.0.0.1:3306/los_sombras?serverVersion=8.0.32"
```

**Avec charset :**
```env
DATABASE_URL="mysql://los_sombras_user:mypassword@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

**Avec mot de passe contenant des caractères spéciaux :**
```env
# Mot de passe : p@ss#w0rd
DATABASE_URL="mysql://los_sombras_user:p%40ss%23w0rd@127.0.0.1:3306/los_sombras?serverVersion=8.0.32"
```

---

## Test rapide
```bash
cd /var/www/lossombras/backend

# Tester avec Doctrine
php bin/console doctrine:query:sql "SELECT 1"

# Si ça fonctionne, vous devriez voir :
# [OK] 1
```

---

## Si le problème persiste

1. **Vérifier les logs PHP :**
```bash
tail -f /var/log/php8.4-fpm.log
```

2. **Vérifier les logs MariaDB :**
```bash
sudo tail -f /var/log/mysql/error.log
```

3. **Tester la connexion directement avec MySQL :**
```bash
mysql -u los_sombras_user -p los_sombras
```

4. **Vérifier que la base existe et que l'utilisateur a les droits :**
```bash
sudo mysql -u root -p
```

```sql
SHOW DATABASES;
SHOW GRANTS FOR 'los_sombras_user'@'localhost';
```

5. **Vérifier la configuration Doctrine :**
```bash
php bin/console debug:container doctrine
```

