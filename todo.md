# Loading page:

- Tester le swipe sur la page à partir d'un téléphone
- Gérer la page en modal, ce qui sera préférable pour l'accessibilité. Voir comme modèle possible (mais a priori pas utilisable tel quel) https://van11y.net/fr/modale-accessible/ et, la référence : https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html#.
- Texte de présentation : Ajouter une page de configuration du plugin, afin de gérer ce texte, ce qui permet de garder le descriptif du site à un texte de présentation avec une forme ou une longueur moins contrainte.

# Carte

- ajouter dans l'url les références aux associations recherchées, à la fiche d'une association affichée ?

# Carte > Sidebar, technique

- plutôt que définir le html avec javascript, charger un squelette html via \$.get() ?
- Le squelette map/sidebar/info.html utilise les styles d'une fiche : revoir les styles afin qu'ils soient plus génériques.

# Carte > Sidebar, graphique

- Utiliser des icones en marge gauche :
  - page info carte : Icone info
  - fiche asso : devant l'adresse, icone point gis, etc.

# Carte > Recherche > Liste des activités

- La barre de défilement du navigateur reste visible. Chercher une meilleure solution : soit défilement natif soit possibilité de masquer le défilement natif ?

# Icones

Insérer toutes les icones dans le fichier sprite
