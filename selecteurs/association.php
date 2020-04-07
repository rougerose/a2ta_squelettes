<?php

// Sécurité
if (!defined('_ECRIRE_INC_VERSION')) return;

function selecteurs_association() {
	include_spip('base/objets');
	include_spip('inc/filtres');
	include_spip('inc/texte');

	// $trouver_table = charger_fonction('trouver_table', 'base');
	// $tables = lister_tables_objets_sql();
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

	if (
		$trouve = sql_allfetsel(
			"nom, id_association",
			"spip_associations",
			"nom LIKE ".sql_quote("${search}%"), // recherche à partir du début du nom
			"nom",
			"",
			"0, $limite"
		)
	) {
		// On ajoute le titre de l'objet
		$resultats[] = array(
			'label' => '<strong>' . 'Associations' . '</strong>',
			'value' => ' ',
		);

		foreach ($trouve as $resultat) {
			$id_objet = $resultat['id_association'];
			$titre = typo($resultat['nom']);

			$resultats[] = array(
				'label' => $titre,
				'value' => 'association'.$id_objet,
			);
		}
	}

	return json_encode($resultats);
}
