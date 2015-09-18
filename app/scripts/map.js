
function SasquatchMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.initMap = function() {

        var map = this;

        var el = document.getElementById(map.divId);

        map.height = el.clientHeight;
        map.width = el.clientWidth;
        console.log('Making map size: ' + map.width + 'x' + map.height);

        map.projection = d3.geo.airy();
        //map.projection = d3.geo.conicConformal();
        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.divSelector).append('svg')
            .attr({
                'width': map.width,
                'height': map.height
            });

        map.gt = map.svg.append('g');
        map.land = map.svg.append('g');
        map.markers = map.svg.append('g');

        map.getOutlines().then(function(data) {
            map.drawOutlines(data);
            map.getSightings().then(function(data) {
                map.drawSightings(data);
            });
        });
    };

    this.getSightings = function() {
        var deferred = $.Deferred();
        d3.tsv('data/bfrodb.min.tsv', function(error, response) {
            deferred.resolve(response);
        });
        return deferred.promise();
    };

    this.drawSightings = function(data) {
        console.log('Drawing ' + data.length + ' sightings...');
        map.markers.selectAll('circle')
            .data(data)
            .enter().append('circle')
                .attr('r', 1)
                .attr('class', 'pin')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                });
    };

    this.getOutlines = function() {
        var deferred = $.Deferred();
        d3.json('maps/na.countries.json', function(error, response) {
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
        var r = [center['lon'] * -1, center['lat'] * -1];
        console.log('Rotate to: ' + JSON.stringify(r));
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(data),
            s = 1 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            //t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];
            t = [(map.width / 2), (map.height - s * (b[1][1] + b[0][1])) / 2];

        console.log('Bounds: ' + JSON.stringify(b));
        console.log('Scale: ' + JSON.stringify(s));
        console.log('Translate: ' + JSON.stringify(t));
        console.log('Map size: ' + map.width + 'x' + map.height);

        map.projection.scale(s).translate(t);

        var graticule = d3.geo.graticule()
            .extent([
                //[-230, -30],      // left, bottom (lon, lat)
                [-180, -30],
                //[9.99, 90]    // right, top   (lon, lat)
                [180, 90]
            ])
            .step([5, 5]); // how many degrees between graticule lines

        map.gt.append('path')
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

        // map.markers.selectAll('circle')
        //     .data([center])
        //     .enter().append('circle')
        //         .attr('r', 3)
        //         .attr('class', 'pin')
        //         .attr('transform', function(d) {
        //             return "translate(" + map.projection([
        //                 d.lon,
        //                 d.lat
        //             ]) + ")"
        //         });
    };

};
