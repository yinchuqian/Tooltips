'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope

    const measurements = {
    width: 1200,
    height: 600,
    marginAll: 50
}
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1200)
      .attr('height', 600);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("gapminder.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility", "life_expectancy");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Countries by Life Expectancy and Fertility Rate(1980)");

    svgContainer.append('text')
      .attr('x', 600)
      .attr('y', 590)
      .style('font-size', '10pt')
      .text('Fertility');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 350)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy');
  }

  function plotLine(country, tooltip){
    let country_d = data.filter(function(d){return d['country'] == country;})
    let year = country_d.map((row) => parseInt(row["year"]));
    let population = country_d.map((row) => parseInt(row["population"] / 1000000));
    let limits = findMinMax(year, population);
            let xScale = d3.scaleLinear()
            .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
            .range([80, 490]);

            let xAxis = d3.axisBottom().scale(xScale);
            tooltip.append("g")
            .attr('transform', 'translate(0, 450)')
            .call(xAxis);
    
            let yScale = d3.scaleLinear()
            .domain([limits.yMax + 10, limits.yMin - 5]) // give domain buffer
            .range([50, 450]);
            let yAxis = d3.axisLeft().scale(yScale);
            tooltip.append('g')
            .attr('transform', 'translate(80, 0)')
                .call(yAxis);
        tooltip.append('path')
               .datum(country_d)
               .attr("fill", "none")
               .attr("stroke", "steelblue")
               .attr("stroke-width", 2)
               .attr('d', d3.line()
               .defined(d => !isNaN(d.population))
               .x(function(d){return xScale(d.year)})
               .y(function(d){return yScale(d.population/1000000)}))

        tooltip.append('text')
        .attr('x', 20)
        .attr('y', 30)
        .style('font-size', '14pt')
        .text('Population for ' + country)

        tooltip.append('text')
        .attr('transform', 'translate(35, 350)rotate(-90)')
        .style('font-size', '10pt')
        .text('Population (Million)')

        tooltip.append('text')
        .attr('x', 260)
        .attr('y', 480)
        .style('font-size', '10pt')
        .text('Year')
        
               
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["population"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([2, 35]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    let xText = map.xt;
  
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    let tooltip = div.append('svg')
    .attr('width', 500)
    .attr('height', 500)

  

   let data_1980 = data.filter(function(d){return d['year'] == 1980;});
    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data_1980)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', (d) => pop_map_func(d["population"]))
        .attr('id', function(d){return d['country']})
        .attr('stroke', "steelblue")
        .attr('stroke-width', 2)
        .attr('fill', 'white')
        .on("mouseover", (d) =>{
         tooltip.selectAll('*').remove();
         div.transition()
         .duration(200)
         .style('opacity', 0.9)

         plotLine(d.country, tooltip);
         div.style('left', (d3.event.pageX) + "px")
            .style('top', (d3.event.pageY) - 28 + "px")
        
        })
        .on("mouseout", (d) => {
          div.transition()
          .duration(500)
          .style("opacity", 0);
        });
        
        
          
      svgContainer.selectAll('text')
      .data(data_1980)
      .enter()
      .append('text')
      .text(function(d){
         if (d['population'] > 100000000){
           return d['country']
         }
      })
      .attr('x', xText)
      .attr('y', yMap)

      /*var width = 300 
      var height = 300;
      var x = d3.scaleLinear()
      .range([0, width]);
      var y = d3.scaleLinear()
      .range([height], 0);
      var line = d3.line()
        .x(function(d){return x(d['year']);})
        .y(function(d){return y(d['population']);})
      var svg = d3.select('body')
        .select('.tooltip')
        .select('.chart')
        .attr("width", width)
        .attr("height", height)
      var linegraph = svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr("transform", "translate(" + 20 + "," + 20 + ")")

      x.domain(d3.extent(data, function(d){return d["year"]}));
      y.domain(d3.extent(data, function(d){return d["population"]}));
      linegraph.append('path')
      .data(data)
      .attr("class", "line")
      .attr("d", line);

      linegraph.append('g')
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      

      linegraph.append("g")
      .attr("class", "y")
      .call(d3.axisLeft(y));
*/
  }



  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([0 + measurements.marginAll, measurements.width - measurements.marginAll]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };
    let xText = function (d) {return xScale(xValue(d)) + 20;};
    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 550)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([0 + measurements.marginAll, measurements.height - measurements.marginAll - 5]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };
    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      xt:xText,
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
