
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
                .attr('class', 'pin pin-a')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                });
        map.classb.selectAll('circle')
            .data(b)
            .enter().append('circle')
                .attr('r', 1)
                .attr('class', 'pin pin-a')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
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
                });
    };

    this.getOutlines = function() {
        var deferred = $.Deferred();
        d3.json('maps/canusa-10m.geojson', function(error, response) {
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
            //t = [(map.width / 2), (map.height - s * (b[1][1] + b[0][1])) / 2];

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
