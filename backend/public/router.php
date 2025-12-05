<?php

// Routeur pour le serveur PHP de développement
// Ce fichier redirige toutes les requêtes vers index.php

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);

// Si c'est un fichier statique qui existe, le servir directement
$file = __DIR__ . $path;
if ($path !== '/' && $path !== '/index.php' && file_exists($file) && is_file($file) && !is_dir($file)) {
    return false; // Servir le fichier directement
}

// Pour toutes les autres requêtes, rediriger vers index.php
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
require __DIR__ . '/index.php';
