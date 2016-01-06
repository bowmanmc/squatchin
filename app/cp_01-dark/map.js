
function SasquatchMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.renderMap = function() {

        var map = this;

        var el = document.getElementById(map.divId);

        map.height = el.clientHeight;
        map.width = el.clientWidth;
        console.log('Making map size: ' + map.width + 'x' + map.height);

        map.projection = d3.geo.airy();
        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.divSelector).append('svg')
            .attr({
                'id': 'map',
                'width': map.width,
                'height': map.height
            });

        map.grid = map.svg.append('g').attr({
            'id': 'grid'
        });
        map.land = map.svg.append('g').attr({
            'id': 'land'
        });
        map.classc = map.svg.append('g').attr({
            'id': 'class-c'
        });
        map.classb = map.svg.append('g').attr({
            'id': 'class-b'
        });
        map.classa = map.svg.append('g').attr({
            'id': 'class-a'
        });

        map.getOutlines().then(function(outlines) {
            map.drawOutlines(outlines);
            map.getSightings().then(function(sightings) {
                map.drawSightings(sightings);
            });
        });
    };

    this.getSightings = function() {
        var deferred = $.Deferred();
        var url = '//bowmanmc.github.io/squatchin/app/data/bfrodb.min.tsv';
        d3.tsv(url, function(error, response) {
            deferred.resolve(response);
        });
        return deferred.promise();
    };

    this.handleHover = function(d) {
        console.log('Hover on: ' + JSON.stringify(d));
        $('#details .description').text(d.description);
    };

    this.drawSightings = function(data) {
        console.log('Drawing ' + data.length + ' sightings...');
        var i, item;
        var len = data.length;
        var a = [];
        var b = [];
        var c = [];
        for (i = 0; i < len; i++) {
            item = data[i];
            if (item.class === 'A') {
                a.push(item);
            }
            else if (item.class === 'B') {
                b.push(item);
            }
            else {
                c.push(item);
            }
        }

        map.classc.selectAll('circle')
            .data(c)
            .enter().append('circle')
                .attr('r', 1)
                .attr('class', 'pin pin-c')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                })
                .on('mouseover', function(d) {
                    map.handleHover(d);
                });
        map.classb.selectAll('circle')
            .data(b)
            .enter().append('circle')
                .attr('r', 1)
                .attr('class', 'pin pin-b')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                })
                .on('mouseover', function(d) {
                    map.handleHover(d);
                });
        map.classa.selectAll('circle')
            .data(a)
            .enter().append('circle')
                .attr('r', 1)
                .attr('class', 'pin pin-a')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                })
                .on('mouseover', function(d) {
                    map.handleHover(d);
                });
    };

    this.getOutlines = function() {
        var deferred = $.Deferred();
        var url = '//bowmanmc.github.io/squatchin/app/maps/canusa-10m.geojson';
        d3.json(url, function(error, response) {
            deferred.resolve(response);
        });
        return deferred.promise();
    };

    this.drawOutlines = function(data) {
        var map = this;

        var center = {
            'lon': -90,
            'lat': 80
        };
        var r = [center.lon * -1, center.lat * -1];
        console.log('Rotate to: ' + JSON.stringify(r));
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(data),
            s = 0.98 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

        map.projection.scale(s).translate(t);

        var graticule = d3.geo.graticule()
            .extent([
                // left, bottom (lon, lat)
                [-180, -30],
                // right, top   (lon, lat)
                [180, 90]
            ])
            .step([5, 5]); // how many degrees between graticule lines

        map.grid.append('path')
            .datum(graticule)
            .attr('class', 'graticule')
            .attr('d', map.path);

        map.land.selectAll('path')
            .data(data.features)
            .enter().append('path')
                .attr({
                    'class': 'land',
                    'd': map.path
                });
    };

}
