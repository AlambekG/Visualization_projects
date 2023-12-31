d3.csv('/owid-covid-data.csv')
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
               if (!(el['location'] in map)) {
                  map[el['location']] = res.push(el) - 1;
                  return;
               };
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


        const barChartData = vaccinated.filter(el => el.total_percent <= 1);
        const lineChartData = data
            .filter(item => item.continent.length > 0)
            .filter(item => item.total_cases.length > 0 && item.date.length > 0)
            .map(item => ({
                country_name: item["location"],
                date: parseInt(item["date"]),
                value: parseFloat(item["total_cases"])
            }))
        drawChart(barChartData, lineChartData)
	})
 	.catch(error => {
  		console.error('Error loading the data');
	});

const countryVis = {}

function drawLineChart(data){
    console.log("dajkhsflkjadshf", data)
    const margin = {top: 5, right: 100, bottom: 50, left: 100},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    const sumstat = d3.group(data, d => d.country_name);

    // data.forEach(function(d){
    //     d.date = d3.timeParse("%Y-%m-%d")(d.date)
    // });
    // console.log(data)

    const svg = d3.select("#chart")
    .append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.value; })])
        .range([ height, 0 ]);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    //const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"));
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
    .attr("class", function(d){
        return d[0]})
    .attr("opacity", function(d){
        if(countryVis[d[0]] == true) return 1;
        else return 0;
    })
    .attr("fill", "none")
    .attr("stroke", function(d){ return cScale(d[0]) })
    .attr("stroke-width", 1.5)
    .attr("d", function(d){
        return d3.line()
        .x(function(d) { return xScale(d.date); })
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
        .attr("class", function(d){return d[0]})
        .attr("opacity", function(d){
            if(countryVis[d[0]] == true) return 1;
            else return 0;
        })
        .attr("x", function(d) { return xScale(d[1][d[1].length-1].date); }  )
        .attr("y", function(d) { return yScale(d[1][d[1].length-1].value); })
        .attr("fill", function(d) { return cScale(d[0])})
        .attr("dy", ".75em")
        .text(function(d) { return d[0]; })

    const dateSlider = document.getElementById("dateSlider");
    dateSlider.addEventListener("input", updateChart);
    const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.value); });
    const selectedDayElement = document.getElementById("selectedDay");

    function updateChart() {
        const sliderValue = parseInt(dateSlider.value);
        if (sliderValue >= 0 && sliderValue < data.length) {
            const selectedDate = data[sliderValue].date; 

            const filteredData = data.filter(d => d.date <= selectedDate);
            xScale.domain(d3.extent(filteredData, d => d.date));
            yScale.domain([0, d3.max(filteredData, d => d.value)]);
            svg.select(".x-axis").call(xAxis);
            svg.select(".y-axis").call(yAxis);
            svg.select(".line", line(filteredData));

            selectedDayElement.innerText = "";
            console.log(selectedDayElement)
            selectedDayElement.innerText = "Selected date is: " + selectedDate.toDateString(); // Display the selected date as text
        }
    }    
}

function drawBarChart(data){
    data = data.filter((item => countryVis[item.location] == true))

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

function eraseNodes(id){
    const htmlEl = document.getElementById(id);
    while (htmlEl.firstChild) {
        htmlEl.removeChild(htmlEl.firstChild);
    }
}

function drawChart(barChartData, lineChartData){
    const Bdata = lineChartData;

    let barChartActive = false
    document.getElementById("dateSlider").style.display="none";

    const countryList = [...new Set(lineChartData.map(item => item.country_name))]

    console.log(countryList)

    const checkboxList = document.getElementById('checkbox_list');
    countryList.forEach((countryName) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = countryName;

        checkbox.addEventListener('change', (event) => {
            const country = event.target.value;
            const isVisible = event.target.checked;
            if(isVisible) {
                countryVis[country] = true;
                d3.selectAll(`[class="${country}"]`).style("opacity", "1");
            }
            else {
                countryVis[country] = false;
                d3.selectAll(`[class="${country}"]`).style("opacity", "0");
            }
            if(barChartActive == true){
                eraseNodes("chart")
                eraseNodes("legend")
                drawBarChart(barChartData)
            }
        });

        const label = document.createElement('label');
        label.textContent = countryName;

        const checkboxItem = document.createElement('div');
        checkboxItem.classList.add('checkbox-item');
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);

        checkboxList.appendChild(checkboxItem);
    });

    // Add styling to the checkbox list container for scrolling
    checkboxList.style.overflowY = 'scroll';
    checkboxList.style.maxHeight = '200px';
    
    
    const radioButtons = document.querySelectorAll('.RadioButtons');
    radioButtons.forEach((radioButton) => {
        radioButton.addEventListener('change', (event) => {
            if (event.target.checked) {
                const selectedValue = event.target.value;
                console.log('Selected option:', selectedValue);
                if(selectedValue === "BarChart"){
                    document.getElementById("selectedDay").innerText = "";
                    document.getElementById("dateSlider").style.display="none";
                    barChartActive = true
                    eraseNodes("chart")
                    eraseNodes("legend")
                    drawBarChart(barChartData)
                }
                if(selectedValue === "LineChart"){
                    document.getElementById("dateSlider").style.display="block";
                    barChartActive = false;
                    eraseNodes("chart")
                    eraseNodes("legend")
                    console.log("here:", Bdata)
                    drawLineChart(Bdata)
                }
            }
        });
    });

}
