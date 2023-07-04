d3.csv('data/life_expectancy_by_country.csv')
	.then(data => {

        const getDiff = arr => { 
            const unique = [...new Set(arr.map((item) => item.country_name))];
            const ret = [];

            for (i in unique){
                const country = unique[i]
                const getit = arr.filter(el => el.country_name == country);
                const value_list = [...(getit.map((item) => +item.value))];
                const diff = Math.max(...value_list) - Math.min(...value_list);
                const map = {};
                map['country_name'] = country;
                map['gap'] = diff;
                ret.push(map)
            }
            return ret;
        }

        const gapmap = getDiff(data);
        gapmap.sort(function(a, b){
            return b.gap - a.gap
        })
        
        const condition = [...(gapmap.slice(0, 5).map(item => item.country_name))];
        const processedData = data.filter(el => condition.includes(el.country_name))

        // Draw the line chart 
        drawLineChart(processedData);

	})
 	.catch(error => {
        console.error(error);
        console.error('Error loading the data');
});

function drawLineChart(data){
    const margin = {top: 5, right: 100, bottom: 50, left: 50},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    const sumstat = d3.group(data, d => d.country_name);

    // Define the position of the chart 
    const svg = d3.select("#chart")
    .append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.value; })])
        .range([ height, 0 ]);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    const xAxisGroup = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxisGroup = svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Define a scale for color 
    const cScale = d3.scaleOrdinal()
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'])

    // Draw the line
    svg.selectAll(".line")
    .data(sumstat)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return cScale(d[0]) })
    .attr("stroke-width", 1.5)
    .attr("d", function(d){
        return d3.line()
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.value); })
        (d[1])
    })

    // Draw the labels for lines
    svg.selectAll(".text")        
        .data(sumstat)
        .enter()
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("class","label")
        .attr("x", function(d) { return xScale(d[1][d[1].length-1].year); }  )
        .attr("y", function(d) { return yScale(d[1][d[1].length-1].value); })
        .attr("fill", function(d) { return cScale(d[0])})
        .attr("dy", ".75em")
        .text(function(d) { return d[0]; }); 
}