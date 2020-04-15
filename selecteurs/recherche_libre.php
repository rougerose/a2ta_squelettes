<?php

// Sécurité
if (!defined('_ECRIRE_INC_VERSION')) return;

function selecteurs_recherche_libre() {
	include_spip('base/objets');
	include_spip('inc/filtres');
	include_spip('inc/texte');

	$search = trim(_request('q'));
	$resultats = array();
	$limite = 5;

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
		// les associations liées à un point GIS.
		'association' => array(
			'cle' => 'id_association', //
			'titre' => 'nom', // équivalent titre de la table ou de la requête.
			'select' => array('l1.id_association', 'l1.nom'),
			'from' => array(
				'spip_associations AS l1',
				'INNER JOIN spip_gis_liens AS l2 ON (l2.id_objet = l1.id_association AND l2.objet = "association")',
				'INNER JOIN spip_gis AS l3 ON (l3.id_gis = l2.id_gis)'
			),
			'where' => array(
				'l1.nom LIKE '.sql_quote("%${search}%"),
				'l1.statut = "publie"'
			),
			'groupby' => array('l1.id_association'),
			'orderby' => array('l1.nom')
		),

		// les mots-clés liées à une association qui elle-même est liée à un point GIS.
		'mot' => array(
			'cle' => 'id_mot',
			'titre' => 'titre',
			'complement' => 'descriptif',
			'select' => array('l1.id_mot', 'l1.titre', 'l1.descriptif'),
			'from' => array(
				'spip_mots AS l1',
				'INNER JOIN spip_mots_liens AS l2 ON (l2.id_mot = l1.id_mot)',
				'INNER JOIN spip_associations AS l3 ON (l3.id_association = l2.id_objet AND l2.objet="association")',
				'INNER JOIN spip_gis_liens AS l4 ON (l3.id_association = l4.id_objet AND l4.objet="association")'
			),
			'where' => array(
				'l1.titre LIKE '.sql_quote("%${search}%").' OR l1.descriptif LIKE '.sql_quote("%${search}%"),
				'l3.statut = "publie"',
				'l1.id_groupe=1',
			),
			'groupby' => array('l1.id_mot'),
			'orderby' => array('l1.titre')
		),

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
				// Attention: pour ville, c'est une chaîne (nom de la ville recherchée) et non un nombre.
				$id_objet = $row[$cle];

				$label = filtrer_entites($row[$titre]);

				if ($complement and $cpt = $row[$complement]) {
					$label .= ' ('. filtrer_entites($cpt) .')';
				}

				// "value" est une valeur "technique", le js affiche uniquement le "label"
				$resultats[] = array(
					'label' => $label,
					'value' => $objet.':'.$id_objet,
				);
			}
		}
	}

	return json_encode($resultats);
}
