d3.csv('population.csv').then(function (data) {
    const hierarchyData = {
      name: 'World',
      children: [],
    };
  
    data.forEach(function (d) {
      const continent = d.continent;
      const region = d.region;
      const country = d.country;
  
      let continentNode = hierarchyData.children.find(function (child) {
        return child.name === continent;
      });
  
      if (!continentNode) {
        continentNode = {
          name: continent,
          children: [],
          visible: true,
        };
        hierarchyData.children.push(continentNode);
      }
      let regionNode = continentNode.children.find(function (child) {
        return child.name === region;
      });
  
      if (!regionNode) {
        regionNode = {
          name: region,
          children: [],
          visible: true, 
        };
        continentNode.children.push(regionNode);
      }
  
      regionNode.children.push({
        name: country,
        visible: true,
      });
    });
  
    const treeLayout = d3.tree().size([800, 600]);
  
    const root = d3.hierarchy(hierarchyData);
  
    treeLayout(root);
  
    const countriesCount = root.leaves().length;
    const svgHeight = countriesCount * 30 + 100; 
  
    const svg = d3.select('#tree').append('svg')
      .attr('width', 1000)
      .attr('height', svgHeight);
  
    const nodes = svg.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y + 50}, ${d.x})`)
      .on('click', toggleChildren);
  
    nodes.append('circle')
      .attr('r', 4);

    nodes.append('text')
        .attr('x', d => d.children ? -8 : 8)
        .attr('dy', 3)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .style('opacity', d => d.depth === 3 ? 0 : 1)
        .text(d => {
        if (d.depth === 3) {
            const population = data.find(country => country.country === d.data.name).population;
            return `${d.data.name} (${population})`;
        } else {
            return d.data.name;
        }
        });

    const links = svg.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => `M${d.target.y + 50},${d.target.x}C${(d.source.y + d.target.y + 100) / 2},${d.target.x} ${(d.source.y + d.target.y + 100) / 2},${d.source.x} ${d.source.y + 100},${d.source.x}`);
      
    nodes.on('mouseover', function () {
      d3.select(this).select('text').style('opacity', 1);
    })
    .on('mouseout', function () {
        d3.select(this).select('text').style('opacity', d => d.depth === 3 ? 0 : 1);
    });
  
    function toggleChildren(d) {
      if (d.children) {
        d.data.visible = !d.data.visible; 
        updateNodes(d);
      }
    }
  
    function updateNodes(source) {
      root.descendants();
  
      const visibleNodes = root.descendants().filter(function (d) {
        return d.data.visible;
      });
      const visibleLinks = root.links().filter(function (d) {
        return d.source.data.visible && d.target.data.visible;
      });
  
      const nodeElements = svg.selectAll('.node')
        .data(visibleNodes, function (d) {
          return d.data.name;
        });
  
      const linkElements = svg.selectAll('.link')
        .data(visibleLinks, function (d) {
          return d.target.data.name;
        });
  
      nodeElements.exit().remove();
      linkElements.exit().remove();
  
      const enterNodes = nodeElements.enter().append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
          return `translate(${source.y + 50},${source.x})`;
        })
        .on('click', toggleChildren);
  
      enterNodes.append('circle')
        .attr('r', 4);
  
      enterNodes.append('text')
        .attr('x', function (d) {
          return d.children ? -8 : 8;
        })
        .attr('dy', 3)
        .attr('text-anchor', function (d) {
          return d.children ? 'end' : 'start';
        })
        .style('opacity', 0)
        .text(function (d) {
          return d.data.name;
        });
  
      const enterLinks = linkElements.enter().append('path')
        .attr('class', 'link')
        .attr('d', function (d) {
          return `M${source.y + 50},${source.x}C${(d.source.y + d.target.y + 100) / 2},${d.target.x} ${(d.source.y + d.target.y + 100) / 2},${d.source.x} ${d.source.y + 100},${d.source.x}`;
        });
  
      const updateNodes = enterNodes.merge(nodeElements);
      const updateLinks = enterLinks.merge(linkElements);
  
      updateNodes.transition()
        .duration(500)
        .attr('transform', function (d) {
          return `translate(${d.y + 50},${d.x})`;
        });
  
      updateLinks.transition()
        .duration(500)
        .attr('d', function (d) {
          return `M${d.target.y + 50},${d.target.x}C${(d.source.y + d.target.y + 100) / 2},${d.target.x} ${(d.source.y + d.target.y + 100) / 2},${d.source.x} ${d.source.y + 100},${d.source.x}`;
        });
    }
});

function pieChart(){
  const data = [
    { continent: 'Africa', population: 1435379662 },
    { continent: 'Asia', population: 4757802931 },
    { continent: 'Europe', population: 748980405 },
    { continent: 'North America', population: 375548665 },
    { continent: 'Oceania', population: 44293505 },
    { continent: 'South America', population: 441255589 },
  ];
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const legendWidth = 200;

    const color = d3.scaleOrdinal(d3.schemeAccent);

    const totalPopulation = d3.sum(data, d => d.population);

    data.forEach(d => {
    d.percentage = (d.population / totalPopulation) * 100;
    });

    const svg = d3.select('#pieChart').append('svg')
    .attr('width', width + legendWidth)
    .attr('height', height);

    const pieGroup = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
    .value(d => d.population)
    .sort(null);

    const slices = pieGroup.selectAll('.slice')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'slice');

    slices.append('path')
    .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
    )
    .attr('fill', (d, i) => color(i));

    const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width},${height / 2 - data.length * 15})`);

    legend.selectAll('.legend-item')
    .data(data)
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 30})`);

    legend.selectAll('.legend-item')
    .append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', (d, i) => color(i));

    legend.selectAll('.legend-item')
    .append('text')
    .attr('x', 20)
    .attr('y', 8)
    .attr('dy', '0.35em')
    .style('font-size', '14px')
    .text(d => `${d.continent} (${d.percentage.toFixed(2)}%)`);
  
    slices.on('click', function(d, ind) {
        let cc
        slices.select('path')
        .attr('stroke', 'none')
        .attr('fill', (d, i) => color(i));
    
        const selectedSlice = d3.select(this).select('path');
        const originalColor = selectedSlice.attr('fill');
        const brighterColor = d3.color(originalColor).brighter(0.5);
    
        selectedSlice
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('fill', brighterColor);

        console.log(data[ind.index].continent)
        console.log(top10Countries[data[ind.index].continent])
        generateBarChart(top10Countries[data[ind.index].continent])
    });
    
}
pieChart();

function generateBarChart(data) {
    d3.select('#topCountries').selectAll('*').remove();
    const chartWidth = 300;
    const chartHeight = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;
  
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.population)])
      .range([0, width]);
    const populationFormatter = d3.format('.2s');

    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => populationFormatter(d).replace('G', 'bln'));
  
    const barWidthScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.population)])
      .range([0, width]);
  
    const barChart = d3.select('#topCountries')
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([height, 0])
      .padding(0.1);
  
    const yAxis = d3.axisLeft(yScale);
  
    barChart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);
  
    barChart.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);
  
    const bars = barChart.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.country))
      .attr('width', d => barWidthScale(d.population))
      .attr('height', yScale.bandwidth())
      .attr('fill', 'steelblue');
  
    barChart.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Population');
  
    barChart.append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -margin.left + 10)
      .attr('y', -margin.top + 10)
      .attr('text-anchor', 'start')
      .text('Top 10 Country');
}

const top10Countries = {
Asia: [
    { country: 'China', population: 1444216107 },
    { country: 'India', population: 1393409038 },
    { country: 'Indonesia', population: 273523615 },
    { country: 'Pakistan', population: 220892340 },
    { country: 'Bangladesh', population: 166303498 },
    { country: 'Japan', population: 125360000 },
    { country: 'Philippines', population: 109581078 },
    { country: 'Vietnam', population: 97338579 },
    { country: 'Turkey', population: 84339067 },
    { country: 'Iran', population: 83992949 }
],
Africa: [
    { country: 'Nigeria', population: 211400708 },
    { country: 'Ethiopia', population: 128886595 },
    { country: 'Egypt', population: 104258327 },
    { country: 'DR Congo', population: 87615320 },
    { country: 'South Africa', population: 64051772 },
    { country: 'Tanzania', population: 61575995 },
    { country: 'Kenya', population: 61787000 },
    { country: 'Uganda', population: 45741000 },
    { country: 'Algeria', population: 43851044 },
    { country: 'Sudan', population: 43849260 }
],
Europe: [
    { country: 'Russia', population: 143895551 },
    { country: 'Germany', population: 83240525 },
    { country: 'United Kingdom', population: 67886004 },
    { country: 'France', population: 65273511 },
    { country: 'Italy', population: 60461826 },
    { country: 'Spain', population: 46733038 },
    { country: 'Ukraine', population: 43993643 },
    { country: 'Poland', population: 38386000 },
    { country: 'Romania', population: 19286123 },
    { country: 'Netherlands', population: 17141544 }
],
'North America': [
    { country: 'United States', population: 331002651 },
    { country: 'Mexico', population: 128932753 },
    { country: 'Canada', population: 37742154 },
    { country: 'Guatemala', population: 17915568 },
    { country: 'Cuba', population: 11326616 },
    { country: 'Haiti', population: 11402528 },
    { country: 'Dominican Republic', population: 10847910 },
    { country: 'Honduras', population: 9904607 },
    { country: 'Jamaica', population: 2961167 },
    { country: 'El Salvador', population: 6486205 }
],
'South America': [
    { country: 'Brazil', population: 212559417 },
    { country: 'Colombia', population: 50882891 },
    { country: 'Argentina', population: 45195774 },
    { country: 'Peru', population: 32971854 },
    { country: 'Venezuela', population: 28435940 },
    { country: 'Chile', population: 19116209 },
    { country: 'Ecuador', population: 17643054 },
    { country: 'Bolivia', population: 11673021 },
    { country: 'Paraguay', population: 7132538 },
    { country: 'Uruguay', population: 3473730 }
],
Oceania: [
    { country: 'Australia', population: 25788215 },
    { country: 'Papua New Guinea', population: 8947027 },
    { country: 'New Zealand', population: 4822233 },
    { country: 'Fiji', population: 896445 },
    { country: 'Solomon Islands', population: 686884 },
    { country: 'Samoa', population: 198410 },
    { country: 'Vanuatu', population: 307145 },
    { country: 'Kiribati', population: 119449 },
    { country: 'Micronesia', population: 115023 },
    { country: 'Tonga', population: 105695 }
]
};
  
