<?php
/**
 * Options au chargement du plugin A2TA site
 *
 * @plugin     A2TA site
 * @copyright  2020
 * @author     christophe le drean
 * @licence    GNU/GPL v3
 * @package    SPIP\A2ta_squelettes\Options
 */

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

// Zcore
if (!isset($GLOBALS['z_blocs'])) {
	$GLOBALS['z_blocs'] = array(
		'content',
		'head_js',
		'head',
		'header',
		'extra',
		'footer',
	);
}

// Formulaire de recherche de la carte : activer le sélecteur générique
if (!defined('_SELECTEUR_GENERIQUE_ACTIVER_PUBLIC')) {
	define('_SELECTEUR_GENERIQUE_ACTIVER_PUBLIC', true);
}

// Modale "chargement du site" :
// - ajouter si nécessaire un cookie spécifique pour afficher ou pas la modale ;
// - la valeur de la constante est vérifiée dans extra/dist.html
include_spip('inc/cookie');
if (isset($_COOKIE['a2ta_loading'])) {
  $GLOBALS['a2ta_loading'] = "is-hidden";
} else {
  spip_setcookie('a2ta_loading', 'vu', time() + 30 * 24 * 3600);
  $GLOBALS['a2ta_loading'] = "is-visible";
}
// dev uniquement
//$GLOBALS['a2ta_loading'] = "is-visible";
