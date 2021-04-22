window.addEventListener("load", makeMap)

function makeMap() {
    var boundingRect = d3.select("#plotDiv").node().getBoundingClientRect();
    var marginSVG = {top:20,
                     right:20,
                     bottom:20,
                     left:20};

    var heightSVG = boundingRect.height - marginSVG.top - marginSVG.bottom;
    var widthSVG = boundingRect.height - marginSVG.right - marginSVG.left;

    var svg = d3.select('#plotDiv')
        .append('svg')
        .attr('height', heightSVG)
        .attr('width', widthSVG)
        .attr('id', "plotSVG");

    var polys = svg.append('g')
        .attr('id', "polys");

    var projection = d3.geoTransverseMercator()
        .translate([widthSVG/2,heightSVG/2])
        .center([-78.7789,0.3090]);

    var path = d3.geoPath()
        .projection(projection);

    var mouseOver = function(d) {
        d3.selectAll(".conc")
          .transition()
          .duration(200)
        d3.select(this)
          .classed('hoverConc', true);
      };

    var mouseOut = function(d) {
        d3.select(this)
          .classed('hoverConc', false);
      };

    var getInfo = function(event) {
        var concProps = d3.select(this).datum().properties;
        var coords = (d3.pointer(event, d3.select(this).node()));
        txt.attr('x', coords[0])
        .attr('y', coords[1]);
        txt.text(concProps['nam'] +" "+ concProps['com']);
      };

    var txt = svg.append('text');

    d3.json("imbOnly.topoJSON").then( function(d){
        var imbOnly = topojson.feature(d, d.objects.imbOnly);
        projection.fitExtent([[20, 20], [widthSVG - 20, heightSVG - 20]], imbOnly);
        polys.append("path")
            .datum(imbOnly)
            .attr("id","province")
            .attr("d",path);
        });
        
    d3.json("imbConcs.topoJSON").then( function(d) {
        polys.append("g")
          .attr("id","imbConcsPaths")
          .attr("class","concs")
          .selectAll('path')
          .data(topojson.feature(d, d.objects.imbConcs).features)
          .enter()
          .append("path")
            .attr("d", path)
            .attr("class", "conc")
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', getInfo);
    });

    d3.json("losCedPoly.topoJSON").then( function(d){
        var losCedPoly = topojson.feature(d, d.objects.losCedPoly);
        polys.append("path")
            .datum(losCedPoly)
            .attr("id","losCed")
            .attr("d",path);
        });

    var zoom = d3.zoom()
      .scaleExtent([1,8])
      .on('zoom', function(event) {
        polys.selectAll('path')
          .attr('transform', event.transform);
        txt.text('');
    });

    svg.call(zoom);
}

