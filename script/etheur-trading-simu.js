var svg = d3.select("svg"),
  margin = { top: 50, right: 30, bottom: 110, left: 40 },
  margin2 = { top: 430, right: 30, bottom: 30, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  height2 = 500 - margin2.top - margin2.bottom,
  legendOffset = 20;

svg.attr(
  "viewBox",
  `0 0 ${width + margin.left + margin.right} ${
    height + margin.top + margin.bottom
  }`
);

var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  yBalance = d3.scaleLinear().range([height, 0]),
  x2 = d3.scaleTime().range([0, width]),
  y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
  yAxisLeft = d3.axisLeft(y).tickFormat((d) => d + "€"),
  yAxisRight = d3.axisRight(yBalance),
  xAxis2 = d3.axisBottom(x2);

var brush = d3
  .brushX()
  .extent([
    [0, 0],
    [width, height2],
  ])
  .on("brush end", brushed);

var zoom = d3
  .zoom()
  .scaleExtent([1, Infinity])
  .translateExtent([
    [0, 0],
    [width, height],
  ])
  .extent([
    [0, 0],
    [width, height],
  ]);
/*.on("zoom", zoomed)*/

var closingPriceLine1 = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x((d) => x(d.date))
  .y((d) => y(d.closingPrice));

var closingPriceLine2 = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x((d) => x2(d.date))
  .y((d) => y2(d.closingPrice));

svg
  .append("defs")
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

var focus = svg
  .append("g")
  .attr("class", "focus")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg
  .append("g")
  .attr("class", "context")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var identity = d3.zoomIdentity;

/* legends */
svg
  .append("line")
  .attr("x1", 5)
  .attr("y1", legendOffset)
  .attr("x2", 25)
  .attr("y2", legendOffset)
  .style("stroke-width", 4)
  .style("stroke", "steelblue")
  .style("fill", "none");
svg
  .append("text")
  .attr("x", 30)
  .attr("y", legendOffset + 5)
  .text("ETHEUR market price")
  .style("font-size", "1rem");
let signalsLegendG = svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${legendOffset})`);
signalsLegendG
  .append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", 6)
  .style("fill", "green");
signalsLegendG
  .append("text")
  .attr("x", 15)
  .attr("y", 5)
  .text("Buy Signal")
  .style("font-size", "1rem");
signalsLegendG
  .append("circle")
  .attr("cx", 0)
  .attr("cy", 25)
  .attr("r", 6)
  .style("fill", "red");
signalsLegendG
  .append("text")
  .attr("x", 15)
  .attr("y", 30)
  .text("Sell Signal")
  .style("font-size", "1rem");
svg
  .append("line")
  .attr("x1", width - 105)
  .attr("y1", legendOffset)
  .attr("x2", width - 85)
  .attr("y2", legendOffset)
  .style("stroke-width", 4)
  .style("stroke", "#cfb53b")
  .style("fill", "none");
svg
  .append("text")
  .attr("x", width - 80)
  .attr("y", legendOffset + 5)
  .text("Balance (base 100)")
  .style("font-size", "1rem");

const yAxisG = focus.append("g").attr("class", "axis axis--y");

const yAxisRightG = focus
  .append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + width + " ,0)");

const yMargin = 30;

d3.json("https://macd-definition.herokuapp.com/macd/?macdDefinitionId=1").then(
  function (json) {
    /* skip the first incomplete items (before 12+26+9) */
    json = json.filter((item) => item.macdValue && item.signalValue);

    let data = json.map((item) => ({
      ...item,
      date: new Date(item.timeEpochTimestamp * 1000),
    }));

    zoom.on("zoom", () => zoomed(data));

    x.domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    );
    let yMin = d3.min(data, (d) => d.closingPrice) - yMargin;
    let yMax = d3.max(data, (d) => d.closingPrice) + yMargin;
    y.domain([yMin, yMax]);
    yBalance.domain([0, 100]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus
      .append("path")
      .datum(data)
      .attr("class", "simu-line")
      .attr("d", closingPriceLine1);

    focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    yAxisG.call(yAxisLeft);
    yAxisRightG.call(yAxisRight);

    context
      .append("path")
      .datum(data)
      .attr("class", "simu-line")
      .attr("d", closingPriceLine2);

    context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    context
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

    svg
      .append("rect")
      .attr("class", "simu-zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    updateGraphs([width / 2, width]);
  }
);

/*
updates the scale using d3.zoomIdentity, it must do this as it needs to update the 
zoom function to reflect the current zoom scale and transform.
*/
function brushed() {
  /* check to see if the main body of the function should be executed */
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  updateGraphs(s);
}

/**
 * programmatically update the graphs
 * @param {*} s Array of two elements. Exemple [ 445, 890 ]
 */
function updateGraphs(s) {
  /* set a new x scale domain */
  x.domain(s.map(x2.invert, x2));
  /* update the closingPriceLine1 and axis */
  focus.select(".simu-line").attr("d", closingPriceLine1);
  focus.select(".axis--x").call(xAxis);
  svg
    .select(".simu-zoom")
    .call(
      zoom.transform,
      d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
    );
}

const highLightTradeEvent = domElement => {
  
  /* update graph */
  d3.selectAll('circle.trading-event')
    .remove();
  focus
    .append("circle")
    .attr("id", domElement.id)
    .attr("class", "trading-event")
    .attr("cx", () => domElement.dataset.x)
    .attr("cy", () => domElement.dataset.y)
    .attr("r", 10)
    .style("fill", domElement.dataset.color)
    .style("fill-opacity", 0.4)
    .style("stroke", domElement.dataset.color);

    /* update table element */
    document.querySelectorAll('#detail-list > li').forEach(elt => {
      elt.style.border = 'none';
    });
    domElement.style.border = `1px solid ${domElement.dataset.color}`; 
}

const tradeEventClickHandler = event => {

  const source = event.target;

  highLightTradeEvent(source);
}

/*
manually sets the brush, it must do this because the brush needs to be updated.
*/
function zoomed(json) {
  /* check to see if the main body of the function should be executed */
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  /* set a new x scale domain */
  var t = d3.event.transform;
  transform = t;
  x.domain(t.rescaleX(x2).domain());

  /* visibleData: data to compute MACD */
  const [dateMin, dateMax] = x.domain();
  let visibleData = json.slice();
  visibleData.sort((a, b) => a.timeEpochTimestamp - b.timeEpochTimestamp);
  visibleData = visibleData.filter(
    (element, index) => dateMin <= element.date && element.date <= dateMax
  );
  /* updates y scale for the main graph */
  let yMin = d3.min(visibleData, (d) => d.closingPrice) - yMargin;
  let yMax = d3.max(visibleData, (d) => d.closingPrice) + yMargin;
  y.domain([yMin, yMax]);
  yAxisG.call(yAxisLeft);

  /* update the closingPriceLine1 and axis */
  closingPriceLine1.y(function (d) {
    return y(d.closingPrice);
  });
  focus.select(".simu-line").attr("d", closingPriceLine1);
  focus.select(".axis--x").call(xAxis);

  /* update the balance line */
  const initialBalance = 100;
  const fees = 0.0026;
  let totalBalance = computeMacdSimulation(initialBalance, fees, visibleData);

  let yBalanceMax = d3.max(visibleData, (d) => d.trading.balance) + yMargin;
  yBalance.domain([0, yBalanceMax]);
  yAxisRightG.call(yAxisRight);

  var balanceLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => yBalance(d.trading.balance));
  var baselineBalanceLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => yBalance(initialBalance));

  focus.selectAll(".simu-balance-line").remove();
  focus
    .append("path")
    .datum(visibleData)
    .attr("class", "simu-balance-line")
    .attr("d", balanceLine);
  focus
    .append("path")
    .datum(visibleData)
    .attr("class", "simu-balance-line")
    .style("stroke-dasharray", "3, 3")
    .attr("d", baselineBalanceLine);

  let botPerformance = formatPerf(performance(initialBalance, totalBalance));

  const initialClosingPrice = visibleData[0].closingPrice;
  const finalClosingPrice = visibleData[visibleData.length - 1].closingPrice;
  let marketPerformance = formatPerf(
    performance(initialClosingPrice, finalClosingPrice)
  );

  document.getElementById(
    "titre"
  ).innerHTML = `profit ${botPerformance}% / market ${marketPerformance}%`;

  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));

  focus.selectAll("circle").remove();

  const listRef = document.getElementById("detail-list");
  listRef.innerHTML = "";
  let visited = false;
  /* trading events */
  for (item of visibleData) {
    if (item.trading && item.trading.event) {
      /* detail table */
      let message = formatDate(item.date) + ": ";
      if (item.trading.event === "BUY_SIGNAL") {
        message += `Buying ${item.trading.cryptoBalance.toFixed(2)} ETH `;
        message += `for ${item.closingPrice.toFixed(2)} € `;
      } else {
        message += `Selling ${item.trading.quantitySold.toFixed(2)} ETH `;
        message += `for ${item.closingPrice.toFixed(2)} € `;
      }
      message += `(payed fees ${item.trading.payedFees.toFixed(2)} €) `;
      message += `. Balance: ${item.trading.balance.toFixed(2)} € `;
      let li = document.createElement("li");
      const id = `${formatDate(item.date)}_${item.trading.event}`;
      li.id = id;
      li.dataset.x = x(item.date);
      li.dataset.y = y(item.closingPrice);
      let color = "red";
      if (item.trading.event === "BUY_SIGNAL") {
        color = "green";
      }
      li.dataset.color = color;
      li.innerHTML = message;

      li.addEventListener('click', 
        tradeEventClickHandler, 
        false);
      listRef.appendChild(li);

      /* first one is highlighted */
      if(!visited) {
        highLightTradeEvent(li);
        visited = true;
      }

      /* dots on the graph */
      focus
        .append("circle")
        .attr("cx", () => x(item.date))
        .attr("cy", () => y(item.closingPrice))
        .attr("r", 5)
        .style("fill", color);
    }
  }
}
