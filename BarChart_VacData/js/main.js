d3.csv('data/owid-covid-data.csv')
	.then(data => {
        /*

        process the data here
        */
        // Create a new map to store the data
        let countryData = new Map();

        // Loop through the data and extract the relevant information
        data.forEach(function(d) {
            let country = d.location;
            let year = d.date;
            let population = d.population;
            let fully = d["people_fully_vaccinated"]
            let tot = d["people_vaccinated"]

            // Check if we have data for this country already
            if (!countryData.has(country)) {
                // If not, create a new object to store the data for this country
                countryData.set(country, { year: year, population: population, fully_vac: fully, total_vac: tot});
            } else {
            // If we already have data for this country, check if this is the most recent year
                var dataForCountry = countryData.get(country);
                if (year > dataForCountry.year && tot) {
                    // If this is the most recent year, update the data for this country
                    dataForCountry.year = year;
                    dataForCountry.population = population;
                    dataForCountry.fully_vac = fully;
                    dataForCountry.total_vac = tot;
                }
            }
        });
        // Now you can calculate the rate of vaccinated people for each country like this:

        var countryRates = [];
        countryData.forEach(function(value, key) {
            var country = value.key;
            var population = value.population;
            var vaccinated = value.total_vac;
            var fully = value.fully_vac;
            var vaccinationRate = (vaccinated / population) * 100;

            // // Add the data to the countryRates array
            if(vaccinationRate < 100) countryRates.push({ country: key, vaccinationRate: vaccinationRate, 
            full_vac: fully / population * 100, part_vac: (vaccinated - fully) / population * 100});
        });

        // Sort the countries by vaccination rate in descending order
        countryRates.sort(function(a, b) {
            return b.vaccinationRate - a.vaccinationRate;
        });

        // Take only the top 15 countries
        var top15 = countryRates.slice(0, 15);

        // Do something with the data, like display it in a chart
        top15.forEach(function(d) {
            console.log(d)
        });
        // draw the stacked bar chart
        drawBarChart(top15);
	})
 	.catch(error => {
         console.error(error);
	});

function drawBarChart(data){

    const margin = {top: 5, right: 30, bottom: 50, left: 100},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
       .append("svg")
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

    // Create a scale for y-axis
    const yScale = d3.scaleBand()
    .domain(data.map(function(d) { return d.country; }))
    .range([0, height])
    .padding(0.2);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Define a scale for color 
    const cScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#7bccc4", "#2b8cbe"]);

    // Generate the data for a stacked bar chart
    const stackedData = data
    // Draw the bars

    svg.selectAll(".full_bar")
    .data(stackedData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) { return yScale(d.country); })
    .attr("width", function(d) { return xScale(d.full_vac); })
    .attr("height", yScale.bandwidth())
    .style("fill", function(d) { return cScale(0); });

    svg.selectAll(".part_bar")
    .data(stackedData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.full_vac);})
    .attr("y", function(d) { return yScale(d.country); })
    .attr("width", function(d) { return xScale(d.part_vac); })
    .attr("height", yScale.bandwidth())
    .style("fill", function(d) { return cScale(1); });

    // Draw the labels for bars

    svg.selectAll(".label_full_vac")
    .data(data)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", function(d) { return xScale(d.full_vac) - 30; })
    .attr("y", function(d) { return yScale(d.country) + yScale.bandwidth() / 2 + 5; })
    .text(function(d) { return Math.floor(d.full_vac) + "%"; })
    .style("font-size", "13px")

    svg.selectAll(".label_part_vac")
    .data(data)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", function(d) { return xScale(d.vaccinationRate) + 5; })
    .attr("y", function(d) { return yScale(d.country) + yScale.bandwidth() / 2 + 5; })
    .text(function(d) { return Math.floor(d.part_vac) + "%"; })
    .style("font-size", "13px")

    // Indicate the x-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-size", 17)
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
