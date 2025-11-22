# 🔧 Fix : Problème de connexion/inscription (API ne répond pas)

## ⚡ Solution Express

Sur votre VPS, exécutez ces commandes :

```bash
cd /var/www/lossombras

# 1. Récupérer les modifications
git pull

# 2. Tester l'API
chmod +x tester_api.sh
./tester_api.sh

# 3. Mettre à jour la config Nginx
sudo cp nginx-config.conf /etc/nginx/sites-available/lossombras

# 4. Vérifier la version PHP et ajuster si nécessaire
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "Version PHP : $PHP_VERSION"

# Si vous utilisez PHP 8.4, le config est déjà bonne
# Sinon, éditer la config Nginx pour mettre la bonne version :
sudo nano /etc/nginx/sites-available/lossombras
# Chercher : fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
# Remplacer par votre version (ex: php8.2-fpm.sock)

# 5. Tester la config
sudo nginx -t

# 6. Recharger Nginx
sudo systemctl reload nginx

# 7. Redémarrer PHP-FPM
sudo systemctl restart php${PHP_VERSION}-fpm
```

---

## 🔍 Vérifications importantes

### 1. Vérifier que PHP-FPM est actif

```bash
# Voir la version PHP
php -v

# Vérifier que PHP-FPM est actif (remplacez 8.4 par votre version)
sudo systemctl status php8.4-fpm

# Si inactif, démarrer :
sudo systemctl start php8.4-fpm
sudo systemctl enable php8.4-fpm
```

### 2. Vérifier que le socket PHP-FPM existe

```bash
# Voir tous les sockets disponibles
ls -la /var/run/php/

# Vous devriez voir quelque chose comme :
# php8.4-fpm.sock
# ou
# php8.2-fpm.sock
```

### 3. Vérifier que la config Nginx utilise le bon socket

```bash
# Voir la config actuelle
sudo cat /etc/nginx/sites-available/lossombras | grep fastcgi_pass

# Doit correspondre au socket disponible (voir étape 2)
```

### 4. Tester l'API directement

```bash
# Test de /api/login (doit retourner 401, ce qui signifie que l'API fonctionne)
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Test de /api/register (doit retourner 201 ou 400)
curl -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Si vous obtenez une erreur `502 Bad Gateway` ou `500 Internal Server Error`, c'est que PHP-FPM ne répond pas.

---

## 🐛 Dépannage par erreur

### Erreur 502 Bad Gateway

**Cause :** PHP-FPM n'est pas actif ou le socket n'existe pas.

**Solution :**
```bash
# Vérifier PHP-FPM
sudo systemctl status php8.4-fpm

# Démarrer si nécessaire
sudo systemctl start php8.4-fpm

# Vérifier le socket
ls -la /var/run/php/php8.4-fpm.sock

# Si le socket n'existe pas, vérifier la config PHP-FPM
sudo nano /etc/php/8.4/fpm/pool.d/www.conf
# Chercher : listen = /run/php/php8.4-fpm.sock
# OU listen = /var/run/php/php8.4-fpm.sock
```

### Erreur 500 Internal Server Error

**Cause :** Erreur PHP dans Symfony ou problème de permissions.

**Solution :**
```bash
# Voir les logs PHP-FPM
sudo tail -f /var/log/php8.4-fpm.log

# Voir les logs Symfony
sudo tail -f /var/www/lossombras/backend/var/log/prod.log

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
sudo chmod -R 775 /var/www/lossombras/backend/var
```

### Erreur 404 Not Found

**Cause :** Nginx ne route pas correctement vers Symfony.

**Solution :**
```bash
# Vérifier la config Nginx
sudo nginx -t

# Vérifier que le routing Symfony est correct
cd /var/www/lossombras/backend
php bin/console router:match /api/login
```

### L'API ne répond pas du tout (timeout)

**Cause :** PHP-FPM bloqué ou timeout.

**Solution :**
```bash
# Redémarrer PHP-FPM
sudo systemctl restart php8.4-fpm

# Vérifier les processus PHP-FPM
ps aux | grep php-fpm

# Augmenter le timeout dans Nginx si nécessaire
sudo nano /etc/nginx/sites-available/lossombras
# Chercher : fastcgi_read_timeout 300;
# Augmenter à 600 si nécessaire
```

---

## ✅ Checklist de diagnostic

Utilisez le script automatique :

```bash
cd /var/www/lossombras
chmod +x tester_api.sh
./tester_api.sh
```

Le script vérifie automatiquement :
- [ ] L'API répond
- [ ] PHP-FPM est actif
- [ ] Le socket existe
- [ ] Les permissions sont correctes
- [ ] La base de données est accessible

---

## 🚀 Solution complète en une commande

```bash
cd /var/www/lossombras && \
git pull && \
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;") && \
sudo cp nginx-config.conf /etc/nginx/sites-available/lossombras && \
sudo sed -i "s/php8.4-fpm.sock/php${PHP_VERSION}-fpm.sock/g" /etc/nginx/sites-available/lossombras && \
sudo nginx -t && \
sudo systemctl reload nginx && \
sudo systemctl restart php${PHP_VERSION}-fpm && \
echo "✅ Configuration mise à jour pour PHP $PHP_VERSION"
```

