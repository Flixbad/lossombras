# Corriger la configuration DATABASE_URL dans .env.local

## Configuration actuelle (INCORRECTE)
```
DATABASE_URL="mysql://dev:1234@127.0.01:8889/los-sombras?serverVersion=8.0.40&charset=utf8mb4"
```

## Configuration correcte pour MariaDB sur VPS
```
DATABASE_URL="mysql://los_sombras_user:VOTRE_MOT_DE_PASSE@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

## Remarques
- **User** : `los_sombras_user` (créé lors de l'installation MariaDB)
- **Password** : Le mot de passe que vous avez défini lors de la création de l'utilisateur
- **Host** : `127.0.0.1` (localhost)
- **Port** : `3306` (port par défaut de MariaDB)
- **Database** : `los_sombras` (avec underscore, pas de tiret)
- **Server Version** : `8.0.32` (ou la version de votre MariaDB)

## Pour corriger manuellement

### Sur votre VPS :
```bash
cd /var/www/lossombras/backend
nano .env.local
```

### Remplacer la ligne DATABASE_URL par :
```
DATABASE_URL="mysql://los_sombras_user:VOTRE_MOT_DE_PASSE@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"
```

### Si vous ne connaissez pas le mot de passe :
1. Se connecter à MariaDB en tant que root :
```bash
sudo mysql -u root -p
```

2. Vérifier l'utilisateur existant :
```sql
SELECT User, Host FROM mysql.user WHERE User = 'los_sombras_user';
```

3. Si l'utilisateur n'existe pas, le créer :
```sql
CREATE DATABASE los_sombras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'los_sombras_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Tester la connexion :
```bash
mysql -u los_sombras_user -p los_sombras
```

5. Vérifier la version de MariaDB :
```bash
mysql -u los_sombras_user -p -e "SELECT VERSION();"
```

### Après correction, tester :
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:query:sql "SELECT 1"
```

Si la commande fonctionne, la connexion est correcte !

