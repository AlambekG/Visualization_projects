function loadData(file) {
    return new Promise((resolve, reject) => {
        d3.text(file)
        .then(text => {
            const lines = text.split('\n');
            const header = lines[4].replace(/"/g, '').split(',');
            const data = [];
            for (let i = 5; i < lines.length - 1; i++) {
                const values = lines[i].replace(/"/g, '').split(',');
                const row = {};
                for (let j = 0; j < header.length; j++) {
                    let k = j
                    if(j > 3) k = k + 1
                    row[header[j]] = values[k];
                }
                data.push(row);
            }
            resolve(data)
        })
        .catch(error => {
            console.log("Error loading:" + file)
            reject(error)
        });
    });
}
async function loadAllData() {
    try {
        const lifeExpectancyData = await loadData('/life expectancy.csv');
        const fertilityRateData = await loadData('/fertility rate.csv');
        const populationData = await loadData('/population.csv');

        const data = lifeExpectancyData.map((lifeExpectancyItem) => {
            const { "Country Name": country, "Country Code": countryCode } = lifeExpectancyItem;
            const yearKeys = Object.keys(lifeExpectancyItem).filter(key => /^\d{4}$/.test(key));
        
            return yearKeys.map((yearKey) => {
            const year = Number(yearKey);
            
            const lifeExpectancy = lifeExpectancyItem[yearKey];
            const fertilityRateItem = fertilityRateData.find(item => item["Country Code"] === countryCode && item["Indicator Name"] === "Fertility rate");
            const fertilityRate = fertilityRateItem ? fertilityRateItem[yearKey] : null;
            const populationItem = populationData.find(item => item["Country Code"] === countryCode);
            const population = populationItem ? populationItem[yearKey] : null;
            return {
                country,
                year,
                lifeExpectancy,
                fertilityRate,
                population
            };
            }).filter(item => item !== null);
        }).flat();
    
        const sortedByYearData = {};

        data.forEach((entry) => {
        const { year, country, lifeExpectancy, fertilityRate, population } = entry;
        if (!sortedByYearData[year]) {
            sortedByYearData[year] = [];
        }
        sortedByYearData[year].push({ country, lifeExpectancy, fertilityRate, population });
        });
        // console.log(data); 
        //console.log(sortedByYearData)

        console.log("successfully loaded Data")
        makeChart(sortedByYearData);
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}
function makeChart(data) {
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const svg = d3
        .select("#chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const x = d3
        .scaleLinear()
        .domain([
            d3.min(Object.values(data), (d) => d3.min(d, (e) => +e.lifeExpectancy)),
            d3.max(Object.values(data), (d) => d3.max(d, (e) => +e.lifeExpectancy)),
        ])
        .range([0, width]);
    
    const y = d3
        .scaleLinear()
        .domain([
            d3.min(Object.values(data), (d) => d3.min(d, (e) => +e.fertilityRate)),
            d3.max(Object.values(data), (d) => d3.max(d, (e) => +e.fertilityRate)),
        ])
        .range([height, 0]);
    
    const bubbleSize = d3.scaleSqrt()
        .domain([
            0,
            d3.max(Object.values(data), (d) => d3.max(d, (e) => +e.population)),
        ])
        .range([5, 50]);
    
    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x));
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .style("text-anchor", "middle")
        .text("Life Expectancy");
    
    svg.append("g").call(d3.axisLeft(y));
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Fertility Rate");
    
    const yearData = data[1960];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const bubbles = svg
        .selectAll(".bubble")
        .data(yearData)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", (d) => x(+d.lifeExpectancy))
        .attr("cy", (d) => y(+d.fertilityRate))
        .attr("r", (d) => bubbleSize(+d.population))
        .style("fill", (d) => colorScale(d.country))
        .style("opacity", 0.8);
    
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    bubbles
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
            .style("stroke", "black")
            .style("stroke-width", "2px");
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
    const years = Object.keys(data);

    const slider = d3
        .sliderBottom()
        .min(d3.min(years))
        .max(d3.max(years))
        .step(1)
        .width(width)
        .tickValues([d3.min(years), d3.max(years)])
        .tickFormat(d3.format("d"))
        .default(d3.min(years))
        .on("onchange", (value) => {
            const filteredData = data[value];
            bubbles.data(filteredData)
            .transition()
            .duration(500)
            .attr("cx", (d) => x(d.lifeExpectancy))
            .attr("cy", (d) => y(d.fertilityRate))
            .attr("r", (d) => bubbleSize(d.population));
        });
    
    const sliderGroup = d3
        .select("#slider-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 30 + ")")
        .call(slider);

    sliderGroup
        .selectAll(".tick:not(:first-child)")
        .remove();
}
loadAllData()