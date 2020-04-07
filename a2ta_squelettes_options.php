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

if (!defined('_SELECTEUR_GENERIQUE_ACTIVER_PUBLIC')) {
	define('_SELECTEUR_GENERIQUE_ACTIVER_PUBLIC', true);
}
