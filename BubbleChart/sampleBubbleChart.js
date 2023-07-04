function makeChart(){
  /*
    sample data
    const data = {
        1960: [
          { country: 'Aruba', lifeExpectancy: '64.152', fertilityRate: '4.82', population: '54608' },
          { country: 'Africa Eastern and Southern', lifeExpectancy: '44.0855518454965', fertilityRate: '6.72412501084242', population: '130692579' },
          { country: 'Afghanistan', lifeExpectancy: '32.535', fertilityRate: '7.282', population: '8622466' },
        ],
        1961: [
          { country: 'Country A', lifeExpectancy: '71.245', fertilityRate: '2.158', population: '23000000' },
          { country: 'Country B', lifeExpectancy: '68.934', fertilityRate: '2.512', population: '15200000' },
          { country: 'Country C', lifeExpectancy: '75.219', fertilityRate: '1.876', population: '28600000' },
        ],
        1962: [
          { country: 'Country A', lifeExpectancy: '70.317', fertilityRate: '2.352', population: '23800000' },
          { country: 'Country B', lifeExpectancy: '67.542', fertilityRate: '2.687', population: '15700000' },
          { country: 'Country C', lifeExpectancy: '74.623', fertilityRate: '1.951', population: '29400000' },
        ],
        1963: [
          { country: 'Country A', lifeExpectancy: '72.891', fertilityRate: '2.051', population: '24600000' },
          { country: 'Country B', lifeExpectancy: '66.817', fertilityRate: '2.854', population: '16200000' },
          { country: 'Country C', lifeExpectancy: '73.415', fertilityRate: '2.145', population: '30200000' },
        ],
        1964: [
          { country: 'Country A', lifeExpectancy: '74.615', fertilityRate: '1.913', population: '25400000' },
          { country: 'Country B', lifeExpectancy: '65.952', fertilityRate: '3.021', population: '16700000' },
          { country: 'Country C', lifeExpectancy: '72.139', fertilityRate: '2.339', population: '31000000' },
        ],
      };
    */
    const data = [
      { country: "Country A", year: 2000, lifeExpectancy: 75, fertilityRate: 2.1, population: 10000000 },
      { country: "Country B", year: 2005, lifeExpectancy: 80, fertilityRate: 1.8, population: 15000000 },
      { country: "Country C", year: 2010, lifeExpectancy: 70, fertilityRate: 2.5, population: 12000000 },
      { country: "Country D", year: 2015, lifeExpectancy: 68, fertilityRate: 3.2, population: 9000000 },
      { country: "Country E", year: 2020, lifeExpectancy: 73, fertilityRate: 2.4, population: 18000000 },
      { country: "Country F", year: 2025, lifeExpectancy: 78, fertilityRate: 1.6, population: 20000000 },
    ];
    
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3
      .select("#chart-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const x = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.lifeExpectancy), d3.max(data, (d) => d.lifeExpectancy)])
      .range([0, width]);
    
    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.fertilityRate), d3.max(data, (d) => d.fertilityRate)])
      .range([height, 0]);
    
    const bubbleSize = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.population)])
      .range([2, 20]);
  
  
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 20)
      .style("text-anchor", "middle")
      .text("Life Expectancy");
    
    svg.append("g").call(d3.axisLeft(y));
    
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Fertility Rate");
    
    const bubbles = svg
      .selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => x(d.lifeExpectancy))
      .attr("cy", (d) => y(d.fertilityRate))
      .attr("r", (d) => bubbleSize(d.population))
      .style("fill", "steelblue")
      .style("opacity", 0.8);
    
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
    bubbles
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).style("stroke", "black").style("stroke-width", "2px");
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            "Country: " +
              d.country +
              "<br/>Life Expectancy: " +
              d.lifeExpectancy +
              "<br/>Fertility Rate: " +
              d.fertilityRate +
              "<br/>Population: " +
              d.population
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).style("stroke", "none");
        tooltip.transition().duration(500).style("opacity", 0);
      });
    
    const slider = d3
      .sliderBottom()
      .min(d3.min(data, (d) => d.year))
      .max(d3.max(data, (d) => d.year))
      .step(1)
      .width(width)
      .tickFormat(d3.format("d"))
      .default(d3.min(data, (d) => d.year))
      .on('onchange', (value) => {
        const filteredData = data.filter(d => d.year === value);
        bubbles.data(filteredData)
          .transition()
          .duration(500)
          .attr("cx", (d) => x(d.lifeExpectancy))
          .attr("cy", (d) => y(d.fertilityRate));
      });
    
    d3.select("#slider-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + 30 + ")")
      .call(slider);
    
  }