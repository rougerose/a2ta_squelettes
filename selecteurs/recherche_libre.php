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

	// Les tables sur lesquelles on recherche.
	// Renseigner préalablement les éléments essentiels
	// pour aller au plus simple :
	// 	- le titre est soit un nom, soit un titre
	// 	- éventuellement un descriptif
	// 	- un critère supplémentaire (mot.id_groupe par exemple)
	//
	// La clé primaire et le nom de l'objet sont recherchés par les fonctions
	// dédiées de spip.
	//
	$tables = array(
		'spip_associations' => array(
			'titre' => 'nom',
			'desc' => '',
			'like' => 'nom'
		),
		'spip_adresses' => array(
			'titre' => 'ville',
			'desc' => '',
			'like' => 'ville'
		),
		'spip_mots' => array(
			'titre' => 'titre',
			'desc' => 'descriptif',
			'like' => array('concat' => 'titre, descriptif'),
			'critere' => array('id_groupe' => 1)
		)
	);

	foreach ($tables as $table => $requete) {
		$objet = objet_type($table);
		$cle = id_table_objet($table);
		$titre = $requete['titre'];
		$desc = $requete['desc'];
		$where = '';
		$field = '';
		$like = $requete['like'];
		$critere = $requete['critere'];

		if (is_array($critere) and count($critere)) {
			foreach ($critere as $key => $value) {
				if ($where) {
					$where .= ' AND ';
				}
				$where .= '(' . $key . '=' . $value . ')';
			}
		}

		if ($like) {
			if ($where) {
				$where .= ' AND ';
			}

			if (is_array($like) and $like['concat']) {
				$field = $like['concat'];
				$where .= 'CONCAT(' . $like['concat'] .') LIKE ';
			} else {
				$field = $like;
				$where .= $like . ' LIKE ';
			}
		}

		if ($trouves = sql_allfetsel(
				$cle . ',' . $field,
				$table,
				$where . sql_quote("%${search}%"),
				$titre,
				'',
				"0, $limite"
			)
		) {
			foreach ($trouves as $res) {
				$id_objet = $res[$cle];
				$label = filtrer_entites($res[$titre]);

				// Ajouter l'éventuel descriptif.
				if ($res[$desc]) {
					$label .= ' ('. filtrer_entites($res[$desc]) .')';
				}

				// value affiche une valeur "technique", le js prend en charge
				// d'afficher une valeur plus explicite pour l'utilisateur.
				$resultats[] = array(
					'label' => $label,
					'value' => $objet.':'.$id_objet,
				);
			}
		}
	}
	return json_encode($resultats);
}
