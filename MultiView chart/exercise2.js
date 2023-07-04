d3.csv('data/owid-covid-data.csv')
	.then(data => {

        data.map(function(el){
            el["percent_fully"] = el["people_fully_vaccinated"] / el["population"];
            el["total_percent"] = el["people_vaccinated"] / el["population"];
            el["percent_partly"] = el["total_percent"] - el["percent_fully"];
        })
        const share = data.filter(el => el.people_vaccinated & el.people_fully_vaccinated)

        const getRecent = arr => { 
            const res = [], map = {};
         
            arr.forEach(el => {
                //store the index
               if (!(el['location'] in map)) {
                  map[el['location']] = res.push(el) - 1;
                  return;
               };
               //compare date
               if(res[map[el['location']]]['date'] < el['date']){
                  res[map[el['location']]] = el;
               };
            });
            return res;
         };

        const vaccinated = getRecent(share);
        vaccinated.sort(function(a, b){
            return b["total_percent"] - a["total_percent"]
        })
        drawBarChart(vaccinated.filter(el => el.total_percent <= 1).slice(0, 15));

	})
 	.catch(error => {
  		console.error('Error loading the data');
	});

function drawBarChart(data){

    const margin = {top: 5, right: 30, bottom: 50, left: 100},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    const categories = ["percent_fully", "percent_partly"]

    // Define the position of the chart 
    const svg = d3.select("#chart")
       .append("svg")
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=>d.total_percent)])
        .range([0, width])
        .nice();
    
    // Create a scale for y-axis
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.location))
        .range([0, height])
        .padding(0.2);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d=>d*100);
    const yAxis = d3.axisLeft(yScale);

    // Define a scale for color 
    const cScale = d3.scaleOrdinal()
        .range(['#7bccc4','#2b8cbe'])
        .domain(categories)

    svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Generate the data for a stacked bar chart
    const stackedData = d3.stack().keys(categories)(data)
    
    // Draw the bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
            .attr("fill", d => cScale(d.key))
        .selectAll("rect")
            .data(d => d)
            .join("rect")
                .attr("y", d => yScale(d.data.location))
                .attr("x", d => xScale(d[0]))
                .attr("width", d => xScale(d[1]) - xScale(d[0]))
                .attr("height",yScale.bandwidth())
    
    // Draw the labels for bars
    svg.append("g")
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
          .selectAll("g")
          .data(stackedData)
          .join("g")
          .selectAll("text")
          .data(d=>d)
          .join("text")
            .attr("x", d => xScale(d[1]))
            .attr("y", d => yScale(d.data.location) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("dx", function(d){
                if(d[0]==d.data.percent_fully){
                    return +20
                }else {
                    return -4
                }
            })
            .text(d=>d3.format(".0%")(d[1]-d[0]))

    // Indicate the x-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-family", "sans-serif")
        .attr("font-size", 18)
        .text("Share of people (%)");
    
    // Legend    
    const legend = d3.select("#legend")
            .append("svg")
            .attr('width', width)
            .attr('height', 70)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
    
    legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
    legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
    legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');    

}