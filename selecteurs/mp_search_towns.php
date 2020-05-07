<?php

if (!defined("_ECRIRE_INC_VERSION")) {
  return;
}

function selecteurs_mp_search_towns() {
  include_spip('base/objets');
  include_spip('inc/filtres');
  include_spip('inc/texte');

  $search = trim(_request('q'));
  $resultats = array();
  $limite = 10;

  if (!$search) {
    return $resultats;
  }

  // Pouvoir personnaliser le nombre de résultats
  if ($limite_perso = intval(_request('limite')) and $limite_perso > 0) {
    $limite = $limite_perso;
  }

  // Les requetes sont explicitées de manière détaillée, ce n'est peut-être pas
  // le mieux pour la qualité du code, mais ça permet de viser au plus juste.
  $tables = array(
    // Les villes (de la table spip_adresses)liées à une association qui est liée elle-même à un point GIS
    'ville' => array(
      'cle' => 'ville',
      'titre' => 'ville',
      'select' => array('l1.ville'),
      'from' => array(
        'spip_adresses AS l1',
        'INNER JOIN spip_adresses_liens AS l2 ON (l2.id_adresse = l1.id_adresse)',
        'INNER JOIN spip_associations AS l3 ON (l2.id_objet = l3.id_association AND l2.objet = "association")',
        'INNER JOIN spip_gis_liens AS l4 ON (l4.objet = "association" AND l4.id_objet = l3.id_association)'
      ),
      'where' => array(
        'l1.ville LIKE '.sql_quote("%${search}%"),
        'l3.statut = "publie"'
      ),
      'groupby' => array('l1.ville'),
      'orderby' => array('l1.ville')
    )
  );

  foreach ($tables as $objet => $requete) {
    $from = implode(' ', $requete['from']);
    $cle = $requete['cle'];
    $titre = $requete['titre'];
    $complement = isset($requete['complement']) ? $requete['complement'] : '';

    $rows = sql_allfetsel(
      $requete['select'],
      $from,
      $requete['where'],
      $requete['groupby'],
      $requete['orderby'],
      "0, $limite"
    );

    if ($rows) {

      foreach ($rows as $row) {
        // Attention: pour ville, id_objet est une chaîne (nom de la ville recherchée) et non un nombre.
        $id_objet = $row[$cle];

        $label = filtrer_entites($row[$titre]);

        if ($complement and $cpt = $row[$complement]) {
          $label .= ' ('. filtrer_entites($cpt) .')';
        }

        // "value" est une valeur "technique", le js affiche
        // à l'utilisateur le "label"
        $resultats[] = array(
          'label' => $label,
          'value' => $cle.':'.$id_objet,
        );
      }
    }
  }
  return json_encode($resultats);
}
