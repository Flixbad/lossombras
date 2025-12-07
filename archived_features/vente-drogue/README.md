# Fonctionnalité Archivée : Vente de Drogue

Cette fonctionnalité a été archivée le **2025-01-05** et peut être réintégrée ultérieurement si nécessaire.

## Description
Système de rémunération par vente de drogue avec calcul automatique des commissions (5% du bénéfice) pour les vendeurs.

## Fichiers archivés

### Backend
- `backend/src/Entity/VenteDrogue.php` - Entité Doctrine pour les ventes de drogue
- `backend/src/Controller/VenteDrogueController.php` - Contrôleur API pour gérer les ventes
- `backend/src/Repository/VenteDrogueRepository.php` - Repository Doctrine
- `backend/src/Service/DroguePricingService.php` - Service de gestion des prix et configurations des drogues
- `backend/migrations/Version20251205171036.php` - Migration pour modifier la structure de vente_drogue
- `backend/migrations/Version20251205190325.php` - Migration pour ajouter le champ type_drogue

### Frontend
- `frontend/src/app/core/services/vente-drogue.service.ts` - Service Angular pour les appels API

## Modifications nécessaires pour réintégrer

1. **Restaurer les fichiers** dans leurs emplacements d'origine
2. **Modifier `comptabilite-argent.component.ts`** pour réintégrer :
   - L'import de `VenteDrogueService`
   - Les propriétés et méthodes liées aux ventes de drogue
   - La section HTML dans le template (lignes 162-277)
   - Le modal de vente de drogue (lignes 544-640)
3. **Modifier `ArgentController.php`** pour réintégrer :
   - L'import de `VenteDrogueRepository`
   - La logique de suppression des ventes dans `closeWeek()` (lignes 250-256)
4. **Vérifier les migrations** dans la base de données
5. **Tester** que tout fonctionne correctement

## Note
La table `vente_drogue` peut toujours exister dans la base de données. Si vous ne souhaitez pas la conserver, vous pouvez la supprimer manuellement ou créer une migration pour la retirer.

