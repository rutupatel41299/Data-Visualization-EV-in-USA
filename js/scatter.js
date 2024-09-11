function date_convert(obj){
    let date = new Date(obj);
    let   year = date.getFullYear();
    let  month = date.getMonth()+1;
    let dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    return year+'-' + month + '-'+dt;
}
const margins = {
    top: 60,
    bottom: 70,
    left: 40,
    right: 60
}


d3.csv("./assets/cleaned_data_gp_ev.csv", d =>{
    return{
        ev: Number(d['EV Total']),
        gp: Number(d['Average Price']),
        date: new Date(d.Date)
    }
}).then(data =>{
    const svg = d3.select("#container").append("svg");
    const height = 600;
    const width = 800;
    svg.attr("viewBox", `0 0 ${width} ${height}`)
    console.log(data)
    const ev_min_max = [d3.min(data, d=>d.ev), d3.max(data, d=>d.ev)]
    const gp_min_max = [d3.min(data, d=>d.gp), d3.max(data, d=>d.gp)]
    const tooltip = d3.select('#tooltip');

    const xScale = d3.scaleLinear()
        .domain(ev_min_max)
        .range([margins.left, 800-margins.right])

    const yScale = d3.scaleLinear()
        .domain(gp_min_max)
        .range([600-margins.bottom, margins.top])

    const xAxis = d3.axisBottom().scale(xScale)
    const yAxis = d3.axisLeft().scale(yScale)


    svg.append('g').attr("class", 'axis')
        .attr("transform", `translate(0, ${height-margins.bottom})`)
        .call(xAxis)
        .style('font-family', 'Helvetica')
        .style('font-size', 14);
    // .selectAll("text").attr("transform", "rotate(-90)").style("text-anchor", "end");
    svg.append('g').attr("class", 'axis')
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(yAxis)
        .style('font-family', 'Helvetica')
        .style('font-size', 14);

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .on('mouseover', function (d, i) {
            d3.select(this).transition().duration('100').attr("r", 8);
            tooltip.transition()
                .duration(100)
                .style("opacity", 1)
            tooltip.html("EV: "+Object.values(i)[0] +"<br>"+"Gas: "+Object.values(i)[1] + "<br>" + "Date: " + date_convert(Object.values(i)[2]) )
                .style("left", d.clientX + "px")
                .style("top", d.clientY + "px")
            console.log(d.clientX+"px")
        })
        .attr("cx", function (d) { return xScale(d.ev); } )
        .attr("cy", function (d) { return yScale(d.gp); } )
        .attr("r", 5)
        .style("fill", "#69b3a2")

        .on('mouseout', function (d, i) {
            d3.select(this).transition().duration('200').attr("r", 5);
            // div.transition().duration('200').style("opacity", 0);
            tooltip.transition()
                .duration(2000)
                .style("opacity", 0)
        });

    svg.selectAll('circle')
        .transition()
        .delay(function(d,i){return (i*30);}) .duration(function(d,i){return (2000+(i*2));})
        .ease(d3.easeBack)
        .attr("cx", function (d) { return xScale(d.ev); } )
        .attr("cy", function (d) { return yScale(d.gp); } )
        .attr("r", 5);

    svg.append('text')
        .attr('x', width/2 + 25)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 23)
        .text('Changes in EV sales and Gas Prices between January 2017 to June 2022 in USA');

    svg.append('text')
        .attr('x', width/2)
        .attr('y', 580)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        .text('Changes in EV sales');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(0,' + height/2 + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        .text('Changes in Gas Prices');

    var valueline = d3.line().x(function (d) {return xScale(d.ev);})
        .y(function (d) {return yScale(d.gp);});

    svg.append("path")
        .data([data])
        .interrupt()
        .attr("stroke-dasharray", `${ev_min_max}`)
        .transition()
        .delay(function(d,i){return (i*30);})
        .duration(function(d,i){return (2000+(i*2));})
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .attr("class", "line")
        .attr("d", valueline)
        .attr("stroke", "#32CD32")
        .attr("stroke-width", 0.5)
        .attr("fill", "#ffffff");

    console.log(ev_min_max);
    console.log(gp_min_max);

})
