<?php

if (!defined("_ECRIRE_INC_VERSION")) {
  return;
}

/**
 * Ajouter le plugin sidebar au js de Leaflet
 *
 * @param  array $flux
 * @return array
 */
function a2ta_squelettes_recuperer_fond($flux) {
  if ($flux['args']['fond'] == 'javascript/gis.js') {
    // leaflet-sidebar
    $js = spip_file_get_contents(find_in_path('dist/js/L.Control.Sidebar.js'));
    // leaflet-spin
    //$js .= "\n".spip_file_get_contents(find_in_path('dist/js/leaflet.spin.js'));
    // leaflet-easybutton
    $js .= "\n".spip_file_get_contents(find_in_path('dist/js/easy-button.js'));
    $flux['data']['texte'] .= "\n".$js;
  }
  return $flux;
}
