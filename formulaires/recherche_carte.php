<?php

function formulaires_recherche_carte_charger_dist() {
	$valeurs = array(
		'criteres_recherche_libre' => '',
	);
	return $valeurs;
}

function formulaires_recherche_carte_verifier_dist() {
	$erreurs = array();
	return $erreurs;
}

function formulaires_recherche_carte_traiter_dist() {
	$res = array(
		// 'criteres_recherche_libre' => _request('criteres_recherche_libre'),
		'editable' => false
	);
	// $input = _request('recherche-libre');
	// $res['_hidden'] .= "<input type='hidden' name='rechLib' value='$input' />";
	return $res;
}
