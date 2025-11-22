# 🚨 Solution Rapide : Site inaccessible pour les autres utilisateurs

## ⚡ Solution Express (5 minutes)

### Sur votre VPS, exécutez ces commandes une par une :

```bash
cd /var/www/lossombras

# 1. Vérifier que les services utilisent /api
grep -r "localhost:8000" frontend/src/app/core/services/ || echo "✅ Pas de localhost trouvé"

# 2. Si Git : pull les modifications
git pull

# 3. Rebuild le frontend (CRITIQUE !)
cd frontend
npm install --legacy-peer-deps
ng build --configuration production
cd ..

# 4. Mettre à jour la config Nginx
sudo cp nginx-config.conf /etc/nginx/sites-available/lossombras
sudo nginx -t
sudo systemctl reload nginx

# 5. Vider le cache Symfony
cd backend
php bin/console cache:clear --env=prod
cd ..

# 6. Permissions
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras

# 7. Redémarrer PHP-FPM
sudo systemctl restart php8.2-fpm
# OU si PHP 8.4:
# sudo systemctl restart php8.4-fpm
```

---

## 🔍 Vérifications importantes

### 1. Vérifier que l'API répond

```bash
# Sur votre VPS
curl http://localhost/api/login

# Ou depuis un autre ordinateur (remplacez par votre IP/domaine)
curl http://VOTRE_IP/api/login
```

Si vous obtenez une erreur, vérifiez :

```bash
# Vérifier que PHP-FPM est actif
sudo systemctl status php8.2-fpm

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/lossombras-error.log

# Vérifier les logs Symfony
sudo tail -f /var/www/lossombras/backend/var/log/prod.log
```

### 2. Vérifier que le frontend est bien buildé

```bash
ls -la /var/www/lossombras/frontend/dist/frontend/browser/
```

Il devrait y avoir des fichiers `*.js`, `*.css`, `index.html`, etc.

### 3. Vérifier la configuration Nginx

```bash
sudo nginx -t
```

Si erreur, vérifiez :
- Le socket PHP-FPM : `ls -la /var/run/php/`
- Le chemin du backend : `/var/www/lossombras/backend/public`

### 4. Vérifier les CORS dans le backend

```bash
cat /var/www/lossombras/backend/config/packages/nelmio_cors.yaml
```

Doit contenir :
```yaml
allow_origin: ['*']
```

---

## 🐛 Problèmes courants

### Problème 1 : Erreur 502 Bad Gateway

```bash
# Vérifier PHP-FPM
sudo systemctl status php8.2-fpm
sudo systemctl restart php8.2-fpm

# Vérifier le socket
ls -la /var/run/php/php8.2-fpm.sock
```

### Problème 2 : Erreur CORS dans la console du navigateur

Vérifier que `nelmio_cors.yaml` contient `allow_origin: ['*']`

### Problème 3 : Le frontend ne se charge pas

```bash
# Vérifier que le build est complet
ls -la /var/www/lossombras/frontend/dist/frontend/browser/

# Rebuild si nécessaire
cd /var/www/lossombras/frontend
ng build --configuration production
```

### Problème 4 : Cache du navigateur

Les utilisateurs doivent vider le cache :
- **Chrome/Edge** : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
- **Firefox** : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
- **Safari** : `Cmd+Option+R` (Mac)

Ou ajouter un paramètre de version dans l'URL (ex: `?v=2`)

---

## ✅ Checklist finale

- [ ] Frontend rebuildé avec `/api` (pas `localhost:8000`)
- [ ] Config Nginx mise à jour
- [ ] PHP-FPM actif
- [ ] Nginx rechargé
- [ ] Permissions correctes
- [ ] CORS configuré (`allow_origin: ['*']`)
- [ ] Build complet dans `dist/frontend/browser/`
- [ ] Test de l'API : `curl http://localhost/api/login`

---

## 🚀 Script automatique

J'ai créé un script qui fait tout automatiquement :

```bash
cd /var/www/lossombras
chmod +x mise_a_jour_rapide.sh
./mise_a_jour_rapide.sh
```

