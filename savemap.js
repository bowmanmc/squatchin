/**
 * savemap.js
 * Finds the map on the page and writes it out to an svg file
 * To Run:
 *    npm install -g phantomjs
 *    phantomjs savemap.js
 */
var fs = require('fs');
var page = require('webpage').create();
var url = 'file://' + fs.absolute('./app/index.html');

page.open(url, function(status) {

    var svg = page.evaluate(function() {
        var serializer = new XMLSerializer();
        var el = document.getElementById('map');
        return serializer.serializeToString(el);
    });
    var filename = 'map.svg';

    fs.write(fs.absolute('./svg/' + filename), svg, 'w');
    phantom.exit();
});
