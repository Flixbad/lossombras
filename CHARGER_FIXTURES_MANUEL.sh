#!/bin/bash

set -e

echo "🚀 Chargement manuel des fixtures (sans bundle)"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  Ce script charge les fixtures directement via PHP sans utiliser le bundle${NC}"
echo ""
read -p "📝 Continuer ? [o/N] : " CONFIRM
CONFIRM=${CONFIRM:-N}

if [[ ! "$CONFIRM" =~ ^[oO]$ ]]; then
    echo -e "${YELLOW}⚠️  Opération annulée${NC}"
    exit 0
fi

echo ""

# Créer un script PHP temporaire pour charger les fixtures
TEMP_SCRIPT=$(mktemp /tmp/load_fixtures_XXXXXX.php)

cat > "$TEMP_SCRIPT" << 'EOF'
<?php

use Symfony\Component\Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';

if (!class_exists(Dotenv::class)) {
    throw new RuntimeException('Please run "composer require symfony/dotenv" to load the ".env" files.');
}

(new Dotenv())->bootEnv(__DIR__ . '/.env');

$kernel = new App\Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? false));
$kernel->boot();

$container = $kernel->getContainer();
$entityManager = $container->get('doctrine.orm.entity_manager');
$passwordHasher = $container->get('security.user_password_hasher');

// Charger les fixtures
$fixtures = require __DIR__ . '/src/DataFixtures/AppFixtures.php';

// Créer les articles
$articlesData = [
    ['nom' => 'Engrais', 'type' => 'Matière première', 'unite' => 'kg'],
    ['nom' => 'Eau', 'type' => 'Matière première', 'unite' => 'L'],
    ['nom' => 'Fertilizant', 'type' => 'Matière première', 'unite' => 'kg'],
    ['nom' => 'Nebula Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Nebula Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Nebula Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Meth Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Coke Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Clé ATM', 'type' => 'Outillage', 'unite' => 'unité'],
    ['nom' => 'Clé GoFast', 'type' => 'Outillage', 'unite' => 'unité'],
    ['nom' => 'Kit Voitures', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Cambu', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Fleeca', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Disqueuse', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Perceuse', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Pièce véhicule', 'type' => 'Pièce', 'unite' => '%'],
    ['nom' => 'Pièce cambu', 'type' => 'Pièce', 'unite' => '%'],
];

echo "📝 Création des articles...\n";
foreach ($articlesData as $articleData) {
    $article = new App\Entity\Article();
    $article->setNom($articleData['nom']);
    $article->setType($articleData['type']);
    $article->setUnite($articleData['unite']);
    
    $stock = new App\Entity\Stock();
    $stock->setArticle($article);
    $stock->setQuantite('0');
    
    $entityManager->persist($article);
    $entityManager->persist($stock);
}

// Créer l'utilisateur admin
echo "📝 Création de l'utilisateur admin...\n";
$admin = new App\Entity\User();
$admin->setEmail('admin@losombras.com');
$admin->setPassword($passwordHasher->hashPassword($admin, 'admin123'));
$admin->setRoles(['ROLE_JEFE']);
$admin->setPrenom('Admin');
$admin->setNom('Los Sombras');
$admin->setPseudo('Admin');

$entityManager->persist($admin);

$entityManager->flush();

echo "✅ Fixtures chargées avec succès !\n";

$kernel->shutdown();
EOF

echo -e "${BLUE}📝 Exécution du script PHP pour charger les fixtures...${NC}"
if php "$TEMP_SCRIPT" 2>&1; then
    echo -e "${GREEN}✅ Fixtures chargées avec succès !${NC}"
    rm -f "$TEMP_SCRIPT"
else
    echo -e "${RED}❌ Erreur lors du chargement des fixtures${NC}"
    rm -f "$TEMP_SCRIPT"
    exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Terminé !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Compte admin créé :"
echo "   Email : admin@losombras.com"
echo "   Mot de passe : admin123"
echo ""

