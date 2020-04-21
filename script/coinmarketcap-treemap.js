/* set the dimensions and margins of the graph */
const margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 445 - margin.left - margin.right,
  height = 445 - margin.top - margin.bottom;

/* append the svg object to the body of the page */
const svg = d3
  .select(".first-post-visualisation")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

d3.json(
  "https://coinmarketcap-px.herokuapp.com/cryptocurrency/listings/latest?start=1&limit=10&convert=EUR"
).then(function (data) {

  /* remove loader */
  d3.select(".first-post-visualisation .lds-container").remove();

  const formattedData = data.data.map((item) => ({
    name: item.symbol,
    value: item.quote.EUR.market_cap,
    percent24: item.quote.EUR.percent_change_24h,
  }));
  const treemap = {
    name: "cryptos",
    children: formattedData,
  };

  const root = d3.hierarchy(treemap).sum(function (d) {
    return d.value;
  });

  /* d3.treemap computes the position of each element of the hierarchy */
  d3.treemap().size([width, height]).padding(2)(root);

  /* use this information to add rectangles: */
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", d =>  d.data.percent24 > 0 ? "green" : "red")
        .style("fill-opacity", "0.8");

  /* add the text labels */
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d =>d.y0 + Math.trunc((d.y1 - d.y0) / 2))
        .append("tspan")
            .text(d => d.data.name)
            .attr("font-size", d => Math.trunc((d.x1 - d.x0) / 4) + "px")
            .attr("fill", "white")
            .style("overflow", "hidden")
        .append("tspan")
            .attr("x", d => d.x0 + 5)
            .attr("dy", d => Math.trunc((d.x1 - d.x0) / 4))
            .text(function (d) {
                let percent = Math.round((d.data.percent24 + Number.EPSILON) * 100) / 100;
                let sign = percent > 0 ? "+" : "";
                return sign + percent + "%";
            })
            .attr("font-size", d => Math.trunc((d.x1 - d.x0) / 4) + "px")
            .attr("fill", "white")
            .style("overflow", "hidden");
});
