<?php

/**
 * A (very) simple proxy for the TFL feed, since it does not allow CORS
 *
 * @author  J.T. Ouwerling
 */

$content = file_get_contents("http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml");

if($content == false) {
	http_response_code(500);
	exit();
}

header('Content-Type:text/xml');
echo $content;