const window_dims = {
    width: window.innerWidth/2,
    height: window.innerHeight/2
};
const margin = window_dims.width * .05;

let promise_data = Promise.all([
    d3.json("./assets/gz_2010_us_040_00_20m.topojson"),
    d3.csv("./assets/output.csv"),
]);
function render(promise_data, yearValue) {
    const avg_gas = {
        2017: 2.24,
        2018: 2.86,
        2019: 2.71,
        2020: 2.17,
        2021: 3.33,
        2022: 3.29,
    }
    $('#container').html("");
    promise_data.then(data => {
        let topoJsonData = data[0];
        let ev_data = d3.group(data[1].filter(d => d.year === `${yearValue}`), d => d.state);
        const geoJsonData = topojson.feature(topoJsonData, topoJsonData.objects.gz_2010_us_040_00_20m);
        const pathGenerator = d3.geoPath().projection(d3.geoAlbersUsa().fitSize([window_dims.width - margin, window_dims.height - margin], geoJsonData))
        const colorScale = d3.scaleThreshold()
            .domain([1, 100, 1000, 10000, 100000, 1000000])
            .range(d3.schemeBlues[7]);
        const tooltip = d3.select('#tooltip')
        const state = d3.select("#us_state");
        const ev_regis = d3.select("#ev_regis");
        const avg_gas_price = d3.select("#avg_gas_price");
        // append path to the svg

        const svg = d3.select("#container").append("svg")
            .attr("viewBox", `0 0 ${window_dims.width} ${window_dims.height}`)
            .attr("width", "80%")
            .attr("height", "80%")

        const pathContainers = svg.selectAll('.geoPaths')
            .data(geoJsonData['features'])
            .enter()

        pathContainers.append("path")
            .attr("class", "geoPath")
            .attr("d", d => pathGenerator(d))
            .attr("fill", function (d) {
                // console.log(ev_data.get(d.properties.NAME.toString())[0]['registration'] || 0)
                if (ev_data.get(d.properties.NAME.toString()) !== undefined) {
                    d.total = ev_data.get(d.properties.NAME.toString())[0]['registration'] || 0;
                } else {
                    d.total = 0;
                }
                return colorScale(d.total);
            })
            .on("mouseenter", function (m, d) {
                d3.selectAll(".geoPath")
                    .transition()
                    .duration(200)
                    .style("opacity", .3)
                    .style("stroke", "transparent");
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr('style', "stroke:black")
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1)
                state.transition()
                    .duration(200)
                    .style("opacity", 1)
                ev_regis.transition()
                    .duration(200)
                    .style("opacity", 1)
                avg_gas_price.transition()
                    .duration(200)
                    .style("opacity", 1)
                tooltip.html(d.properties.NAME)
                    .style("left", m.clientX + "px")
                    .style("top", m.clientY + "px")
                state.html('State: ' + d.properties.NAME)
                if (ev_data.get(d.properties.NAME.toString()) !== undefined) {
                    ev_regis.html("EV Registration: <br>" + ev_data.get(d.properties.NAME.toString())[0]['registration']+ " units")
                } else {
                    ev_regis.html("EV Registration: 0")
                }
                avg_gas_price.html('Avg Gas Price: <br>$'+ avg_gas[yearValue]+' per gallon')
            })
            .on("mousemove", function (m, d) {
                d3.selectAll(".geoPath")
                    .transition()
                    .duration(200)
                    .style("opacity", .3)
                    .style("stroke", "transparent");
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr('style', "stroke:black")
                tooltip.style("opacity", 1)
                state.style("opacity", 1)
                ev_regis.style("opacity", 1)
                avg_gas_price.style("opacity", 1)
            })
            .on("mouseout", function (m, d) {
                d3.selectAll(".geoPath")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");
                tooltip.transition()
                    .duration(2000)
                    .style("opacity", 0)
                state.transition()
                    .duration(2000)
                    .style("opacity", 0)
                ev_regis.transition()
                    .duration(2000)
                    .style("opacity", 0)
                avg_gas_price.transition()
                    .duration(2000)
                    .style("opacity", 0)
            })
        pathContainers.exit().remove();
    })
}
let slider = document.getElementById("myRange");
let output = document.getElementById("demo");
output.innerHTML = slider.value;
render(promise_data, slider.value);
slider.oninput = function() {
    output.innerHTML = this.value;
    render(promise_data, this.value);
}
