# 🔍 Guide de dépannage - Connexion MariaDB/MySQL

## Méthode 1 : Connexion avec mot de passe interactif

```bash
mysql -u root -p
```

Puis entrez le mot de passe quand il vous le demande.

## Méthode 2 : Connexion avec utilisateur spécifique

```bash
mysql -u VOTRE_USER -p
```

## Méthode 3 : Connexion directe avec nom de base

```bash
mysql -u root -p NOM_DE_LA_BASE
```

## Méthode 4 : Si vous êtes root sur le VPS

```bash
sudo mysql
# ou
sudo mysql -u root
```

## Vérifier que MariaDB/MySQL est démarré

```bash
sudo systemctl status mariadb
# ou
sudo systemctl status mysql
```

Si ce n'est pas démarré :
```bash
sudo systemctl start mariadb
# ou
sudo systemctl start mysql
```

## Trouver les identifiants dans le fichier .env

```bash
cd /var/www/html/los-sombras/backend
cat .env | grep DATABASE_URL
```

Le format est : `DATABASE_URL="mysql://user:password@localhost:3306/db_name"`

## Extraire les identifiants depuis .env

```bash
cd /var/www/html/los-sombras/backend
# Extraire l'utilisateur
grep DATABASE_URL .env | sed 's/.*mysql:\/\/\([^:]*\):.*/\1/'
# Extraire le mot de passe
grep DATABASE_URL .env | sed 's/.*mysql:\/\/[^:]*:\([^@]*\)@.*/\1/'
# Extraire le nom de la base
grep DATABASE_URL .env | sed 's/.*@[^/]*\/\([^?]*\).*/\1/'
```

## Script automatique pour extraire et utiliser les identifiants

```bash
cd /var/www/html/los-sombras/backend

# Extraire les informations
DB_URL=$(grep DATABASE_URL .env | cut -d '"' -f 2)
DB_USER=$(echo $DB_URL | sed 's/.*mysql:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DB_URL | sed 's/.*mysql:\/\/[^:]*:\([^@]*\)@.*/\1/')
DB_NAME=$(echo $DB_URL | sed 's/.*@[^/]*\/\([^?]*\).*/\1/')

echo "User: $DB_USER"
echo "Database: $DB_NAME"
echo "Password: $DB_PASS"

# Se connecter
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
```

## Si vous avez oublié le mot de passe root

```bash
sudo mysql -u root
```

Puis dans MySQL :
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
```

## Vérifier les utilisateurs existants

```bash
sudo mysql -e "SELECT User, Host FROM mysql.user;"
```

## Créer un nouvel utilisateur si nécessaire

```bash
sudo mysql
```

Puis :
```sql
CREATE USER 'nouvel_user'@'localhost' IDENTIFIED BY 'mot_de_passe';
GRANT ALL PRIVILEGES ON nom_base.* TO 'nouvel_user'@'localhost';
FLUSH PRIVILEGES;
```

