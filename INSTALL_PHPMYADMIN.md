# 📊 Installation et accès à phpMyAdmin

## Vérifier si phpMyAdmin est déjà installé

```bash
# Vérifier si phpMyAdmin est installé
dpkg -l | grep phpmyadmin

# Vérifier si le répertoire existe
ls -la /usr/share/phpmyadmin
```

---

## Installation de phpMyAdmin (si non installé)

### Étape 1 : Installer phpMyAdmin

```bash
sudo apt update
sudo apt install phpmyadmin php-mbstring php-zip php-gd php-json php-curl
```

Pendant l'installation :
- **Serveur web** : Sélectionnez `apache2` ou `nginx` (selon votre serveur)
- **Configuration de la base de données** : Sélectionnez `Yes` pour configurer automatiquement
- **Mot de passe** : Entrez un mot de passe pour l'utilisateur `phpmyadmin` (ou laissez vide)

### Étape 2 : Configurer PHP pour phpMyAdmin (si Apache)

```bash
sudo phpenmod mbstring
sudo systemctl restart apache2
```

### Étape 3 : Créer un lien symbolique pour nginx

Si vous utilisez nginx :

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

---

## Accéder à phpMyAdmin

### Option 1 : Via sous-domaine ou chemin

**Si Apache :**
```
http://votre-domaine.com/phpmyadmin
```

**Si nginx (après avoir créé le lien) :**
```
http://votre-domaine.com/phpmyadmin
```

**Ou avec IP :**
```
http://VOTRE_IP/phpmyadmin
```

### Option 2 : Via configuration nginx dédiée (RECOMMANDÉ)

Créez un fichier de configuration nginx :

```bash
sudo nano /etc/nginx/sites-available/phpmyadmin
```

Ajoutez :

```nginx
server {
    listen 80;
    server_name phpmyadmin.votre-domaine.com;  # ou votre IP

    root /usr/share/phpmyadmin;
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;  # Ajustez la version de PHP
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Sécuriser phpMyAdmin

### Méthode 1 : Protéger avec .htaccess (Apache)

```bash
sudo nano /etc/phpmyadmin/apache.conf
```

Ajoutez après la ligne `<Directory /usr/share/phpmyadmin>` :

```apache
<Directory /usr/share/phpmyadmin>
    Options FollowSymLinks
    DirectoryIndex index.php
    AllowOverride All
    Require all granted
</Directory>
```

Puis créez un fichier `.htaccess` :

```bash
sudo nano /usr/share/phpmyadmin/.htaccess
```

Ajoutez :

```apache
AuthType Basic
AuthName "Restricted Access"
AuthUserFile /etc/phpmyadmin/.htpasswd
Require valid-user
```

Créez le fichier de mot de passe :

```bash
sudo htpasswd -c /etc/phpmyadmin/.htpasswd admin
```

### Méthode 2 : Restreindre par IP (nginx)

Dans votre configuration nginx, ajoutez :

```nginx
location /phpmyadmin {
    allow VOTRE_IP;
    deny all;
    # ... reste de la config
}
```

---

## Connexion à phpMyAdmin

1. Accédez à `http://votre-domaine.com/phpmyadmin` (ou votre IP)
2. **Utilisateur** : `root` ou `los_sombras_user` ou `phpmyadmin`
3. **Mot de passe** : Le mot de passe que vous avez configuré

---

## Utiliser phpMyAdmin pour marquer la migration

Une fois connecté :

1. Cliquez sur la base de données `los_sombras` (ou votre base)
2. Allez dans l'onglet **SQL**
3. Exécutez cette commande :

```sql
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251122000824', NOW(), 0);
```

4. Cliquez sur **Exécuter**

---

## Alternative simple : Utiliser un tunnel SSH

Si vous ne voulez pas exposer phpMyAdmin sur Internet, créez un tunnel SSH :

```bash
# Depuis votre machine locale
ssh -L 8888:localhost:80 root@VOTRE_IP_VPS
```

Puis accédez à `http://localhost:8888/phpmyadmin` dans votre navigateur local.

---

## Dépannage

### Erreur 404 Not Found

Vérifiez que le lien symbolique existe :
```bash
ls -la /var/www/html/ | grep phpmyadmin
```

### Erreur "The mbstring extension is missing"

```bash
sudo apt install php-mbstring
sudo phpenmod mbstring
sudo systemctl restart apache2  # ou php8.1-fpm pour nginx
```

### Vérifier la configuration PHP

```bash
php -m | grep mbstring
```

